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

import { ModalContainer } from '../widgets/modals/ModalContainer';

import { recordKeyExtractor, getItemLayout } from './dataTableUtilities';
import { createPrescription } from '../navigation/actions';
import { useNavigationFocus, useSyncListener, useDebounce } from '../hooks';

import { UIDatabase, generateUUID } from '../database';

import { PatientActions } from '../actions/PatientActions';
import { PrescriberActions } from '../actions/PrescriberActions';
import { DispensaryActions } from '../actions/DispensaryActions';

import {
  selectDataSetInUse,
  selectSortedData,
  selectLookupModalOpen,
} from '../selectors/dispensary';
import { selectSortedPatientHistory } from '../selectors/patient';

import globalStyles from '../globalStyles';
import { dispensingStrings, modalStrings } from '../localization';
import { NameNoteActions } from '../actions/Entities/NameNoteActions';
import { createDefaultName } from '../actions/Entities/NameActions';
import { SUSSOL_ORANGE } from '../globalStyles/colors';
import { ADRInput } from '../widgets/modalChildren/ADRInput';
import { PrescriberModel } from '../widgets/modals';
import { PatientEditModal } from '../widgets/modalChildren';

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
  currentPatient,
  patientHistoryModalOpen,
  patientHistory,

  // Patient callback
  editPatient,
  createPatient,
  cancelPatientEdit,
  viewPatientHistory,

  // Prescriber callbacks
  editPrescriber,
  createPrescriber,

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
      <PrescriberModel />
      <PatientEditModal />
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
        <ADRInput />
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
  const { patient, dispensary } = state;
  const { sortKey, isAscending, searchTerm, columns } = dispensary;

  const isLookupModalOpen = selectLookupModalOpen(state);

  const {
    currentPatient,
    viewingHistory: patientHistoryModalOpen,
    creatingADR: isADRModalOpen,
  } = patient;

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
    currentPatient,
    patientHistoryModalOpen,
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
});

export const DispensingPage = connect(mapStateToProps, mapDispatchToProps)(Dispensing);

Dispensing.defaultProps = {
  currentPatient: null,
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
  createPatient: PropTypes.func.isRequired,
  cancelPatientEdit: PropTypes.func.isRequired,
  currentPatient: PropTypes.object,
  editPrescriber: PropTypes.func.isRequired,
  createPrescriber: PropTypes.func.isRequired,
  usingPatientsDataSet: PropTypes.bool.isRequired,
  usingPrescribersDataSet: PropTypes.bool.isRequired,
  patientHistoryModalOpen: PropTypes.bool.isRequired,
  viewPatientHistory: PropTypes.func.isRequired,
  isADRModalOpen: PropTypes.bool.isRequired,
  createADR: PropTypes.func.isRequired,
  cancelCreatingADR: PropTypes.func.isRequired,
  patientHistory: PropTypes.array.isRequired,
};
