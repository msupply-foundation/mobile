/* eslint-disable react/jsx-curly-newline */
/* eslint-disable react/forbid-prop-types */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ToastAndroid } from 'react-native';
import PropTypes from 'prop-types';
import { batch, connect } from 'react-redux';
import { FlexRow } from '../FlexRow';
import { JSONForm } from '../JSONForm/JSONForm';
import {
  selectSupplementalDataSchemas,
  selectSurveySchemas,
  selectVaccinationEventSchemas,
} from '../../selectors/formSchema';
import { FlexView } from '../FlexView';
import { UIDatabase } from '../../database';
import { selectMostRecentNameNote } from '../../selectors/Entities/nameNote';
import { FlexColumn } from '../FlexColumn';
import { BreachManUnhappy } from '../BreachManUnhappy';
import globalStyles, {
  APP_FONT_FAMILY,
  DARKER_GREY,
  GREY,
  SUSSOL_ORANGE,
  DANGER_RED,
  WARMER_GREY,
} from '../../globalStyles';
import { Spinner } from '..';
import { buttonStrings, generalStrings, modalStrings, vaccineStrings } from '../../localization';
import { PageButton } from '../PageButton';
import { NameActions, NameNoteActions, VaccinePrescriptionActions } from '../../actions';
import { Paper } from '../Paper';
import { Title } from '../JSONForm/fields';
import { useToggle } from '../../hooks';
import { VaccinatorDropDown } from '../VaccinatorDropDown';
import { DropDown } from '../DropDown';
import { PaperModalContainer } from '../PaperModal/PaperModalContainer';
import { PaperConfirmModal } from '../PaperModal/PaperConfirmModal';

// It's possible to get into this state if vaccination events were configured but PCD events weren't
// and someone dispensed a vaccine. Some data cleanup may be required.
export const NoPCDForm = () => (
  <FlexColumn flex={1} justifyContent="center" alignItems="center">
    <BreachManUnhappy size={250} />
    <Text style={{ fontFamily: APP_FONT_FAMILY, fontSize: 20, color: DARKER_GREY }}>
      {generalStrings.oh_no}
    </Text>
    <Text style={{ fontFamily: APP_FONT_FAMILY, textAlign: 'center', color: GREY }}>
      {generalStrings.no_pcd}
    </Text>
    <Text style={{ fontFamily: APP_FONT_FAMILY, textAlign: 'center', color: GREY }}>
      {generalStrings.please_contact_your_administrator}
    </Text>
  </FlexColumn>
);

export const VaccinationEventComponent = ({
  editTransaction,
  deleteVaccinationEvent,
  patient,
  savePCDForm,
  saveSupplementalData,
  supplementalDataSchema,
  surveySchema,
  vaccinationEventId,
  vaccinationEventSchema,
  vaccines,
}) => {
  const pcdFormRef = useRef(null);
  const supplementalFormRef = useRef(null);
  const vaccinationFormRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [vaccinationEventNameNote, setVaccinationEventNameNote] = useState();
  const [vaccinationEvent, setVaccinationEvent] = useState();
  const [transaction, setTransaction] = useState();
  const [isCurrentStoreVaccineEvent, setIsCurrentStoreVaccineEvent] = useState(false);
  const [transactionBatch, setTransactionBatch] = useState();
  const [alertText, setAlertText] = useState('Something went wrong');
  const [{ isDeletedVaccinationEvent }, setIsDeletedVaccinationEvent] = useState({
    isDeletedVaccinationEvent: false,
  });
  const [surveyForm, setSurveyForm] = useState();
  const [customDataObject, setCustomDataObject] = useState();
  const [parsedVaccinationEvent, setParsedVaccinationEvent] = useState();
  const [vaccineDropDownValues, setVaccineDropDownValues] = useState([]);
  const [vaccinator, setVaccinator] = useState();
  const [vaccine, setVaccine] = useState();

  const [isEditingTransaction, toggleEditTransaction] = useToggle(false);
  const [isModalOpen, toggleModal] = useToggle(false);
  const [isDeleteModalOpen, toggleDeleteModal] = useToggle(false);

  const [{ updatedPcdForm, isPCDValid }, setPCDForm] = useState({
    updatedPcdForm: null,
    isPCDValid: true,
  });

  const [{ updatedSupplementalDataForm, isSupplementalDataValid }, setSupplementalData] = useState({
    updatedSupplementalDataForm: null,
    isSupplementalDataValid: true,
  });

  useEffect(() => {
    setVaccineDropDownValues(
      vaccines
        .filter(v => v.totalQuantity !== 0)
        .map(({ id, code, name }) => ({
          id,
          name: `${code}: ${name}`,
        }))
    );

    setVaccinationEventNameNote(UIDatabase.get('NameNote', vaccinationEventId));
  }, [vaccines, vaccinationEventId]);

  useEffect(() => {
    if (vaccinationEventNameNote?.data) {
      setVaccinationEvent(vaccinationEventNameNote?.data);
    }

    if (vaccinationEventNameNote?.isDeleted) {
      setIsDeletedVaccinationEvent({
        isDeletedVaccinationEvent: !!vaccinationEventNameNote?.isDeleted,
      });
    }
  }, [vaccinationEventNameNote]);

  useEffect(() => {
    if (vaccinationEvent) {
      const result = vaccinationEvent?.extra?.prescription?.customData
        ? JSON.parse(vaccinationEvent.extra.prescription.customData)
        : {};

      setCustomDataObject(result);

      const result2 = {
        ...vaccinationEvent,
        extra: {
          prescription: { ...vaccinationEvent.extra.prescription, customData: result },
        },
      };
      setParsedVaccinationEvent(result2);

      const { pcdNameNoteId } = vaccinationEvent;
      const surveyFormData = pcdNameNoteId
        ? UIDatabase.get('NameNote', pcdNameNoteId)
        : selectMostRecentNameNote(patient, 'PCD', vaccinationEvent.entryDate);
      setSurveyForm(surveyFormData);

      setTransaction(UIDatabase.get('Transaction', vaccinationEvent?.extra?.prescription?.id));
      const nameNoteStoreName = vaccinationEvent?.storeName;

      const localString = modalStrings.vaccine_event_not_editable_store;

      const alert = nameNoteStoreName
        ? modalStrings.formatString(localString, nameNoteStoreName)
        : modalStrings.vaccine_event_not_editable;
      setAlertText(alert);
    }
  }, [vaccinationEvent]);

  useEffect(() => {
    if (customDataObject) {
      setSupplementalData(prevState => ({
        ...prevState,
        updatedSupplementalDataForm: customDataObject,
      }));
      setLoading(false);
    }
  }, [customDataObject]);

  useEffect(() => {
    if (transaction?.id) {
      setIsCurrentStoreVaccineEvent(true);
      const result = UIDatabase.objects('TransactionBatch').filtered(
        'transaction.id == $0',
        transaction?.id
      )[0];

      setTransactionBatch(result);
    }
  }, [transaction]);

  useEffect(() => {
    if (transactionBatch) {
      setVaccinator(transactionBatch?.medicineAdministrator);
      setVaccine(vaccines.filter(item => item.id === transactionBatch?.itemId)[0]);
    }
  }, [transactionBatch]);

  // User cannot edit 'Vaccination Event' panel if vaccination was done on a different tablet/store
  const tryEdit = useCallback(() => {
    if (!isCurrentStoreVaccineEvent) {
      toggleModal();
    } else {
      toggleEditTransaction();
    }
  }, [isCurrentStoreVaccineEvent]);

  const trySave = useCallback(() => {
    setIsDeletedVaccinationEvent({
      isDeletedVaccinationEvent: true,
    });
    const vaccineChanged = vaccine.code !== transactionBatch?.itemBatch?.item?.code;
    const vaccinatorChanged =
      JSON.stringify(vaccinator) !== JSON.stringify(transactionBatch.medicineAdministrator);

    if (vaccineChanged || vaccinatorChanged) {
      editTransaction(
        patient,
        transactionBatch,
        vaccine,
        vaccinator,
        updatedSupplementalDataForm,
        vaccinationEventNameNote
      );
      toggleEditTransaction();
    } else {
      setIsDeletedVaccinationEvent({
        isDeletedVaccinationEvent: false,
      });
      ToastAndroid.show(vaccineStrings.vaccination_not_updated, ToastAndroid.LONG);
    }
  }, [
    patient,
    transactionBatch,
    vaccine,
    vaccinator,
    updatedSupplementalDataForm,
    vaccinationEventNameNote,
  ]);

  const tryDelete = useCallback(() => {
    deleteVaccinationEvent(patient, transactionBatch, vaccinationEventNameNote);
    toggleDeleteModal();
    toggleEditTransaction();
    setIsDeletedVaccinationEvent({
      isDeletedVaccinationEvent: true,
    });
  }, [patient, transactionBatch, vaccinationEventNameNote]);

  if (loading) {
    return (
      <View style={globalStyles.loadingIndicatorContainer}>
        <Spinner isSpinning={loading} color={SUSSOL_ORANGE} />
      </View>
    );
  }

  const isDisabled = isDeletedVaccinationEvent || !isCurrentStoreVaccineEvent;

  const styles = getStyles({ isDisabled });

  return (
    <FlexView>
      <FlexRow flex={1} style={styles.formContainer}>
        <FlexRow flex={1}>
          <View style={styles.formContainer}>
            {!!surveySchema && !!surveyForm ? (
              <FlexRow flex={1}>
                <View style={styles.formContainer}>
                  <JSONForm
                    ref={pcdFormRef}
                    formData={surveyForm.data ?? null}
                    surveySchema={surveySchema}
                    onChange={(changed, validator) => {
                      setPCDForm({
                        updatedPcdForm: changed.formData,
                        isPCDValid: validator(changed.formData),
                      });
                    }}
                    disabled={isDisabled}
                  >
                    <></>
                  </JSONForm>
                </View>
              </FlexRow>
            ) : (
              <NoPCDForm />
            )}
          </View>
        </FlexRow>
        <FlexRow flex={1}>
          <View style={styles.formContainer}>
            {!!supplementalDataSchema && !!updatedSupplementalDataForm ? (
              <Paper
                // eslint-disable-next-line prettier/prettier
                Header={(
                  <Title
                    title={vaccineStrings.vaccine_event_supplemental_data_title}
                    size="large"
                  />
                  // eslint-disable-next-line prettier/prettier
                )}
                contentContainerStyle={{ flex: 1 }}
                style={{ flex: 1 }}
                headerContainerStyle={styles.title}
              >
                <JSONForm
                  ref={supplementalFormRef}
                  formData={updatedSupplementalDataForm}
                  surveySchema={supplementalDataSchema}
                  onChange={(changed, validator) => {
                    setSupplementalData({
                      updatedSupplementalDataForm: changed.formData,
                      isSupplementalDataValid: validator(changed.formData),
                    });
                  }}
                  disabled={isDisabled}
                >
                  <></>
                </JSONForm>
              </Paper>
            ) : (
              <NoPCDForm />
            )}
          </View>
        </FlexRow>
        {!!vaccinationEventSchema && !!vaccinationEvent && !!parsedVaccinationEvent && (
          <FlexRow flex={1}>
            <View style={styles.formContainer}>
              <Paper
                Header={
                  <Title title={vaccineStrings.vaccine_event_transact_data_title} size="large" />
                }
                contentContainerStyle={{ flex: 1 }}
                style={{ flex: 1 }}
                headerContainerStyle={styles.title}
              >
                {!isEditingTransaction ? (
                  <JSONForm
                    ref={vaccinationFormRef}
                    disabled={true}
                    formData={parsedVaccinationEvent ?? null}
                    surveySchema={vaccinationEventSchema}
                  >
                    <></>
                  </JSONForm>
                ) : (
                  <FlexView>
                    <FlexColumn flex={1}>
                      <Text style={[globalStyles.text, { marginTop: 20, fontSize: 14 }]}>
                        {vaccineStrings.vaccine_event_transact_data_description}
                      </Text>
                      <Title title={vaccineStrings.vaccinator} size="medium" />
                      <VaccinatorDropDown
                        onChange={setVaccinator}
                        value={vaccinator}
                        style={{ width: null, flex: 1 }}
                      />
                      <Title title={vaccineStrings.vaccines} size="medium" />
                      <DropDown
                        isDisabled={vaccineDropDownValues.length === 0}
                        style={(styles.dropdown, { width: null, flex: 1 })}
                        values={vaccineDropDownValues.map(item => item.name)}
                        onValueChange={(_, i) => {
                          const selectedVaccine = vaccines.find(
                            item => item.id === vaccineDropDownValues[i].id
                          );
                          return setVaccine(selectedVaccine);
                        }}
                        selectedValue={`${vaccine?.code}: ${vaccine?.name}`}
                      />
                    </FlexColumn>
                    <FlexRow flex={1} style={{ marginBottom: 10 }}>
                      <PageButton
                        text={buttonStrings.delete_vaccination_event}
                        onPress={toggleDeleteModal}
                        style={styles.deleteButton}
                        textStyle={styles.saveButtonTextStyle}
                      />
                    </FlexRow>
                    <FlexRow flex={1} style={{ marginBottom: 10 }}>
                      <PageButton
                        style={{ flex: 1, alignSelf: 'flex-end' }}
                        text="Cancel Editing"
                        onPress={toggleEditTransaction}
                      />
                    </FlexRow>
                  </FlexView>
                )}
              </Paper>
            </View>
          </FlexRow>
        )}
      </FlexRow>
      <FlexRow flex={0} justifyContent="center">
        <PageButton
          text={buttonStrings.save_changes}
          onPress={() =>
            !isCurrentStoreVaccineEvent ? toggleModal() : savePCDForm(surveyForm, updatedPcdForm)
          }
          style={styles.saveButton}
          textStyle={styles.saveButtonTextStyle}
          isDisabled={!isPCDValid || isDeletedVaccinationEvent || !(!!surveySchema && !!surveyForm)}
        />
        <PageButton
          text={buttonStrings.save_changes}
          onPress={() =>
            !isCurrentStoreVaccineEvent
              ? toggleModal()
              : saveSupplementalData(vaccinationEventNameNote, updatedSupplementalDataForm)
          }
          style={styles.saveButton}
          textStyle={styles.saveButtonTextStyle}
          isDisabled={
            !isSupplementalDataValid ||
            isDeletedVaccinationEvent ||
            !(!!vaccinationEventSchema && !!vaccinationEvent && !!parsedVaccinationEvent)
          }
        />
        <PageButton
          text={isEditingTransaction ? buttonStrings.save_changes : buttonStrings.edit}
          style={styles.saveButton}
          textStyle={styles.saveButtonTextStyle}
          onPress={isEditingTransaction ? trySave : tryEdit}
          isDisabled={isDeletedVaccinationEvent}
        />
      </FlexRow>
      <PaperModalContainer isVisible={isModalOpen} onClose={toggleModal}>
        <PaperConfirmModal
          questionText={alertText}
          confirmText={modalStrings.confirm}
          onConfirm={toggleModal}
        />
      </PaperModalContainer>
      <PaperModalContainer isVisible={isDeleteModalOpen} onClose={toggleDeleteModal}>
        <PaperConfirmModal
          questionText={modalStrings.delete_vaccination_event}
          confirmText={modalStrings.delete}
          cancelText={modalStrings.cancel}
          onConfirm={tryDelete}
          onCancel={toggleDeleteModal}
        />
      </PaperModalContainer>
    </FlexView>
  );
};

const mapStateToProps = () => {
  const surveySchemas = selectSurveySchemas();
  const [surveySchema] = surveySchemas;

  const vaccinationEventSchemas = selectVaccinationEventSchemas();
  const [vaccinationEventSchema] = vaccinationEventSchemas;

  const supplementalDataSchemas = selectSupplementalDataSchemas();
  const [supplementalDataSchema] = supplementalDataSchemas;

  const vaccines = UIDatabase.objects('Vaccine').sorted('name');

  return {
    supplementalDataSchema,
    surveySchema,
    vaccinationEventSchema,
    vaccines,
  };
};

const mapDispatchToProps = dispatch => {
  const savePCDForm = (oldSurveyNote, updatedSurveyData) => {
    dispatch(NameNoteActions.updateNameNote(oldSurveyNote, updatedSurveyData));
  };

  const saveSupplementalData = (vaccinationEventNameNote, updatedSupplementalData) => {
    const vaccinationEvent = vaccinationEventNameNote.data;

    const updatedData = {
      ...vaccinationEvent,
      extra: {
        ...vaccinationEvent.extra,
        prescription: {
          ...vaccinationEvent.extra.prescription,
          customData: updatedSupplementalData,
        },
      },
    };
    dispatch(NameNoteActions.updateNameNote(vaccinationEventNameNote, updatedData));
  };

  const editTransaction = (
    patient,
    transactionBatch,
    vaccine,
    vaccinator,
    supplementalData,
    vaccinationEventNameNote
  ) => {
    batch(() => {
      dispatch(VaccinePrescriptionActions.returnVaccineToStock(patient.id, transactionBatch));
      dispatch(NameActions.select(patient));
      dispatch(VaccinePrescriptionActions.selectVaccinator(vaccinator));
      dispatch(VaccinePrescriptionActions.selectVaccine(UIDatabase.get('Item', vaccine.id)));
      dispatch(VaccinePrescriptionActions.selectSupplementalData(supplementalData));
      dispatch(VaccinePrescriptionActions.confirm());
      dispatch(NameNoteActions.deleteNameNote(vaccinationEventNameNote));
    });
  };

  const deleteVaccinationEvent = (patient, transactionBatch, vaccinationEventNameNote) => {
    batch(() => {
      dispatch(VaccinePrescriptionActions.returnVaccineToStock(patient.id, transactionBatch));
      dispatch(NameNoteActions.deleteNameNote(vaccinationEventNameNote));
    });
  };

  return { editTransaction, savePCDForm, saveSupplementalData, deleteVaccinationEvent };
};

const getStyles = context => ({
  dropdown: { height: 35, marginTop: 0, marginBottom: 0, marginLeft: 0 },
  formContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'stretch',
  },
  title: {
    textAlignVertical: 'center',
    fontWeight: 'bold',
    fontSize: 22,
    fontFamily: APP_FONT_FAMILY,
    color: DARKER_GREY,
  },
  deleteButton: {
    ...globalStyles.button,
    flex: 1,
    backgroundColor: DANGER_RED,
    alignSelf: 'center',
  },
  saveButton: [
    {
      ...globalStyles.button,
      flex: 1,
      backgroundColor: SUSSOL_ORANGE,
      alignSelf: 'center',
    },
    context.isDisabled && { backgroundColor: WARMER_GREY },
  ],
  saveButtonTextStyle: {
    ...globalStyles.buttonText,
    color: 'white',
    fontSize: 14,
  },
});

VaccinationEventComponent.defaultProps = {
  patient: {},
  vaccinationEventId: '',
};

VaccinationEventComponent.propTypes = {
  editTransaction: PropTypes.func.isRequired,
  deleteVaccinationEvent: PropTypes.func.isRequired,
  patient: PropTypes.object,
  savePCDForm: PropTypes.func.isRequired,
  saveSupplementalData: PropTypes.func.isRequired,
  supplementalDataSchema: PropTypes.object.isRequired,
  surveySchema: PropTypes.object.isRequired,
  vaccinationEventId: PropTypes.string,
  vaccinationEventSchema: PropTypes.object.isRequired,
  vaccines: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
};

export const VaccinationEvent = connect(
  mapStateToProps,
  mapDispatchToProps
)(VaccinationEventComponent);
