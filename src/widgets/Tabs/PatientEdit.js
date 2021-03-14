/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ToastAndroid, View } from 'react-native';
import { connect } from 'react-redux';
import * as Animatable from 'react-native-animatable';
import { FormControl } from '../FormControl';
import { PageButton } from '../PageButton';
import { FlexRow } from '../FlexRow';
import { FlexView } from '../FlexView';
import { PageButtonWithOnePress } from '../PageButtonWithOnePress';

import { selectEditingName } from '../../selectors/Entities/name';
import { selectSurveySchemas } from '../../selectors/formSchema';
import { NameActions } from '../../actions/Entities/NameActions';
import { WizardActions } from '../../actions/WizardActions';
import { VaccinePrescriptionActions } from '../../actions/Entities/VaccinePrescriptionActions';
import { selectCanSaveForm, selectCompletedForm } from '../../selectors/form';
import { getFormInputConfig } from '../../utilities/formInputConfigs';

import { buttonStrings, vaccineStrings, dispensingStrings } from '../../localization';
import globalStyles from '../../globalStyles';
import { JSONForm } from '../JSONForm/JSONForm';
import { NameNoteActions } from '../../actions/Entities/NameNoteActions';
import { selectCreatingNameNote, selectNameNoteIsValid } from '../../selectors/Entities/nameNote';
import { AfterInteractions } from '../AfterInteractions';
import { Paper } from '../Paper';

/**
 * Layout component used for a tab within the vaccine prescription wizard.
 *
 * @prop {Bool}   canSaveForm           Indicates if the patient edit form is valid and complete
 * @prop {object} completedForm         Object containing the submitted survey form
 * @prop {object} currentPatient        The current patient object - the toJSON version of [Patient]
 * @prop {object} surveySchema          Object defining the survey form
 * @prop {Func}   onCancelPrescription  Callback for cancelling
 * @prop {Func}   updatePatientDetails  Callback for saving patient edit form.
 *
 */
const PatientEditComponent = ({
  canSaveForm,
  completedForm,
  currentPatient,
  surveySchema,
  onCancelPrescription,
  onCompleted,
  onOpen,
  updatePatientDetails,
  surveyFormData,
  updateForm,
}) => {
  const { pageTopViewContainer } = globalStyles;
  const formRef = useRef(null);

  const savePatient = useCallback(
    e => {
      updatePatientDetails(completedForm);
      formRef?.current?.submit(e);

      if (canSaveForm) {
        onCompleted();
      } else {
        ToastAndroid.show(dispensingStrings.validation_failed, ToastAndroid.LONG);
      }
    },
    [completedForm]
  );

  useEffect(() => {
    if (surveySchema) {
      onOpen(currentPatient.id);
    }
  }, []);

  return (
    <FlexView style={pageTopViewContainer}>
      <FlexRow flex={12}>
        <Paper
          style={{ flex: 1 }}
          headerText={vaccineStrings.vaccine_dispense_step_two_title}
          contentContainerStyle={{ flex: 1 }}
        >
          <AfterInteractions placeholder={null}>
            <Animatable.View animation="fadeIn" duration={1000} useNativeDriver style={{ flex: 1 }}>
              <FormControl
                showCancelButton={false}
                showSaveButton={false}
                inputConfig={getFormInputConfig('patient', currentPatient)}
                shouldAutoFocus={false}
              />
            </Animatable.View>
          </AfterInteractions>
        </Paper>

        {surveySchema && surveyFormData && (
          <AfterInteractions placeholder={null}>
            <Animatable.View animation="fadeIn" duration={1000} useNativeDriver style={{ flex: 1 }}>
              <JSONForm
                ref={formRef}
                surveySchema={surveySchema}
                formData={surveyFormData}
                onChange={data => {
                  updateForm(data.formData, data.errors);
                }}
                liveValidate={false}
              >
                <View />
              </JSONForm>
            </Animatable.View>
          </AfterInteractions>
        )}
      </FlexRow>

      <FlexRow flex={0} justifyContent="flex-end" alignItems="flex-end">
        <PageButtonWithOnePress text={buttonStrings.cancel} onPress={onCancelPrescription} />
        <PageButton
          text={buttonStrings.next}
          onPress={savePatient}
          style={{ marginLeft: 'auto' }}
        />
      </FlexRow>
    </FlexView>
  );
};

const mapDispatchToProps = dispatch => {
  const onCancelPrescription = () => dispatch(VaccinePrescriptionActions.cancel());
  const updateForm = (data, errors) => dispatch(NameNoteActions.updateForm(data, errors));
  const updatePatientDetails = detailsEntered =>
    dispatch(NameActions.updatePatient(detailsEntered));
  const onCompleted = () => dispatch(WizardActions.nextTab());
  const onOpen = nameID => dispatch(NameNoteActions.createSurveyNameNote(nameID));

  return { onCancelPrescription, onCompleted, onOpen, updatePatientDetails, updateForm };
};

const mapStateToProps = state => {
  const currentPatient = selectEditingName(state);
  const completedForm = selectCompletedForm(state);
  const canSaveForm = selectCanSaveForm(state) && selectNameNoteIsValid(state);
  const surveySchemas = selectSurveySchemas();
  const [surveySchema] = surveySchemas;
  const nameNote = selectCreatingNameNote(state);

  return {
    canSaveForm,
    completedForm,
    currentPatient,
    surveySchema,
    surveyFormData: nameNote?.data ?? null,
  };
};

PatientEditComponent.defaultProps = {
  surveySchema: undefined,
  currentPatient: null,
};

PatientEditComponent.propTypes = {
  canSaveForm: PropTypes.bool.isRequired,
  completedForm: PropTypes.object.isRequired,
  currentPatient: PropTypes.object,
  surveySchema: PropTypes.object,
  onCancelPrescription: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
  updatePatientDetails: PropTypes.func.isRequired,
  surveyFormData: PropTypes.object.isRequired,
  updateForm: PropTypes.func.isRequired,
};

export const PatientEdit = connect(mapStateToProps, mapDispatchToProps)(PatientEditComponent);
