/* eslint-disable react/forbid-prop-types */
import React, { useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FlexRow } from '../FlexRow';
import { JSONForm } from '../JSONForm/JSONForm';
import { selectSurveySchemas, selectVaccinationEventSchemas } from '../../selectors/formSchema';
import { FlexView } from '../FlexView';
import { UIDatabase } from '../../database';
import { selectClosestPCDToVaccination } from '../../selectors/Entities/nameNote';
import { FlexColumn } from '../FlexColumn';
import { BreachManUnhappy } from '../BreachManUnhappy';
import { APP_FONT_FAMILY, DARKER_GREY, GREY } from '../../globalStyles';
import { generalStrings } from '../../localization';

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
  surveySchema,
}) => {
  const pcdFormRef = useRef(null);
  const vaccinationFormRef = useRef(null);

  const { pcdNameNoteId } = vaccinationEvent;

  const surveyForm = pcdNameNoteId
    ? UIDatabase.get('NameNote', pcdNameNoteId)
    : selectClosestPCDToVaccination(patient, vaccinationEvent.entryDate);

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
            <View style={styles.formContainer}>
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
          <View style={styles.formContainer}>
            {!!surveySchema && !!surveyForm ? (
              <FlexRow flex={1}>
                <View style={styles.formContainer}>
                  <JSONForm
                    ref={pcdFormRef}
                    disabled={true}
                    formData={surveyForm.data ?? null}
                    surveySchema={surveySchema}
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
  vaccinationEvent: {},
};

VaccinationEventComponent.propTypes = {
  patient: PropTypes.object,
  surveySchema: PropTypes.object.isRequired,
  vaccinationEvent: PropTypes.object,
  vaccinationEventSchema: PropTypes.object.isRequired,
};

export const VaccinationEvent = connect(mapStateToProps, null)(VaccinationEventComponent);
