/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, ToastAndroid } from 'react-native';
import { connect, batch } from 'react-redux';
import PropTypes from 'prop-types';

import { SETTINGS_KEYS } from '../../settings';
import { MODALS } from '../constants';
import { UIDatabase } from '../../database';

import { useFetch } from '../../hooks/useFetch';

import { FormControl } from '../FormControl';

import { Spinner } from '..';
import { ConfirmForm } from '../modalChildren/ConfirmForm';
import { ModalContainer } from '.';

import { InsuranceActions } from '../../actions/InsuranceActions';
import { PatientActions } from '../../actions/PatientActions';
import { PrescriberActions } from '../../actions/PrescriberActions';

import { getColumns } from '../../pages/dataTableUtilities';
import { SimpleTable } from '../SimpleTable';

import { modalStrings, generalStrings } from '../../localization';

import { APP_FONT_FAMILY, DARK_GREY, ROW_BLUE, WHITE, SUSSOL_ORANGE } from '../../globalStyles';

import {
  getAuthorizationHeader,
  getPatientRequestUrl,
  getPrescriberRequestUrl,
  processPatientResponse,
  processPrescriberResponse,
} from '../../sync/lookupApiUtils';

import {
  selectDataSetInUse,
  selectLookupFormConfig,
  selectLookupListConfig,
} from '../../selectors/dispensary';
import { useLoadingIndicator } from '../../hooks/useLoadingIndicator';
import { DispensaryActions } from '../../actions/DispensaryActions';
import { NameNoteActions } from '../../actions/Entities/NameNoteActions';

const { SYNC_URL } = SETTINGS_KEYS;

export const SearchFormComponent = ({
  isPatient,
  isPrescriber,
  formConfig,
  selectPatient,
  selectPrescriber,
  close,
}) => {
  const syncUrl = UIDatabase.getSetting(SYNC_URL);
  const { fetch, refresh, isLoading, response, error } = useFetch(syncUrl);

  const withLoadingIndicator = useLoadingIndicator();

  const columns = React.useMemo(
    () => (isPatient ? getColumns(MODALS.PATIENT_LOOKUP) : getColumns(MODALS.PRESCRIBER_LOOKUP)),
    []
  );

  const lookupRecords = useMemo(() => {
    if (isPatient) {
      return async params => {
        fetch(
          getPatientRequestUrl(params),
          { headers: { authorization: getAuthorizationHeader() } },
          { responseHandler: processPatientResponse }
        );
      };
    }
    if (isPrescriber) {
      return async params => {
        fetch(
          getPrescriberRequestUrl(params),
          { headers: { authorization: getAuthorizationHeader() } },
          { responseHandler: processPrescriberResponse }
        );
      };
    }
    return () => null;
  }, [isLoading, isPatient, isPrescriber]);

  const selectRecord = useMemo(() => {
    if (isPatient) {
      return patient => {
        close();
        withLoadingIndicator(async () => {
          await selectPatient(patient);
        });
      };
    }

    if (isPrescriber) return prescriber => selectPrescriber(prescriber);
    return () => null;
  }, [isPatient, isPrescriber]);

  const FormView = useCallback(
    () => (
      <FormControl
        inputConfig={formConfig}
        onSave={lookupRecords}
        showCancelButton={false}
        saveButtonText={generalStrings.search}
      />
    ),
    [formConfig, lookupRecords]
  );

  const ListView = useCallback(
    () =>
      isLoading ? (
        <View style={localStyles.spinnerContainer}>
          <Spinner isSpinning={isLoading} color={SUSSOL_ORANGE} />
        </View>
      ) : (
        <SimpleTable data={response} columns={columns} selectRow={selectRecord} />
      ),
    [isLoading, response]
  );

  const ErrorView = useCallback(
    () => (
      <>
        <ModalContainer isVisible={!!error}>
          <ConfirmForm
            isOpen={!!error}
            questionText={error?.message}
            onConfirm={refresh}
            confirmText={modalStrings.confirm}
          />
        </ModalContainer>
      </>
    ),
    [error]
  );

  return (
    <View style={localStyles.container}>
      <View style={localStyles.formContainer}>
        <FormView />
      </View>
      <View style={localStyles.verticalSeparator} />
      <View style={localStyles.listContainer}>
        <ListView />
      </View>
      <ErrorView />
    </View>
  );
};

const mapStateToProps = state => {
  const [isPatient, isPrescriber] = selectDataSetInUse(state);
  const formConfig = selectLookupFormConfig(state);
  const listConfig = selectLookupListConfig(state);
  return { isPatient, isPrescriber, formConfig, listConfig };
};

const mapDispatchToProps = dispatch => ({
  close: () => dispatch(DispensaryActions.closeLookupModal()),
  selectPatient: async patient => {
    const result = await PatientActions.makePatientVisibility(patient);

    if (result) {
      await dispatch(PatientActions.patientUpdate(patient));
      batch(() => {
        (patient?.policies || []).forEach(policy => dispatch(InsuranceActions.update(policy)));
        if (patient?.nameNotes) dispatch(NameNoteActions.createNotes(patient?.nameNotes));
      });
    } else {
      ToastAndroid.show(generalStrings.problem_connecting_please_try_again, ToastAndroid.LONG);
    }
  },
  selectPrescriber: prescriber => {
    dispatch(PrescriberActions.updatePrescriber(prescriber));
  },
});

export const SearchForm = connect(mapStateToProps, mapDispatchToProps)(SearchFormComponent);

SearchFormComponent.propTypes = {
  close: PropTypes.func.isRequired,
  isPatient: PropTypes.bool.isRequired,
  isPrescriber: PropTypes.bool.isRequired,
  formConfig: PropTypes.array.isRequired,
  selectPatient: PropTypes.func.isRequired,
  selectPrescriber: PropTypes.func.isRequired,
};

const localStyles = StyleSheet.create({
  container: {
    height: '95%',
    marginVertical: 20,
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
  spinnerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.88,
    zIndex: 2,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: WHITE,
    backgroundColor: ROW_BLUE,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
  },
  columnContainer: {
    flex: 1,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: WHITE,
  },
  text: {
    fontSize: 20,
    fontFamily: APP_FONT_FAMILY,
    marginHorizontal: 10,
    marginVertical: 10,
  },
});
