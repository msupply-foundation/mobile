/* eslint-disable no-undef */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { ActivityIndicator, Keyboard, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import { batch, connect } from 'react-redux';
import { ModalContainer } from '../modals';
import { FormControl } from '../FormControl';
import { PageButton } from '../PageButton';
import { FlexRow } from '../FlexRow';
import { FlexView } from '../FlexView';
import { PageButtonWithOnePress } from '../PageButtonWithOnePress';
import { PaperModalContainer } from '../PaperModal/PaperModalContainer';
import { PaperConfirmModal } from '../PaperModal/PaperConfirmModal';

import { selectSpecificEntityState } from '../../selectors/Entities';

import { createDefaultName, NameActions } from '../../actions/Entities/NameActions';
import { WizardActions } from '../../actions/WizardActions';
import { VaccinePrescriptionActions } from '../../actions/Entities/VaccinePrescriptionActions';
import { FormActions } from '../../actions/FormActions';
import { selectPatientSearchFormConfig } from '../../selectors/Entities/vaccinePrescription';
import { getColumns } from '../../pages/dataTableUtilities';

import { MODALS } from '../constants';
import {
  buttonStrings,
  dispensingStrings,
  generalStrings,
  modalStrings,
  vaccineStrings,
} from '../../localization';
import globalStyles, { DARK_GREY } from '../../globalStyles';
import { NameNoteActions } from '../../actions/Entities/NameNoteActions';
import { AfterInteractions } from '../AfterInteractions';
import { generateUUID, UIDatabase } from '../../database/index';
import { useKeyboardIsOpen } from '../../hooks/useKeyboardIsOpen';
import { Paper } from '../Paper';
import { selectCompletedForm } from '../../selectors/form';

import { DARKER_GREY, SUSSOL_ORANGE } from '../../globalStyles/colors';

import { useLocalAndRemotePatients } from '../../hooks/useLocalAndRemotePatients';
import { APP_FONT_FAMILY, APP_GENERAL_FONT_SIZE } from '../../globalStyles/fonts';
import { useLoadingIndicator } from '../../hooks/useLoadingIndicator';
import { useToggle } from '../../hooks/useToggle';
import { QrScannerModal } from '../modals/QrScannerModal';
import {
  getAuthorizationHeader,
  getPatientRequestUrl,
  processPatientResponse,
} from '../../sync/lookupApiUtils';
import { SETTINGS_KEYS } from '../../settings/index';
import { DataTable, DataTableRow, DataTableHeaderRow } from '../DataTable';
import { selectVaccinePatientHistory } from '../../selectors/Entities/name';
import { PatientHistoryModal } from '../modals/PatientHistory';
import { VaccinationEvent } from '../modals/VaccinationEvent';

const getMessage = (noResults, error) => {
  if (noResults) return generalStrings.could_not_find_patient;
  if (error) return generalStrings.error_communicating_with_server;
  return generalStrings.enter_patient_details;
};

const EmptyComponent = ({ loading, error, searchedWithNoResults }) => (
  <FlexView flex={1} justifyContent="center" alignItems="center" style={{ marginTop: 20 }}>
    {loading ? (
      <ActivityIndicator color={SUSSOL_ORANGE} size="small" />
    ) : (
      <Text style={{ fontFamily: APP_FONT_FAMILY, fontSize: APP_GENERAL_FONT_SIZE }}>
        {getMessage(searchedWithNoResults, error)}
      </Text>
    )}
  </FlexView>
);

const Header = ({ onSearchOnline, onNewPatient, loading, toggleQrModal }) => (
  <FlexRow justifyContent="center" alignItems="center">
    <Text style={localStyles.text}>{vaccineStrings.vaccine_dispense_step_one_title}</Text>
    <View style={{ flex: 1, marginLeft: 'auto' }} />
    <PageButton text={modalStrings.qr_scanner_header} onPress={toggleQrModal} />
    <PageButton
      style={{ marginLeft: 10 }}
      text={generalStrings.search_online}
      onPress={onSearchOnline}
      isDisabled={loading}
    />
    <PageButton
      style={{ marginLeft: 10 }}
      text={`${dispensingStrings.new} ${dispensingStrings.patient}`}
      onPress={onNewPatient}
    />
  </FlexRow>
);

const GettingMore = ({ gettingMore }) =>
  gettingMore ? (
    <FlexRow flex={1} justifyContent="center" alignItems="space-between" style={localStyles.more}>
      <Text style={localStyles.text}>{generalStrings.finding_more_patients}</Text>
      <ActivityIndicator color={SUSSOL_ORANGE} size="small" />
    </FlexRow>
  ) : null;

GettingMore.propTypes = {
  gettingMore: PropTypes.bool.isRequired,
};

Header.propTypes = {
  onSearchOnline: PropTypes.func.isRequired,
  onNewPatient: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  toggleQrModal: PropTypes.func.isRequired,
};

EmptyComponent.propTypes = {
  loading: PropTypes.bool.isRequired,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]).isRequired,
  searchedWithNoResults: PropTypes.bool.isRequired,
};

/**
 * Layout component used for a tab within the vaccine prescription wizard.
 *
 * @prop {Func}   createPatient         Callback for creating a patient.
 * @prop {object} formConfig            Configuration of the search form
 * @prop {Func}   onCancelPrescription  Cancels the prescription and returns to the vaccine page
 * @prop {Func}   selectPatient         Callback for selecting a patient.
 * @prop {Func}   updateForm            Callback for updating form.
 * @prop {object} completedForm         The completed form object.
 *
 */
const PatientSelectComponent = ({
  createPatient,
  formConfig,
  onCancelPrescription,
  selectPatient,
  updateForm,
  completedForm,
}) => {
  const withLoadingIndicator = useLoadingIndicator();
  const [isQrModalOpen, toggleQrModal] = useToggle();
  const [isDeceasedModalOpen, toggleIsDeceasedAlert] = useToggle(false);
  const [{ history, patient } = {}, setPatientHistory] = useState({});
  const [vaccinationEvent, setVaccinationEvent] = useState(null);

  const hapticFeedBackOptions = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };

  const onQrCodeRead = ({ data }) => {
    ReactNativeHapticFeedback.trigger('notificationSuccess', hapticFeedBackOptions);

    // Immediately reject QR code if it is too long (length > 50 chosen somewhat arbitrarily until
    // we get a better idea of the kinds of codes we need to handle in future)
    if (data.length > 50) {
      ToastAndroid.show(generalStrings.invalid_qr_code, ToastAndroid.LONG);
      return;
    }

    toggleQrModal();

    const matchedLocalPatient = UIDatabase.objects('Name').filtered('barcode == $0', data)[0];

    // Do local search
    if (matchedLocalPatient) {
      selectPatient(matchedLocalPatient);
    } else {
      // Do a remote search
      withLoadingIndicator(async () => {
        try {
          const remotePatient = await lookupRemotePatient({ barcode: data });
          if (remotePatient.length) {
            selectPatient(remotePatient[0]);
          } else {
            throw new Error(generalStrings.could_not_find_patient_qr);
          }
        } catch (error) {
          ToastAndroid.show(error.message, ToastAndroid.LONG);
        }
      });
    }
  };

  const [
    { data, loading, gettingMore, searchedWithNoResults, error },
    onSearchOnline,
    filter,
    getMorePatients,
  ] = useLocalAndRemotePatients([]);

  const columns = React.useMemo(() => {
    if (UIDatabase.get('PatientEvent', 'vaccination', 'code')) {
      return getColumns(MODALS.VACCINE_PATIENT_LOOKUP);
    }
    return getColumns(MODALS.PATIENT_LOOKUP);
  }, []);
  const { pageTopViewContainer } = globalStyles;
  const keyboardIsOpen = useKeyboardIsOpen();

  const handleUpdate = useMemo(
    (key, value) => {
      updateForm(key, value);
      filter({ ...completedForm, [key]: value });
    },
    [completedForm, updateForm]
  );

  const lookupRemotePatient = async params => {
    const syncUrl = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_URL);
    const url = `${syncUrl}${getPatientRequestUrl(params)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { authorization: getAuthorizationHeader() },
    });
    const responseJson = await response.json();
    return processPatientResponse({ ...response, json: responseJson });
  };

  const renderHeader = useCallback(
    () => <DataTableHeaderRow columns={columns} isSortable={false} />,
    [columns]
  );

  const getCallback = colKey => {
    switch (colKey) {
      case 'patientHistory':
        return patientId => {
          const foundPatient = UIDatabase.get('Name', patientId);
          console.log(foundPatient);
          const patientsPreviousVaccinations = selectVaccinePatientHistory(foundPatient);

          setPatientHistory({ patient: foundPatient, history: patientsPreviousVaccinations });
        };
      default:
        return null;
    }
  };

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const keyExtractor = ({ id }) => id;

      return (
        <DataTableRow
          rowData={data[index]}
          getCallback={getCallback}
          rowKey={keyExtractor(item)}
          columns={columns}
          onPress={name => {
            const selectedPatient = UIDatabase.get('Name', name?.id);
            if (selectedPatient.isDeceased) {
              toggleIsDeceasedAlert();
              return;
            }

            // Only show a spinner when the name doesn't exist in the database, as we need to
            // send a request to the server to add a name store join.
            if (selectedPatient) {
              selectPatient(name);
            } else {
              withLoadingIndicator(() => selectPatient(name));
            }
          }}
          rowIndex={index}
        />
      );
    },
    [data]
  );

  return (
    <FlexView style={pageTopViewContainer}>
      <Paper
        style={{ flex: 6 }}
        contentContainerStyle={{ flex: 1 }}
        headerContainerStyle={{ height: 60 }}
        headerText={vaccineStrings.vaccine_dispense_step_one_title}
        Header={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <Header
            loading={loading}
            onSearchOnline={() => onSearchOnline(completedForm)}
            onNewPatient={createPatient}
            toggleQrModal={toggleQrModal}
          />
        }
      >
        <AfterInteractions placeholder={null}>
          <View style={localStyles.container}>
            <View style={localStyles.formContainer}>
              <FormControl
                inputConfig={formConfig}
                onUpdate={handleUpdate}
                showCancelButton={false}
                showSaveButton={false}
                saveButtonText={generalStrings.search}
              />
            </View>

            <View style={localStyles.listContainer}>
              <DataTable
                renderHeader={renderHeader}
                renderRow={renderRow}
                onEndReached={() => getMorePatients(completedForm)}
                data={data}
                columns={columns}
                ListFooterComponent={<GettingMore gettingMore={gettingMore} />}
                ListEmptyComponent={
                  // eslint-disable-next-line react/jsx-wrap-multilines
                  <EmptyComponent
                    searchedWithNoResults={searchedWithNoResults}
                    error={error}
                    loading={loading}
                  />
                }
              />
            </View>
          </View>
        </AfterInteractions>
      </Paper>
      {!keyboardIsOpen && (
        <FlexRow>
          <PageButtonWithOnePress text={buttonStrings.cancel} onPress={onCancelPrescription} />
        </FlexRow>
      )}
      <QrScannerModal isOpen={isQrModalOpen} onBarCodeRead={onQrCodeRead} onClose={toggleQrModal} />
      <ModalContainer
        isVisible={!!patient && !vaccinationEvent}
        onClose={() => setPatientHistory({})}
        title={`${dispensingStrings.vaccination_history} ${patient?.name}`}
      >
        <PatientHistoryModal
          patientHistory={history}
          patientId={patient?.id || ''}
          sortKey="itemName"
          isVaccine={true}
          selectVaccination={setVaccinationEvent}
        />
      </ModalContainer>
      <ModalContainer
        isVisible={!!patient && !!vaccinationEvent}
        onClose={() => setVaccinationEvent(null)}
        title={`${dispensingStrings.vaccination_details}`}
      >
        <VaccinationEvent vaccinationEventId={vaccinationEvent?.id} patient={patient} />
      </ModalContainer>
      <PaperModalContainer isVisible={isDeceasedModalOpen} onClose={toggleIsDeceasedAlert}>
        <PaperConfirmModal
          questionText={modalStrings.deceased_patient_vaccination}
          confirmText={generalStrings.ok}
          onConfirm={toggleIsDeceasedAlert}
        />
      </PaperModalContainer>
    </FlexView>
  );
};

const mapDispatchToProps = dispatch => {
  const onCancelPrescription = () => dispatch(VaccinePrescriptionActions.cancel());

  const selectPatient = patient =>
    batch(async () => {
      Keyboard.dismiss();
      const selectedPatient = await dispatch(NameActions.select(patient));

      if (selectedPatient && !selectedPatient.isDeceased) {
        dispatch(NameNoteActions.createSurveyNameNote(selectedPatient));
        dispatch(WizardActions.nextTab());
      }
    });

  const createPatient = () =>
    batch(() => {
      const id = generateUUID();
      const patient = createDefaultName('patient', id);
      dispatch(NameActions.create(patient));
      dispatch(NameNoteActions.createSurveyNameNote(patient));
      dispatch(WizardActions.nextTab());
    });
  const updateForm = (key, value) => dispatch(FormActions.updateForm(key, value));

  return {
    createPatient,
    onCancelPrescription,
    selectPatient,
    updateForm,
  };
};

const mapStateToProps = state => {
  const patientState = selectSpecificEntityState(state, 'name');
  const { searchTerm, sortKey, isAscending } = patientState;

  const completedForm = selectCompletedForm(state);
  const formConfig = selectPatientSearchFormConfig();

  return {
    completedForm,
    formConfig,
    searchTerm,
    sortKey,
    isAscending,
  };
};

PatientSelectComponent.propTypes = {
  completedForm: PropTypes.object.isRequired,
  selectPatient: PropTypes.func.isRequired,
  formConfig: PropTypes.array.isRequired,
  createPatient: PropTypes.func.isRequired,
  onCancelPrescription: PropTypes.func.isRequired,
  updateForm: PropTypes.func.isRequired,
};

export const PatientSelect = connect(mapStateToProps, mapDispatchToProps)(PatientSelectComponent);
const localStyles = StyleSheet.create({
  container: {
    flex: 12,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  formContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'stretch',
  },
  verticalSeparator: {
    width: 10,
    backgroundColor: DARK_GREY,
  },
  listContainer: {
    flex: 3,
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  text: {
    fontFamily: APP_FONT_FAMILY,
    color: DARKER_GREY,
    fontSize: 14,
    paddingRight: 7,
  },
  more: { paddingVertical: 10 },
});
