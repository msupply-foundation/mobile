/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ToastAndroid, View } from 'react-native';
import { connect } from 'react-redux';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';

import useButtonEnabled from '../../hooks/useButtonEnabled';
import { FormControl } from '../FormControl';
import { PageButton } from '../PageButton';
import { FlexRow } from '../FlexRow';
import { FlexView } from '../FlexView';
import { PageButtonWithOnePress } from '../PageButtonWithOnePress';
import { PaperModalContainer } from '../PaperModal/PaperModalContainer';
import { PaperConfirmModal } from '../PaperModal/PaperConfirmModal';

import { selectCanEditPatient, selectEditingName } from '../../selectors/Entities/name';
import { selectSurveySchemas } from '../../selectors/formSchema';
import { NameActions } from '../../actions/Entities/NameActions';
import { WizardActions } from '../../actions/WizardActions';
import { VaccinePrescriptionActions } from '../../actions/Entities/VaccinePrescriptionActions';
import { selectCanSaveForm, selectCompletedForm } from '../../selectors/form';
import { getFormInputConfig } from '../../utilities/formInputConfigs';
import { useToggle } from '../../hooks/useToggle';

import {
  buttonStrings,
  vaccineStrings,
  dispensingStrings,
  modalStrings,
  generalStrings,
} from '../../localization';
import globalStyles from '../../globalStyles';
import { JSONForm } from '../JSONForm/JSONForm';
import { NameNoteActions } from '../../actions/Entities/NameNoteActions';
import { selectCreatingNameNote, selectNameNoteIsValid } from '../../selectors/Entities/nameNote';
import { AfterInteractions } from '../AfterInteractions';
import { Paper } from '../Paper';
import { selectPatientByNameAndDoB } from '../../selectors/patient';

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
  updatePatientDetails,
  surveyFormData,
  updateForm,
  canEditPatient,
  isDuplicatePatientLocally,
  previousTab,
}) => {
  const { pageTopViewContainer } = globalStyles;
  const [isDeceasedModalOpen, toggleIsDeceasedAlert] = useToggle(false);
  const [canDuplicatePatient, setDuplicatePatient] = useState(false);
  const [alertText, setAlertText] = useState(modalStrings.are_you_sure_duplicate_patient);
  const { enabled: nextButtonEnabled, setEnabled: setNextButtonEnabled } = useButtonEnabled();

  useEffect(() => {
    if (isDuplicatePatientLocally && !canSaveForm) {
      setDuplicatePatient(true);

      const dateOfBirth = moment(completedForm.dateOfBirth).format('LL');
      const name = `${completedForm.firstName} ${completedForm.lastName}`;
      const alert = modalStrings.formatString(
        modalStrings.are_you_sure_duplicate_patient,
        name,
        dateOfBirth
      );
      setAlertText(alert);
    }
  }, [isDuplicatePatientLocally]);

  const onConfirmDuplicatePatient = () => setDuplicatePatient(false);

  const formRef = useRef(null);
  const savePatient = useCallback(
    e => {
      setNextButtonEnabled(false);
      updatePatientDetails(completedForm);

      if (completedForm.isDeceased) {
        toggleIsDeceasedAlert();
        setNextButtonEnabled(true);
        return;
      }

      formRef?.current?.submit(e);

      if (canSaveForm) {
        onCompleted();
      } else {
        ToastAndroid.show(dispensingStrings.validation_failed, ToastAndroid.LONG);
        setNextButtonEnabled(true);
      }
    },
    [completedForm, canSaveForm]
  );

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
                isDisabled={!canEditPatient}
                showCancelButton={false}
                showSaveButton={false}
                inputConfig={getFormInputConfig('patient', currentPatient)}
                shouldAutoFocus={false}
              />
            </Animatable.View>
          </AfterInteractions>
        </Paper>

        {!!surveySchema && !!surveyFormData && (
          <AfterInteractions placeholder={null}>
            <Animatable.View animation="fadeIn" duration={1000} useNativeDriver style={{ flex: 1 }}>
              <JSONForm
                ref={formRef}
                surveySchema={surveySchema}
                formData={surveyFormData}
                onChange={(formProps, validator) => {
                  updateForm(formProps.formData, validator);
                }}
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
          isDisabled={!nextButtonEnabled}
          onPress={savePatient}
          style={{ marginLeft: 'auto' }}
        />
      </FlexRow>
      <PaperModalContainer isVisible={isDeceasedModalOpen} onClose={toggleIsDeceasedAlert}>
        <PaperConfirmModal
          questionText={modalStrings.deceased_patient_vaccination}
          confirmText={generalStrings.ok}
          onConfirm={toggleIsDeceasedAlert}
        />
      </PaperModalContainer>
      <PaperModalContainer isVisible={canDuplicatePatient} onClose={previousTab}>
        <PaperConfirmModal
          questionText={alertText}
          confirmText={generalStrings.ok}
          cancelText={buttonStrings.cancel}
          onConfirm={onConfirmDuplicatePatient}
          onCancel={previousTab}
        />
      </PaperModalContainer>
    </FlexView>
  );
};

const mapDispatchToProps = dispatch => {
  const onCancelPrescription = () => dispatch(VaccinePrescriptionActions.cancel());
  const updateForm = (data, validator) => {
    dispatch(NameNoteActions.updateForm(data, validator));
  };
  const updatePatientDetails = detailsEntered =>
    dispatch(NameActions.updatePatient(detailsEntered));
  const onCompleted = () => dispatch(WizardActions.nextTab());
  const previousTab = () => dispatch(WizardActions.previousTab());

  return { onCancelPrescription, onCompleted, updatePatientDetails, updateForm, previousTab };
};

const mapStateToProps = state => {
  const currentPatient = selectEditingName(state);
  const completedForm = selectCompletedForm(state);
  const canSaveForm = selectCanSaveForm(state) && selectNameNoteIsValid(state);
  const surveySchemas = selectSurveySchemas();
  const [surveySchema] = surveySchemas;
  const nameNote = selectCreatingNameNote(state);
  const canEditPatient = selectCanEditPatient(state);
  const isDuplicatePatientLocally = selectPatientByNameAndDoB(completedForm);

  return {
    canEditPatient,
    canSaveForm,
    completedForm,
    currentPatient,
    surveySchema,
    surveyFormData: nameNote?.data ?? null,
    isDuplicatePatientLocally,
  };
};

PatientEditComponent.defaultProps = {
  surveySchema: undefined,
  currentPatient: null,
  isDuplicatePatientLocally: false,
};

PatientEditComponent.propTypes = {
  canSaveForm: PropTypes.bool.isRequired,
  completedForm: PropTypes.object.isRequired,
  currentPatient: PropTypes.object,
  surveySchema: PropTypes.object,
  onCancelPrescription: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  updatePatientDetails: PropTypes.func.isRequired,
  surveyFormData: PropTypes.object.isRequired,
  updateForm: PropTypes.func.isRequired,
  canEditPatient: PropTypes.bool.isRequired,
  isDuplicatePatientLocally: PropTypes.bool,
  previousTab: PropTypes.func.isRequired,
};

export const PatientEdit = connect(mapStateToProps, mapDispatchToProps)(PatientEditComponent);
