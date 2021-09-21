/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, View, Text, ToastAndroid } from 'react-native';
import PropTypes from 'prop-types';

import { UIDatabase } from '../../database';

import { MODALS } from '../constants';
import { PREFERENCE_KEYS } from '../../database/utilities/preferenceConstants';

import { getColumns } from '../../pages/dataTableUtilities';
import { useLocalAndRemotePatientHistory } from '../../hooks/useLocalAndRemoteHistory';

import { FlexView } from '../FlexView';

import { WHITE, APP_FONT_FAMILY, SUSSOL_ORANGE, APP_GENERAL_FONT_SIZE } from '../../globalStyles';
import { dispensingStrings, generalStrings } from '../../localization';
import { SimpleTable } from '../SimpleTable';
import { ToggleBar } from '../index';

const EmptyComponent = () => (
  <FlexView flex={1} justifyContent="center" alignItems="center" style={{ marginTop: 20 }}>
    <Text style={localStyles.text}>{dispensingStrings.no_history_for_this_patient}</Text>
  </FlexView>
);

const LoadingIndicator = ({ loading }) =>
  !!loading && (
    <FlexView flex={1} justifyContent="center" alignItems="center" style={{ marginTop: 20 }}>
      <Text style={localStyles.text}>{dispensingStrings.fetching_history}</Text>
      <ActivityIndicator color={SUSSOL_ORANGE} size="small" style={{ marginTop: 10 }} />
    </FlexView>
  );

LoadingIndicator.propTypes = {
  loading: PropTypes.bool.isRequired,
};

const getColumnKey = (isVaccineDispensingModal, canViewHistory) => {
  // Vaccine Dispensing History
  if (isVaccineDispensingModal) {
    return canViewHistory ? MODALS.VACCINE_HISTORY_LOOKUP : MODALS.VACCINE_HISTORY;
  }

  // Regular Dispensing History
  if (!canViewHistory) {
    return MODALS.PATIENT_HISTORY;
  }

  return MODALS.PATIENT_HISTORY_LOOKUP_WITH_VACCINES;
};

export const PatientHistoryModal = ({
  isVaccineDispensingModal,
  patientId,
  patientHistory,
  sortKey,
}) => {
  const canViewHistory = UIDatabase.getPreference(PREFERENCE_KEYS.CAN_VIEW_ALL_PATIENTS_HISTORY);
  const patientsSyncEverywhere = !UIDatabase.getPreference(
    PREFERENCE_KEYS.NEW_PATIENTS_VISIBLE_THIS_STORE_ONLY
  );
  const filteredHistory = isVaccineDispensingModal
    ? patientHistory.filter(record => record.isVaccine)
    : patientHistory.filter(record => !record.isVaccine);

  // Remote fetch not required if patients sync everywhere is enabled and only fetching vaccines
  const isRemoteFetchRequired =
    (canViewHistory && !isVaccineDispensingModal) ||
    (canViewHistory && !patientsSyncEverywhere && isVaccineDispensingModal);

  const columns = React.useMemo(
    () => getColumns(getColumnKey(isVaccineDispensingModal, canViewHistory)),
    []
  );

  const [
    { data, loading, error, historyType },
    toggleHistoryType,
    fetchOnline,
  ] = useLocalAndRemotePatientHistory({
    isVaccineDispensingModal,
    patientId,
    initialValue: filteredHistory,
    sortKey,
  });

  if (isRemoteFetchRequired) {
    useEffect(fetchOnline, [patientId, historyType]);
    useEffect(
      () =>
        error &&
        ToastAndroid.show(generalStrings.error_communicating_with_server, ToastAndroid.LONG),
      [error]
    );
  }

  const toggles = useMemo(
    () => [
      {
        text: dispensingStrings.dispensing,
        isOn: historyType === 'dispensing',
        onPress: () =>
          toggleHistoryType(
            'dispensing',
            patientHistory.filter(item => !item.isVaccine)
          ),
      },
      {
        text: dispensingStrings.vaccinations,
        isOn: historyType === 'vaccinations',
        onPress: () =>
          toggleHistoryType(
            'vaccinations',
            patientHistory.filter(item => item.isVaccine)
          ),
      },
    ],
    [historyType]
  );

  return (
    <View style={localStyles.mainContainer}>
      {!isVaccineDispensingModal ? (
        <View style={localStyles.topSectionContainer}>
          <ToggleBar toggles={toggles} />
        </View>
      ) : null}
      <View style={localStyles.tableContainer}>
        <SimpleTable data={data} columns={columns} ListEmptyComponent={<EmptyComponent />} />
      </View>
      <LoadingIndicator loading={loading} />
    </View>
  );
};

const localStyles = {
  mainContainer: { backgroundColor: WHITE, flex: 1 },
  text: { fontFamily: APP_FONT_FAMILY, fontSize: APP_GENERAL_FONT_SIZE },
  tableContainer: { backgroundColor: 'white', flexGrow: 0, flexShrink: 1 },
  topSectionContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
};

PatientHistoryModal.defaultProps = {
  isVaccineDispensingModal: false,
  patientHistory: [],
};

PatientHistoryModal.propTypes = {
  isVaccineDispensingModal: PropTypes.bool,
  patientId: PropTypes.string.isRequired,
  patientHistory: PropTypes.array,
  sortKey: PropTypes.string.isRequired,
};
