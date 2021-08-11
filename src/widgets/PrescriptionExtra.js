/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { DropDown } from './DropDown';
import { PageInfo } from './PageInfo/PageInfo';
import { TextEditor } from './modalChildren';
import { ModalContainer } from './modals/ModalContainer';

import { PrescriptionActions } from '../actions/PrescriptionActions';
import { pageInfoStrings, modalStrings, dispensingStrings } from '../localization';
import {
  selectTransactionComment,
  selectPatientType,
  selectTransactionCategoryName,
  selectPrescriptionCategories,
} from '../selectors/prescription';
import { selectUsingPrescriptionCategories, selectUsingPatientTypes } from '../selectors/modules';

const PATIENT_TYPES = [dispensingStrings.inpatient, dispensingStrings.outpatient];

const PrescriptionExtraComponent = ({
  onOpenCommentModal,
  onEditComment,
  onCloseCommentModal,
  onUpdatePatientType,
  onUpdateCategory,
  commentModalOpen,
  comment,
  categoryName,
  patientType,
  prescriptionCategories,
  usingPatientTypes,
  usingPrescriptionCategories,
}) => {
  const onCategorySelection = React.useCallback((_, index) => {
    onUpdateCategory(prescriptionCategories[index]);
  }, []);

  const prescriptionCategoryNames = React.useMemo(
    () => prescriptionCategories.map(({ name }) => name),
    [prescriptionCategories]
  );

  const pageInfoColumns = React.useMemo(
    () => [
      [
        {
          title: `${pageInfoStrings.comment}:`,
          info: comment,
          onPress: onOpenCommentModal,
          editableType: 'text',
        },
      ],
    ],
    [comment, onOpenCommentModal]
  );

  return (
    <View style={localStyles.container}>
      {!!usingPatientTypes && (
        <DropDown
          headerValue={dispensingStrings.select_a_patient_type}
          values={PATIENT_TYPES}
          selectedValue={patientType}
          onValueChange={onUpdatePatientType}
        />
      )}
      {!!usingPrescriptionCategories && (
        <DropDown
          headerValue={dispensingStrings.select_a_prescription_category}
          values={prescriptionCategoryNames}
          selectedValue={categoryName}
          onValueChange={onCategorySelection}
        />
      )}
      <PageInfo columns={pageInfoColumns} />
      <ModalContainer
        onClose={onCloseCommentModal}
        isVisible={commentModalOpen}
        title={modalStrings.edit_the_prescription_comment}
      >
        <TextEditor onEndEditing={onEditComment} text={comment} />
      </ModalContainer>
    </View>
  );
};

PrescriptionExtraComponent.propTypes = {
  onOpenCommentModal: PropTypes.func.isRequired,
  onEditComment: PropTypes.func.isRequired,
  onCloseCommentModal: PropTypes.func.isRequired,
  onUpdatePatientType: PropTypes.func.isRequired,
  onUpdateCategory: PropTypes.func.isRequired,
  commentModalOpen: PropTypes.bool.isRequired,
  comment: PropTypes.string.isRequired,
  categoryName: PropTypes.string.isRequired,
  patientType: PropTypes.string.isRequired,
  prescriptionCategories: PropTypes.object.isRequired,
  usingPatientTypes: PropTypes.bool.isRequired,
  usingPrescriptionCategories: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
  const { prescription } = state;
  const { commentModalOpen } = prescription;
  const comment = selectTransactionComment(state);
  const categoryName = selectTransactionCategoryName(state);
  const patientType = selectPatientType(state);
  const prescriptionCategories = selectPrescriptionCategories(state);
  const usingPrescriptionCategories = selectUsingPrescriptionCategories(state);
  const usingPatientTypes = selectUsingPatientTypes(state);

  return {
    commentModalOpen,
    comment,
    categoryName,
    patientType,
    prescriptionCategories,
    usingPatientTypes,
    usingPrescriptionCategories,
  };
};

const mapDispatchToProps = dispatch => {
  const onOpenCommentModal = () => dispatch(PrescriptionActions.openCommentModal());
  const onEditComment = newValue => dispatch(PrescriptionActions.editComment(newValue));
  const onCloseCommentModal = () => dispatch(PrescriptionActions.closeCommentModal());
  const onUpdatePatientType = newValue => dispatch(PrescriptionActions.editPatientType(newValue));
  const onUpdateCategory = newValue =>
    dispatch(PrescriptionActions.editTransactionCategory(newValue));

  return {
    onOpenCommentModal,
    onEditComment,
    onCloseCommentModal,
    onUpdatePatientType,
    onUpdateCategory,
  };
};

const localStyles = StyleSheet.create({
  container: {
    elevation: 5,
    backgroundColor: 'white',
    borderRadius: 5,
    marginHorizontal: 50,
    marginBottom: 10,
    padding: 10,
  },
});

export const PrescriptionExtra = connect(
  mapStateToProps,
  mapDispatchToProps
)(PrescriptionExtraComponent);
