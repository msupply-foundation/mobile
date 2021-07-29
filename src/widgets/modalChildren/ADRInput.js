/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import { JSONForm } from '../JSONForm/JSONForm';
import { UIDatabase } from '../../database/index';
import { FlexRow } from '../FlexRow';
import { FlexView } from '../FlexView';
import { PageButton } from '../PageButton';
import { SUSSOL_ORANGE, WHITE } from '../../globalStyles/colors';
import globalStyles from '../../globalStyles/index';
import { PatientActions } from '../../actions/PatientActions';
import { selectCurrentPatient } from '../../selectors/patient';
import { useLocalAndRemotePatientHistory } from '../../hooks/useLocalAndRemoteHistory';
import { dispensingStrings, generalStrings, vaccineStrings } from '../../localization';

const getSchemaItems = jsonSchema => {
  const { properties = {} } = jsonSchema;
  const { causes = {} } = properties;
  const { items } = causes;
  return items;
};
const mapHistory = history =>
  history.map((h, index) => {
    const { prescriberOrVaccinator, itemName, confirmDate } = h;
    const date = moment(confirmDate).format('DD/MM/YY');
    const vaccinator = prescriberOrVaccinator
      ? `  ${vaccineStrings.vaccinator}: ${prescriberOrVaccinator}`
      : '';
    const name = `${index + 1}. ${itemName}  ${generalStrings.date}: ${date}${vaccinator}`;

    return { name, value: h.id };
  });

const LoadingIndicator = ({ loading }) => (
  <FlexView flex={1} justifyContent="center" alignItems="center" style={{ marginTop: 20 }}>
    {loading && (
      <>
        <Text style={localStyles.text}>{dispensingStrings.fetching_history}</Text>
        <ActivityIndicator color={SUSSOL_ORANGE} size="small" style={{ marginTop: 10 }} />
      </>
    )}
  </FlexView>
);

LoadingIndicator.propTypes = {
  loading: PropTypes.bool.isRequired,
};

export const ADRInputComponent = ({ onCancel, onSave, patient, patientHistory }) => {
  const [{ formData, isValid }, setForm] = useState({ formData: null, isValid: false });
  const patientId = patient?.id;
  const [ADRSchema, setADRSchema] = useState(UIDatabase.objects('ADRForm')[0]);
  const { jsonSchema, uiSchema, type, version } = UIDatabase.objects('ADRForm')[0];
  const items = getSchemaItems(jsonSchema);
  const vaccineHistory = patientHistory.filter(h => h.itemBatch?.item?.isVaccine);
  const [{ data, loading, searched }, fetchOnline] = useLocalAndRemotePatientHistory({
    isVaccineDispensingModal: true,
    patientId,
    initialValue: vaccineHistory,
    sortKey: 'itemName',
  });
  const showLoading = items && (loading || !searched);

  if (items) {
    useEffect(fetchOnline, [patientId]);
  }

  useLayoutEffect(() => {
    if (!data.length) return;

    if (items) {
      const mappedHistory = mapHistory(data);
      items.enum = mappedHistory.map(h => h.value);
      items.enumNames = mappedHistory.map(h => h.name);

      setADRSchema({ uiSchema, jsonSchema, properties: { type, version: version + 1 } });
    }
  }, [data, patientId, searched, items]);

  return (
    <>
      {showLoading ? (
        <LoadingIndicator loading={loading} />
      ) : (
        <JSONForm
          onChange={(changed, validator) => {
            setForm({ formData: changed.formData, isValid: validator(changed.formData) });
          }}
          surveySchema={ADRSchema}
        >
          <></>
        </JSONForm>
      )}
      <FlexRow>
        <PageButton
          onPress={onCancel}
          style={localStyles.cancelButton}
          textStyle={localStyles.cancelButtonTextStyle}
          text="CANCEL"
        />
        <PageButton
          isDisabled={!isValid}
          onPress={() => onSave(patient, formData)}
          style={localStyles.saveButton}
          textStyle={localStyles.saveButtonTextStyle}
          text="SAVE"
        />
      </FlexRow>
    </>
  );
};

ADRInputComponent.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired,
  patientHistory: PropTypes.array.isRequired,
};

const localStyles = StyleSheet.create({
  text: {
    fontFamily: globalStyles.APP_FONT_FAMILY,
    fontSize: globalStyles.APP_GENERAL_FONT_SIZE,
    color: WHITE,
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
});

const stateToProps = state => {
  const patient = selectCurrentPatient(state);
  return { patient };
};

const dispatchToProps = dispatch => ({
  onCancel: () => dispatch(PatientActions.closeADRModal()),
  onSave: (patient, formData) => dispatch(PatientActions.saveADR(patient, formData)),
});

export const ADRInput = connect(stateToProps, dispatchToProps)(ADRInputComponent);
