/* eslint-disable react/forbid-prop-types */
import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FlexRow } from '../FlexRow';
import { JSONForm } from '../JSONForm/JSONForm';
import { NameNoteActions } from '../../actions';
import { selectSurveySchemas } from '../../selectors/formSchema';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const VaccinationEventComponent = ({ patient, vaccinationEvent, surveySchema }) => {
  const formRef = useRef(null);
  const surveyForm = NameNoteActions.getMostRecentPCD(patient);

  return (
    <FlexRow style={{ flexDirection: 'column' }} flex={1}>
      <FlexRow flex={1}>
        {!!surveySchema && !!surveyForm && (
          <View style={styles.formContainer}>
            <JSONForm
              ref={formRef}
              // onChange={(changed, validator) => {
              //   setForm({ formData: changed.formData, isValid: validator(changed.formData) });
              // }}
              formData={surveyForm.data ?? null}
              surveySchema={surveySchema}
            >
              <></>
            </JSONForm>
          </View>
        )}
      </FlexRow>
    </FlexRow>
  );
};

const mapStateToProps = () => {
  const surveySchemas = selectSurveySchemas();
  const [surveySchema] = surveySchemas;

  return {
    surveySchema,
  };
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'stretch',
  },
});

VaccinationEventComponent.defaultProps = {
  patient: {},
  surveySchema: {},
  vaccinationEvent: {},
};

VaccinationEventComponent.propTypes = {
  patient: PropTypes.object,
  surveySchema: PropTypes.object,
  vaccinationEvent: PropTypes.object,
};

export const VaccinationEvent = connect(mapStateToProps, null)(VaccinationEventComponent);
