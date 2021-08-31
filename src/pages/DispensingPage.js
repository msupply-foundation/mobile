/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { batch, connect } from 'react-redux';
import { View } from 'react-native';

import { ToggleBar, DataTablePageView, SearchBar, PageButton } from '../widgets';
import { DataTable, DataTableRow, DataTableHeaderRow } from '../widgets/DataTable';
import { SearchForm } from '../widgets/modals/SearchForm';
import { PatientHistoryModal } from '../widgets/modals/PatientHistory';
import { FormControl } from '../widgets/FormControl';
import { ModalContainer } from '../widgets/modals/ModalContainer';

import { recordKeyExtractor, getItemLayout } from './dataTableUtilities';
import { createPrescription } from '../navigation/actions';
import { useNavigationFocus, useSyncListener, useDebounce } from '../hooks';

import { UIDatabase, generateUUID } from '../database';
import { getFormInputConfig } from '../utilities/formInputConfigs';

import { PatientActions } from '../actions/PatientActions';
import { PrescriberActions } from '../actions/PrescriberActions';
import { InsuranceActions } from '../actions/InsuranceActions';
import { DispensaryActions } from '../actions/DispensaryActions';

import {
  selectDataSetInUse,
  selectSortedData,
  selectLookupModalOpen,
} from '../selectors/dispensary';
import { selectPrescriberModalOpen, selectCanEditPrescriber } from '../selectors/prescriber';
import { selectInsuranceModalOpen, selectCanEditInsurancePolicy } from '../selectors/insurance';
import {
  selectPatientModalOpen,
  selectCanEditPatient,
  selectSortedPatientHistory,
} from '../selectors/patient';

import globalStyles from '../globalStyles';
import { dispensingStrings, modalStrings } from '../localization';
import { PatientEditModal } from '../widgets/modalChildren/PatientEditModal';
import { selectSurveySchemas } from '../selectors/formSchema';
import { NameNoteActions } from '../actions/Entities/NameNoteActions';
import { createDefaultName } from '../actions/Entities/NameActions';
import { SUSSOL_ORANGE } from '../globalStyles/colors';
import { ADRInput } from '../widgets/modalChildren/ADRInput';

const Dispensing = ({
  data,
  columns,
  isAscending,
  sortKey,
  searchTerm,
  usingPatientsDataSet,
  usingPrescribersDataSet,

  // Misc. Callbacks
  filter,
  sort,
  gotoPrescription,
  navigation,
  refreshData,
  switchDataset,

  // Dispensary lookup API callbacks
  lookupRecord,
  cancelLookupRecord,

  // Dispensary lookup API variables
  isLookupModalOpen,

  // Patient variables
  patientEditModalOpen,
  currentPatient,
  patientHistoryModalOpen,
  canEditPatient,
  patientHistory,

  // Patient callback
  editPatient,
  createPatient,
  cancelPatientEdit,
  viewPatientHistory,

  // Prescriber variables
  currentPrescriber,
  prescriberModalOpen,
  canEditPrescriber,

  // Prescriber callbacks
  editPrescriber,
  createPrescriber,
  cancelPrescriberEdit,
  savePrescriber,

  // Insurance variables
  insuranceModalOpen,
  selectedInsurancePolicy,
  canEditInsurancePolicy,
  isCreatingInsurancePolicy,

  // Insurance callbacks
  cancelInsuranceEdit,
  saveInsurancePolicy,

  // ADR
  isADRModalOpen,
  createADR,
  cancelCreatingADR,
}) => {
  // Custom hook to refresh data on this page when becoming the head of the stack again.
  useNavigationFocus(navigation, refreshData);
  useSyncListener(refreshData, 'Name');
  const togglePatientAndPrescriber = useDebounce(switchDataset, 250, true);

  const getCellCallbacks = colKey => {
    switch (colKey) {
      case 'adverseDrugEffect':
        return createADR;
      case 'dispense':
        return gotoPrescription;
      case 'patientHistory':
        return viewPatientHistory;
      case 'patientEdit':
        return editPatient;
      case 'prescriberEdit':
        return editPrescriber;
      default:
        return null;
    }
  };

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = recordKeyExtractor(item);
      return (
        <DataTableRow
          rowData={data[index]}
          rowKey={rowKey}
          getCallback={getCellCallbacks}
          columns={columns}
          rowIndex={index}
        />
      );
    },
    [data]
  );

  const renderHeader = useCallback(
    () => (
      <DataTableHeaderRow
        columns={columns}
        isAscending={isAscending}
        sortKey={sortKey}
        onPress={sort}
      />
    ),
    [sortKey, isAscending, columns]
  );

  const toggles = useMemo(
    () => [
      {
        text: dispensingStrings.patients,
        onPress: togglePatientAndPrescriber,
        isOn: usingPatientsDataSet,
      },
      {
        text: dispensingStrings.prescribers,
        onPress: togglePatientAndPrescriber,
        isOn: usingPrescribersDataSet,
      },
    ],
    [usingPatientsDataSet, usingPrescribersDataSet, togglePatientAndPrescriber]
  );

  const newRecordText = useMemo(
    () =>
      usingPatientsDataSet
        ? `${dispensingStrings.new_patient}`
        : `${dispensingStrings.new} ${dispensingStrings.prescriber}`,
    [usingPatientsDataSet]
  );
  const lookupRecordText = useMemo(
    () =>
      usingPatientsDataSet
        ? `${dispensingStrings.lookup_patient}`
        : `${dispensingStrings.lookup_prescriber}`,
    [usingPatientsDataSet]
  );

  const newRecordAction = useMemo(() => (usingPatientsDataSet ? createPatient : createPrescriber), [
    usingPatientsDataSet,
  ]);
  const lookupRecordAction = useMemo(() => lookupRecord, []);

  const { pageTopSectionContainer } = globalStyles;
  return (
    <>
      <DataTablePageView>
        <View style={pageTopSectionContainer}>
          <ToggleBar toggles={toggles} />
          <SearchBar
            onChangeText={filter}
            value={searchTerm}
            viewStyle={localStyles.searchBar}
            placeholder={dispensingStrings.search_by_last_name_first_name}
          />
          <PageButton text={newRecordText} onPress={newRecordAction} style={localStyles.button} />
          <PageButton
            text={lookupRecordText}
            onPress={lookupRecordAction}
            style={localStyles.button}
          />
        </View>
        <DataTable
          data={data}
          renderRow={renderRow}
          renderHeader={renderHeader}
          keyExtractor={recordKeyExtractor}
          getItemLayout={getItemLayout}
        />
      </DataTablePageView>
      <ModalContainer
        title={`${dispensingStrings.patient_detail}`}
        noCancel
        isVisible={patientEditModalOpen}
      >
        <PatientEditModal
          patient={currentPatient}
          isDisabled={!canEditPatient}
          onCancel={cancelPatientEdit}
          inputConfig={getFormInputConfig('patient', currentPatient)}
          surveySchema={selectSurveySchemas()[0]}
        />
      </ModalContainer>
      <ModalContainer
        title={`${dispensingStrings.prescriber} ${dispensingStrings.details}`}
        noCancel
        isVisible={prescriberModalOpen}
      >
        <FormControl
          isDisabled={!canEditPrescriber}
          onSave={savePrescriber}
          onCancel={cancelPrescriberEdit}
          inputConfig={getFormInputConfig('prescriber', currentPrescriber)}
        />
      </ModalContainer>
      <ModalContainer
        title={`${dispensingStrings.insurance_policy}`}
        noCancel
        isVisible={insuranceModalOpen}
      >
        <FormControl
          isDisabled={!canEditInsurancePolicy}
          confirmOnSave={!canEditPatient}
          confirmText={dispensingStrings.confirm_new_policy}
          onSave={saveInsurancePolicy}
          onCancel={cancelInsuranceEdit}
          inputConfig={getFormInputConfig(
            'insurancePolicy',
            isCreatingInsurancePolicy ? null : selectedInsurancePolicy
          )}
        />
      </ModalContainer>
      <ModalContainer
        // eslint-disable-next-line max-len
        title={`${dispensingStrings.patient} ${dispensingStrings.history} - ${currentPatient?.name}`}
        onClose={cancelPatientEdit}
        isVisible={patientHistoryModalOpen}
      >
        <PatientHistoryModal
          patientHistory={patientHistory}
          patientId={currentPatient?.id || ''}
          sortKey="itemName"
        />
      </ModalContainer>
      <ModalContainer
        title={
          usingPatientsDataSet
            ? `${dispensingStrings.lookup_patient}`
            : `${dispensingStrings.lookup_prescriber}`
        }
        onClose={cancelLookupRecord}
        isVisible={isLookupModalOpen}
      >
        <SearchForm />
      </ModalContainer>
      <ModalContainer
        title={`${modalStrings.adr_form_for} ${currentPatient?.name}`}
        isVisible={isADRModalOpen}
        onClose={cancelCreatingADR}
      >
        <ADRInput patientHistory={patientHistory} />
      </ModalContainer>
    </>
  );
};

const localStyles = {
  searchBar: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    flex: 1,
    flexGrow: 1,
  },
  button: {
    marginHorizontal: 2.5,
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
  cancelButton: {
    ...globalStyles.button,
    flex: 1,
    alignSelf: 'center',
  },
  cancelButtonTextStyle: {
    ...globalStyles.buttonText,
    color: SUSSOL_ORANGE,
    fontSize: 14,
  },
};

const mapStateToProps = state => {
  const { patient, prescriber, insurance, dispensary } = state;
  const { sortKey, isAscending, searchTerm, columns } = dispensary;

  const isLookupModalOpen = selectLookupModalOpen(state);

  const { currentPatient } = patient;
  const { currentPrescriber } = prescriber;
  const { isCreatingInsurancePolicy, selectedInsurancePolicy } = insurance;

  const prescriberModalOpen = selectPrescriberModalOpen(state);
  const canEditPrescriber = selectCanEditPrescriber(state);
  const canEditPatient = selectCanEditPatient(state);
  const canEditInsurancePolicy = selectCanEditInsurancePolicy(state);
  const [patientEditModalOpen, patientHistoryModalOpen, isADRModalOpen] = selectPatientModalOpen(
    state
  );
  const insuranceModalOpen = selectInsuranceModalOpen(state);
  const data = selectSortedData(state);
  const patientHistory =
    patient.currentPatient && patient.currentPatient.transactions
      ? selectSortedPatientHistory({ patient })
      : [];

  const [usingPatientsDataSet, usingPrescribersDataSet] = selectDataSetInUse(state);

  return {
    isADRModalOpen,
    usingPatientsDataSet,
    usingPrescribersDataSet,
    data,
    sortKey,
    isAscending,
    searchTerm,
    columns,
    // Dispensary lookup API
    isLookupModalOpen,
    // Patient
    patientEditModalOpen,
    currentPatient,
    patientHistoryModalOpen,
    canEditPatient,
    // Prescriber
    currentPrescriber,
    prescriberModalOpen,
    canEditPrescriber,
    // Insurance
    insuranceModalOpen,
    selectedInsurancePolicy,
    canEditInsurancePolicy,
    isCreatingInsurancePolicy,
    patientHistory,
  };
};

const mapDispatchToProps = dispatch => ({
  gotoPrescription: patientID => dispatch(createPrescription(patientID)),

  filter: searchTerm => dispatch(DispensaryActions.filter(searchTerm)),
  sort: sortKey => dispatch(DispensaryActions.sort(sortKey)),
  refreshData: () => dispatch(DispensaryActions.refresh()),
  switchDataset: () => dispatch(DispensaryActions.switchDataSet()),

  createADR: patientID => dispatch(PatientActions.openADRModal(patientID)),
  cancelCreatingADR: () => dispatch(PatientActions.closeADRModal()),
  lookupRecord: () => dispatch(DispensaryActions.openLookupModal()),
  cancelLookupRecord: () => dispatch(DispensaryActions.closeLookupModal()),

  editPatient: patientID =>
    batch(() => {
      const patient = UIDatabase.get('Name', patientID);
      dispatch(NameNoteActions.createSurveyNameNote(patient));
      dispatch(PatientActions.editPatient(patient));
    }),
  createPatient: () =>
    batch(() => {
      const patient = createDefaultName('patient', generateUUID());
      dispatch(PatientActions.createPatient(patient));
      dispatch(NameNoteActions.createSurveyNameNote(patient));
    }),

  cancelPatientEdit: () => dispatch(PatientActions.closeModal()),
  viewPatientHistory: rowKey =>
    dispatch(PatientActions.viewPatientHistory(UIDatabase.get('Name', rowKey))),

  editPrescriber: prescriber =>
    dispatch(PrescriberActions.editPrescriber(UIDatabase.get('Prescriber', prescriber))),
  createPrescriber: () => dispatch(PrescriberActions.createPrescriber()),
  cancelPrescriberEdit: () => dispatch(PrescriberActions.closeModal()),
  savePrescriber: prescriberDetails =>
    dispatch(PrescriberActions.updatePrescriber(prescriberDetails)),

  cancelInsuranceEdit: () => dispatch(InsuranceActions.cancel()),
  saveInsurancePolicy: policyDetails => dispatch(InsuranceActions.update(policyDetails)),
});

export const DispensingPage = connect(mapStateToProps, mapDispatchToProps)(Dispensing);

Dispensing.defaultProps = {
  currentPatient: null,
  currentPrescriber: null,
  selectedInsurancePolicy: null,
  canEditPrescriber: false,
};

Dispensing.propTypes = {
  data: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  isAscending: PropTypes.bool.isRequired,
  sortKey: PropTypes.string.isRequired,
  sort: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  filter: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  refreshData: PropTypes.func.isRequired,
  switchDataset: PropTypes.func.isRequired,
  lookupRecord: PropTypes.func.isRequired,
  cancelLookupRecord: PropTypes.func.isRequired,
  isLookupModalOpen: PropTypes.bool.isRequired,
  gotoPrescription: PropTypes.func.isRequired,
  editPatient: PropTypes.func.isRequired,
  patientEditModalOpen: PropTypes.bool.isRequired,
  createPatient: PropTypes.func.isRequired,
  cancelPatientEdit: PropTypes.func.isRequired,
  currentPatient: PropTypes.object,
  canEditPatient: PropTypes.bool.isRequired,
  currentPrescriber: PropTypes.object,
  canEditPrescriber: PropTypes.bool,
  editPrescriber: PropTypes.func.isRequired,
  createPrescriber: PropTypes.func.isRequired,
  cancelPrescriberEdit: PropTypes.func.isRequired,
  savePrescriber: PropTypes.func.isRequired,
  prescriberModalOpen: PropTypes.bool.isRequired,
  usingPatientsDataSet: PropTypes.bool.isRequired,
  usingPrescribersDataSet: PropTypes.bool.isRequired,
  patientHistoryModalOpen: PropTypes.bool.isRequired,
  selectedInsurancePolicy: PropTypes.object,
  insuranceModalOpen: PropTypes.bool.isRequired,
  canEditInsurancePolicy: PropTypes.bool.isRequired,
  cancelInsuranceEdit: PropTypes.func.isRequired,
  isCreatingInsurancePolicy: PropTypes.bool.isRequired,
  saveInsurancePolicy: PropTypes.func.isRequired,
  viewPatientHistory: PropTypes.func.isRequired,
  isADRModalOpen: PropTypes.bool.isRequired,
  createADR: PropTypes.func.isRequired,
  cancelCreatingADR: PropTypes.func.isRequired,
  patientHistory: PropTypes.array.isRequired,
};
