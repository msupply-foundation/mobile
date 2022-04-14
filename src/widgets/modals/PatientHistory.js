/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useEffect } from 'react';
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

const getColumnKey = (isVaccine, canViewHistory) => {
  // Vaccine Dispensing History
  if (isVaccine) {
    return canViewHistory ? MODALS.VACCINE_HISTORY_LOOKUP : MODALS.VACCINE_HISTORY;
  }

  // Regular Dispensing History
  if (!canViewHistory) {
    return MODALS.PATIENT_HISTORY;
  }

  return MODALS.PATIENT_HISTORY_LOOKUP_WITH_VACCINES;
};

export const PatientHistoryModal = ({
  isVaccine,
  patientId,
  patientHistory,
  sortKey,
  selectVaccination,
}) => {
  const canViewHistory = UIDatabase.getPreference(PREFERENCE_KEYS.CAN_VIEW_ALL_PATIENTS_HISTORY);
  const patientsSyncEverywhere = !UIDatabase.getPreference(
    PREFERENCE_KEYS.NEW_PATIENTS_VISIBLE_THIS_STORE_ONLY
  );

  // Remote fetch not required if patients sync everywhere is enabled and only fetching vaccines
  const isRemoteFetchRequired =
    (canViewHistory && !isVaccine) || (canViewHistory && !patientsSyncEverywhere && isVaccine);

  const columns = React.useMemo(() => getColumns(getColumnKey(isVaccine, canViewHistory)), []);
  const [{ data, loading, error }, fetchOnline] = useLocalAndRemotePatientHistory({
    isVaccineDispensingModal: isVaccine,
    patientId,
    initialValue: patientHistory,
    sortKey,
  });

  if (isRemoteFetchRequired) {
    useEffect(fetchOnline, [patientId]);
    useEffect(
      () =>
        error &&
        ToastAndroid.show(generalStrings.error_communicating_with_server, ToastAndroid.LONG),
      [error]
    );
  }

  return (
    <View style={localStyles.mainContainer}>
      <View style={localStyles.tableContainer}>
        <SimpleTable
          data={data}
          columns={columns}
          selectRow={row => {
            selectVaccination(row);
          }}
          ListEmptyComponent={<EmptyComponent />}
        />
      </View>
      <LoadingIndicator loading={loading} />
    </View>
  );
};

const localStyles = {
  mainContainer: { backgroundColor: WHITE, flex: 1 },
  text: { fontFamily: APP_FONT_FAMILY, fontSize: APP_GENERAL_FONT_SIZE },
  tableContainer: { backgroundColor: 'white', flexGrow: 0, flexShrink: 1 },
};

PatientHistoryModal.defaultProps = {
  isVaccine: false,
  patientHistory: [],
};

PatientHistoryModal.propTypes = {
  isVaccine: PropTypes.bool,
  patientId: PropTypes.string.isRequired,
  patientHistory: PropTypes.array,
  sortKey: PropTypes.string.isRequired,
  selectVaccination: PropTypes.func.isRequired,
};
