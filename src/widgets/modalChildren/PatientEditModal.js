/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FormControl } from '../FormControl';
import { PageButton } from '../PageButton';
import { FlexRow } from '../FlexRow';
import { JSONForm } from '../JSONForm/JSONForm';
import { NameNoteActions } from '../../actions/Entities/NameNoteActions';
import { selectNameNoteIsValid, selectCreatingNameNote } from '../../selectors/Entities/nameNote';
import { selectCompletedForm, selectCanSaveForm } from '../../selectors/form';
import { PatientActions } from '../../actions/PatientActions';
import globalStyles, { SUSSOL_ORANGE } from '../../globalStyles';
import { generalStrings, modalStrings } from '../../localization/index';

export const PatientEditModalComponent = ({
  isDisabled,
  onSaveForm,
  onDeleteForm,
  onCancel,
  inputConfig,
  surveySchema,
  surveyForm,
  onUpdateForm,
  nameNoteIsValid,
  canSaveForm,
}) => {
  let canSave = canSaveForm;
  if (canSave) {
    canSave = surveySchema && surveyForm ? nameNoteIsValid : !isDisabled;
  }

  return (
    <FlexRow style={{ flexDirection: 'column' }} flex={1}>
      <FlexRow flex={1}>
        <FormControl
          canSave={surveySchema ? nameNoteIsValid : true}
          isDisabled={isDisabled}
          onSave={onSaveForm}
          onCancel={onCancel}
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
          <PageButton
            onPress={onDeleteForm}
            style={styles.cancelButton}
            textStyle={styles.saveButtonTextStyle}
            text={generalStrings.delete}
          />
          <PageButton
            onPress={onCancel}
            style={styles.cancelButton}
            textStyle={styles.cancelButtonTextStyle}
            text={modalStrings.cancel}
          />
        </View>
      </FlexRow>
    </FlexRow>
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
  isDisabled: false,
  surveyForm: null,
  surveySchema: null,
  nameNoteIsValid: true,
};

PatientEditModalComponent.propTypes = {
  isDisabled: PropTypes.bool,
  onSaveForm: PropTypes.func.isRequired,
  onDeleteForm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  inputConfig: PropTypes.array.isRequired,
  surveyForm: PropTypes.object,
  nameNoteIsValid: PropTypes.bool,
  surveySchema: PropTypes.object,
  onUpdateForm: PropTypes.func.isRequired,
  canSaveForm: PropTypes.bool.isRequired,
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { completedForm } = stateProps;
  const { onSave, onDelete, onSaveSurvey, ...otherDispatchProps } = dispatchProps;
  const { surveySchema, patient } = ownProps;

  const onSaveForm = () => {
    onSave(completedForm);
    if (surveySchema) onSaveSurvey();
  };

  const onDeleteForm = () => {
    onDelete(patient.id);
  };

  return {
    ...ownProps,
    ...otherDispatchProps,
    ...stateProps,
    onSaveForm,
    onDeleteForm,
  };
};

const stateToProps = state => {
  const nameNoteIsValid = selectNameNoteIsValid(state);
  const nameNote = selectCreatingNameNote(state);
  const completedForm = selectCompletedForm(state);
  const canSaveForm = selectCanSaveForm(state);

  return { canSaveForm, completedForm, nameNoteIsValid, surveyForm: nameNote?.data ?? null };
};

const dispatchToProps = dispatch => ({
  onSaveSurvey: () => dispatch(NameNoteActions.saveEditing()),
  onUpdateForm: (form, validator) => dispatch(NameNoteActions.updateForm(form, validator)),
  onSave: patientDetails => dispatch(PatientActions.patientUpdate(patientDetails)),
  onDelete: patientID => dispatch(PatientActions.patientDelete(patientID)),
});

export const PatientEditModal = connect(
  stateToProps,
  dispatchToProps,
  mergeProps
)(PatientEditModalComponent);
