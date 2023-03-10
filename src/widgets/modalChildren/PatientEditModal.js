/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useIsFocused } from '@react-navigation/core';
import { FormControl } from '..';
import { PageButton } from '../PageButton';
import { FlexRow } from '../FlexRow';
import { JSONForm } from '../JSONForm/JSONForm';
import { NameNoteActions } from '../../actions/Entities/NameNoteActions';
import { selectNameNoteIsValid, selectCreatingNameNote } from '../../selectors/Entities/nameNote';
import {
  selectSortedPatientHistory,
  selectIsCreatePatient,
  selectPatientModalOpen,
  selectCanEditPatient,
  selectPatientByNameAndDoB,
} from '../../selectors/patient';
import { selectCompletedForm, selectCanSaveForm } from '../../selectors/form';
import { PatientActions } from '../../actions/PatientActions';
import globalStyles, { SUSSOL_ORANGE } from '../../globalStyles';
import {
  generalStrings,
  modalStrings,
  buttonStrings,
  navStrings,
  dispensingStrings,
} from '../../localization';
import { PaperModalContainer } from '../PaperModal/PaperModalContainer';
import { PaperConfirmModal } from '../PaperModal/PaperConfirmModal';
import { useToggle } from '../../hooks/index';
import { ModalContainer } from '../modals';
import { getFormInputConfig } from '../../utilities/formInputConfigs';
import { selectSurveySchemas } from '../../selectors/formSchema';

const PatientEditModalComponent = ({
  canEditPatient,
  onSaveForm,
  onDeleteForm,
  cancelPatientEdit,
  inputConfig,
  surveySchema,
  surveyForm,
  onUpdateForm,
  nameNoteIsValid,
  canSaveForm,
  hasVaccineEventsForm,
  isCreatePatient,
  patientEditModalOpen,
  isDuplicatePatientLocally,
  isDuplicatePatientExist,
}) => {
  const isFocused = useIsFocused();

  let canSave = canSaveForm && canEditPatient;

  const hasVaccineEvents = hasVaccineEventsForm;
  console.log('isDuplicatePatientLocally ', isDuplicatePatientLocally);

  if (canSave && !!surveySchema) {
    canSave = surveySchema && surveyForm && nameNoteIsValid;
  }

  const canDelete = canEditPatient;
  const showDelete = !isCreatePatient;

  const [removeModalOpen, toggleRemoveModal] = useToggle();
  const [cannotDeleteModalOpen, toggleCannotDeleteModal] = useToggle();
  // const [isDuplicatePatientModalOpen, setDuplicatePatientModal] = useState(false);

  const toggleDuplicatePatientModal = () => !isDuplicatePatientExist;
  console.log('isDuplicatePatientExist ', isDuplicatePatientExist);

  // const canEnterDuplicatePatient = () => setDuplicatePatient(isDuplicatePatientLocally);

  return (
    <ModalContainer
      title={`${dispensingStrings.patient_detail}`}
      noCancel
      isVisible={isFocused && patientEditModalOpen}
    >
      <FlexRow style={{ flexDirection: 'column' }} flex={1}>
        <FlexRow flex={1}>
          <FormControl
            canSave={surveySchema ? nameNoteIsValid : true}
            isDisabled={!canEditPatient}
            onSave={onSaveForm}
            onCancel={cancelPatientEdit}
            inputConfig={inputConfig}
            showCancelButton={false}
            showSaveButton={false}
          />
          {!!surveySchema && !!surveyForm && (
            <View style={styles.formContainer}>
              <JSONForm
                surveySchema={surveySchema}
                formData={surveyForm}
                onChange={({ formData }, validator) => {
                  onUpdateForm(formData, validator);
                }}
              >
                <></>
              </JSONForm>
            </View>
          )}
        </FlexRow>
        <FlexRow flex={0} style={{ justifyContent: 'center' }}>
          <View style={styles.buttonsRow}>
            <PageButton
              onPress={onSaveForm}
              style={styles.saveButton}
              isDisabled={!canSave}
              textStyle={styles.saveButtonTextStyle}
              text={generalStrings.save}
            />
            {showDelete && (
              <PageButton
                onPress={hasVaccineEvents ? toggleCannotDeleteModal : toggleRemoveModal}
                style={styles.cancelButton}
                textStyle={styles.saveButtonTextStyle}
                isDisabled={!canDelete}
                text={generalStrings.delete}
              />
            )}
            <PageButton
              onPress={cancelPatientEdit}
              style={styles.cancelButton}
              textStyle={styles.cancelButtonTextStyle}
              text={modalStrings.cancel}
            />
          </View>
        </FlexRow>
        <PaperModalContainer isVisible={cannotDeleteModalOpen} onClose={toggleCannotDeleteModal}>
          <PaperConfirmModal
            questionText={modalStrings.patient_cant_delete_with_vaccine_events}
            confirmText={navStrings.go_back}
            onConfirm={toggleCannotDeleteModal}
          />
        </PaperModalContainer>
        <PaperModalContainer isVisible={removeModalOpen} onClose={toggleRemoveModal}>
          <PaperConfirmModal
            questionText={modalStrings.are_you_sure_delete_patient}
            confirmText={generalStrings.remove}
            cancelText={buttonStrings.cancel}
            onConfirm={onDeleteForm}
            isDisabled={!canDelete}
            onCancel={toggleRemoveModal}
          />
        </PaperModalContainer>
        <PaperModalContainer
          isVisible={isDuplicatePatientExist}
          onClose={toggleDuplicatePatientModal}
        >
          <PaperConfirmModal
            questionText={modalStrings.are_you_sure_delete_patient}
            confirmText={generalStrings.remove}
            cancelText={buttonStrings.cancel}
            onConfirm={onDeleteForm}
            onCancel={toggleDuplicatePatientModal}
          />
        </PaperModalContainer>
      </FlexRow>
    </ModalContainer>
  );
};

const styles = StyleSheet.create({
  buttonsRow: { flex: 1, marginTop: 10, flexDirection: 'row-reverse' },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
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

PatientEditModalComponent.defaultProps = {
  canEditPatient: false,
  surveyForm: null,
  surveySchema: null,
  nameNoteIsValid: true,
  isCreatePatient: false,
  isDuplicatePatientLocally: false,
};

PatientEditModalComponent.propTypes = {
  canEditPatient: PropTypes.bool,
  onSaveForm: PropTypes.func.isRequired,
  onDeleteForm: PropTypes.func.isRequired,
  cancelPatientEdit: PropTypes.func.isRequired,
  inputConfig: PropTypes.array.isRequired,
  surveyForm: PropTypes.object,
  nameNoteIsValid: PropTypes.bool,
  surveySchema: PropTypes.object,
  onUpdateForm: PropTypes.func.isRequired,
  canSaveForm: PropTypes.bool.isRequired,
  hasVaccineEventsForm: PropTypes.bool.isRequired,
  isCreatePatient: PropTypes.bool,
  patientEditModalOpen: PropTypes.bool.isRequired,
  isDuplicatePatientLocally: PropTypes.bool,
  isDuplicatePatientExist: PropTypes.bool.isRequired,
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { completedForm, isDuplicatePatientLocally } = stateProps;
  const { onSave, onDelete, onSaveSurvey, ...otherDispatchProps } = dispatchProps;
  // const { surveySchema } = ownProps;
  const surveySchema = selectSurveySchemas()[0];
  let isDuplicatePatientExist = false;
  const onSaveForm = () => {
    if (isDuplicatePatientLocally) {
      isDuplicatePatientExist = isDuplicatePatientLocally;
    }
    onSave(completedForm);
    if (surveySchema) onSaveSurvey();
  };

  const onDeleteForm = () => {
    onDelete();
  };

  return {
    ...ownProps,
    ...otherDispatchProps,
    ...stateProps,
    surveySchema,
    onSaveForm,
    onDeleteForm,
    isDuplicatePatientExist,
  };
};

const stateToProps = state => {
  const { patient } = state;

  const { currentPatient } = patient;
  const inputConfig = getFormInputConfig('patient', currentPatient);

  const canEditPatient = selectCanEditPatient(state);
  const nameNoteIsValid = selectNameNoteIsValid(state);
  const nameNote = selectCreatingNameNote(state);
  const completedForm = selectCompletedForm(state);
  const canSaveForm = selectCanSaveForm(state);
  const patientHistory =
    patient.currentPatient && patient.currentPatient.transactions
      ? selectSortedPatientHistory({ patient })
      : [];
  const isCreatePatient = selectIsCreatePatient(state);
  const hasVaccineEventsForm = patientHistory.length > 0;
  const [patientEditModalOpen] = selectPatientModalOpen(state);
  console.log('completedForm ', completedForm);

  const isDuplicatePatientLocally = selectPatientByNameAndDoB(completedForm);

  return {
    canSaveForm,
    canEditPatient,
    hasVaccineEventsForm,
    completedForm,
    nameNoteIsValid,
    isCreatePatient,
    surveyForm: nameNote?.data ?? null,
    patientEditModalOpen,
    inputConfig,
    isDuplicatePatientLocally,
  };
};

const dispatchToProps = dispatch => ({
  onSaveSurvey: () => dispatch(NameNoteActions.saveEditing()),
  onUpdateForm: (form, validator) => dispatch(NameNoteActions.updateForm(form, validator)),
  onSave: patientDetails => dispatch(PatientActions.patientUpdate(patientDetails)),
  onDelete: () => dispatch(PatientActions.patientDelete()),
  cancelPatientEdit: () => dispatch(PatientActions.closeModal()),
});

export const PatientEditModal = connect(
  stateToProps,
  dispatchToProps,
  mergeProps
)(PatientEditModalComponent);
