/* eslint-disable react/forbid-prop-types */
import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FlexRow } from '../FlexRow';
import { JSONForm } from '../JSONForm/JSONForm';
import { selectSurveySchemas, selectVaccinationEventSchemas } from '../../selectors/formSchema';
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
import { buttonStrings, generalStrings } from '../../localization';
import { PageButton } from '../PageButton';
import { NameNoteActions } from '../../actions';

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
  vaccinationEvent,
  vaccinationEventSchema,
  saveForm,
  surveySchema,
}) => {
  const pcdFormRef = useRef(null);
  const vaccinationFormRef = useRef(null);
  const [{ updatedPcdForm, isPCDValid }, setPCDForm] = useState({
    updatedPcdForm: null,
    isPCDValid: false,
  });

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
      prescription: { ...vaccinationEvent.prescription, customData: customDataObject },
    },
  };

  return (
    <FlexView>
      <FlexRow flex={1}>
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
      </FlexRow>
      <FlexRow flex={0} justifyContent="center">
        <PageButton
          text={buttonStrings.save_changes}
          onPress={() => saveForm(surveyForm, updatedPcdForm)}
          style={localStyles.saveButton}
          textStyle={localStyles.saveButtonTextStyle}
          isDisabled={!isPCDValid}
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

  return {
    surveySchema,
    vaccinationEventSchema,
  };
};

const mapDispatchToProps = dispatch => ({
  saveForm: (oldSurveyNote, updatedSurveyData) =>
    dispatch(NameNoteActions.updateLinkedSurveyNameNote(oldSurveyNote, updatedSurveyData)),
});

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
});

VaccinationEventComponent.defaultProps = {
  patient: {},
  vaccinationEvent: {},
};

VaccinationEventComponent.propTypes = {
  patient: PropTypes.object,
  saveForm: PropTypes.func.isRequired,
  surveySchema: PropTypes.object.isRequired,
  vaccinationEvent: PropTypes.object,
  vaccinationEventSchema: PropTypes.object.isRequired,
};

export const VaccinationEvent = connect(
  mapStateToProps,
  mapDispatchToProps
)(VaccinationEventComponent);
