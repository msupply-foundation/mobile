/* eslint-disable react/jsx-curly-newline */
/* eslint-disable react/forbid-prop-types */
import React, { useRef, useState } from 'react';
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
import { buttonStrings, generalStrings, vaccineStrings } from '../../localization';
import { PageButton } from '../PageButton';
import { NameNoteActions } from '../../actions';
import { Paper } from '../Paper';
import { Title } from '../JSONForm/fields';

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
  patient,
  supplementalDataSchema,
  vaccinationEventId,
  vaccinationEventSchema,
  savePCDForm,
  saveSupplementalData,
  surveySchema,
}) => {
  const pcdFormRef = useRef(null);
  const supplementalFormRef = useRef(null);
  const vaccinationFormRef = useRef(null);

  const [{ updatedPcdForm, isPCDValid }, setPCDForm] = useState({
    updatedPcdForm: null,
    isPCDValid: false,
  });
  const [{ updatedSupplementalDataForm, isSupplementalDataValid }, setSupplementalData] = useState({
    updatedSupplementalDataForm: null,
    isSupplementalDataValid: false,
  });
  const vaccinationEventNameNote = UIDatabase.get('NameNote', vaccinationEventId);
  const vaccinationEvent = vaccinationEventNameNote.data;

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
              <JSONForm
                ref={vaccinationFormRef}
                disabled={true}
                formData={parsedVaccinationEvent ?? null}
                surveySchema={vaccinationEventSchema}
              >
                <></>
              </JSONForm>
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
          text={buttonStrings.edit}
          style={localStyles.saveButton}
          textStyle={localStyles.saveButtonTextStyle}
          isDisabled={true}
        />
      </FlexRow>
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

  return {
    surveySchema,
    vaccinationEventSchema,
    supplementalDataSchema,
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

  return { savePCDForm, saveSupplementalData };
};

const localStyles = StyleSheet.create({
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
  patient: PropTypes.object,
  savePCDForm: PropTypes.func.isRequired,
  saveSupplementalData: PropTypes.func.isRequired,
  supplementalDataSchema: PropTypes.object.isRequired,
  surveySchema: PropTypes.object.isRequired,
  vaccinationEventId: PropTypes.string,
  vaccinationEventSchema: PropTypes.object.isRequired,
};

export const VaccinationEvent = connect(
  mapStateToProps,
  mapDispatchToProps
)(VaccinationEventComponent);
