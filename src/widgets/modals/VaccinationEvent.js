/* eslint-disable react/jsx-curly-newline */
/* eslint-disable react/forbid-prop-types */
import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
} from '../../globalStyles';
import { buttonStrings, generalStrings, modalStrings, vaccineStrings } from '../../localization';
import { PageButton } from '../PageButton';
import { NameNoteActions, VaccinePrescriptionActions } from '../../actions';
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

  const vaccinationEventNameNote = UIDatabase.get('NameNote', vaccinationEventId);
  const vaccinationEvent = vaccinationEventNameNote.data;
  const transaction = UIDatabase.get('Transaction', vaccinationEvent?.extra?.prescription?.id);
  const transactionBatch = UIDatabase.objects('TransactionBatch').filtered(
    'transaction.id == $0',
    transaction?.id
  )[0];

  const [isEditingTransaction, toggleEditTransaction] = useToggle(false);
  const [isModalOpen, toggleModal] = useToggle(false);
  const [vaccinator, setVaccinator] = useState(transactionBatch?.medicineAdministrator);
  const [vaccine, setVaccine] = useState(transactionBatch?.itemBatch?.item);
  const vaccineDropDownValues = vaccines.map(({ code, name }) => `${code}: ${name}`);

  const [{ updatedPcdForm, isPCDValid }, setPCDForm] = useState({
    updatedPcdForm: null,
    isPCDValid: false,
  });
  const [{ updatedSupplementalDataForm, isSupplementalDataValid }, setSupplementalData] = useState({
    updatedSupplementalDataForm: null,
    isSupplementalDataValid: false,
  });

  // User cannot edit 'Vaccination Event' panel if vaccination was done on a different tablet/store
  const tryEdit = useCallback(() => {
    if (!transaction) {
      toggleModal();
    } else {
      toggleEditTransaction();
    }
  }, [transaction]);

  const trySave = useCallback(() => {
    editTransaction(patient, transactionBatch);
  }, [patient, transactionBatch]);

  const { pcdNameNoteId } = vaccinationEvent;
  const surveyForm = pcdNameNoteId
    ? UIDatabase.get('NameNote', pcdNameNoteId)
    : selectMostRecentNameNote(patient, 'PCD', vaccinationEvent.entryDate);

  const customDataObject = vaccinationEvent?.extra?.prescription?.customData
    ? JSON.parse(vaccinationEvent.extra.prescription.customData)
    : {};

  const parsedVaccinationEvent = {
    ...vaccinationEvent,
    extra: {
      prescription: { ...vaccinationEvent.extra.prescription, customData: customDataObject },
    },
  };

  return (
    <FlexView>
      <FlexRow flex={1} style={localStyles.formContainer}>
        <FlexRow flex={1}>
          <View style={localStyles.formContainer}>
            {!!surveySchema && !!surveyForm ? (
              <FlexRow flex={1}>
                <View style={localStyles.formContainer}>
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
          <View style={localStyles.formContainer}>
            <Paper
              Header={
                <Title title={vaccineStrings.vaccine_event_supplemental_data_title} size="large" />
              }
              contentContainerStyle={{ flex: 1 }}
              style={{ flex: 1 }}
              headerContainerStyle={localStyles.title}
            >
              <JSONForm
                ref={supplementalFormRef}
                formData={customDataObject ?? null}
                surveySchema={supplementalDataSchema}
                onChange={(changed, validator) => {
                  setSupplementalData({
                    updatedSupplementalDataForm: changed.formData,
                    isSupplementalDataValid: validator(changed.formData),
                  });
                }}
              >
                <></>
              </JSONForm>
            </Paper>
          </View>
        </FlexRow>
        {!!vaccinationEventSchema && !!vaccinationEvent && (
          <FlexRow flex={1}>
            <View style={localStyles.formContainer}>
              <Paper
                Header={
                  <Title title={vaccineStrings.vaccine_event_transact_data_title} size="large" />
                }
                contentContainerStyle={{ flex: 1 }}
                style={{ flex: 1 }}
                headerContainerStyle={localStyles.title}
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
                        style={(localStyles.dropdown, { width: null, flex: 1 })}
                        values={vaccineDropDownValues}
                        onValueChange={(_, i) => setVaccine(vaccines[i])}
                        selectedValue={`${vaccine?.code}: ${vaccine?.name}`}
                      />
                    </FlexColumn>
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
          onPress={() => savePCDForm(surveyForm, updatedPcdForm)}
          style={localStyles.saveButton}
          textStyle={localStyles.saveButtonTextStyle}
          isDisabled={!isPCDValid}
        />
        <PageButton
          text={buttonStrings.save_changes}
          onPress={() =>
            saveSupplementalData(vaccinationEventNameNote, updatedSupplementalDataForm)
          }
          style={localStyles.saveButton}
          textStyle={localStyles.saveButtonTextStyle}
          isDisabled={!isSupplementalDataValid}
        />
        <PageButton
          text={isEditingTransaction ? buttonStrings.save_changes : buttonStrings.edit}
          style={localStyles.saveButton}
          textStyle={localStyles.saveButtonTextStyle}
          onPress={isEditingTransaction ? trySave : tryEdit}
        />
      </FlexRow>
      <PaperModalContainer isVisible={isModalOpen} onClose={toggleModal}>
        <PaperConfirmModal
          questionText={modalStrings.vaccine_event_not_editable}
          confirmText={modalStrings.confirm}
          onConfirm={toggleModal}
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
          customData: JSON.stringify(updatedSupplementalData),
        },
      },
    };
    dispatch(NameNoteActions.updateNameNote(vaccinationEventNameNote, updatedData));
  };

  const editTransaction = (patient, transactionBatch) => {
    dispatch(VaccinePrescriptionActions.returnVaccineToStock(patient.id, transactionBatch));
  };

  return { editTransaction, savePCDForm, saveSupplementalData };
};

const localStyles = StyleSheet.create({
  dropdown: { height: 35, marginTop: 0, marginBottom: 0, marginLeft: 0 },
  formContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'stretch',
  },
  saveButton: {
    ...globalStyles.button,
    flex: 1,
    backgroundColor: SUSSOL_ORANGE,
    alignSelf: 'center',
  },
  saveButtonTextStyle: {
    ...globalStyles.buttonText,
    color: 'white',
    fontSize: 14,
  },
  title: {
    textAlignVertical: 'center',
    fontWeight: 'bold',
    fontSize: 22,
    fontFamily: APP_FONT_FAMILY,
    color: DARKER_GREY,
  },
});

VaccinationEventComponent.defaultProps = {
  patient: {},
  vaccinationEventId: '',
};

VaccinationEventComponent.propTypes = {
  editTransaction: PropTypes.func.isRequired,
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
