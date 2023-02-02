/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { selectPrescriberModalOpen, selectCanEditPrescriber } from '../../selectors/prescriber';
import { ModalContainer } from './ModalContainer';
import { FormControl } from '..';
import { dispensingStrings } from '../../localization';
import { getFormInputConfig } from '../../utilities/formInputConfigs';
import { PrescriberActions } from '../../actions/PrescriberActions';

const PrescriberModelComponent = ({
  savePrescriber,
  cancelPrescriberEdit,
  // Prescriber variables
  currentPrescriber,
  prescriberModalOpen,
  canEditPrescriber,
}) => (
  <ModalContainer
    title={`${dispensingStrings.prescriber} ${dispensingStrings.details}`}
    noCancel
    isVisible={prescriberModalOpen}
  >
    <FormControl
      isDisabled={!canEditPrescriber}
      onSave={savePrescriber}
      onCancel={cancelPrescriberEdit}
      inputConfig={getFormInputConfig('prescriber', currentPrescriber)}
    />
  </ModalContainer>
);

const mapDispatchToProps = dispatch => ({
  cancelPrescriberEdit: () => dispatch(PrescriberActions.closeModal()),
  savePrescriber: prescriberDetails =>
    dispatch(PrescriberActions.updatePrescriber(prescriberDetails)),
});

const mapStateToProps = state => {
  const { prescriber } = state;
  const { currentPrescriber } = prescriber;

  const prescriberModalOpen = selectPrescriberModalOpen(state);
  const canEditPrescriber = selectCanEditPrescriber(state);

  return {
    prescriberModalOpen,
    // Prescriber
    currentPrescriber,
    canEditPrescriber,
  };
};

export const PrescriberModel = connect(
  mapStateToProps,
  mapDispatchToProps
)(PrescriberModelComponent);

PrescriberModelComponent.defaultProps = {
  currentPrescriber: null,
  canEditPrescriber: false,
};

PrescriberModelComponent.propTypes = {
  prescriberModalOpen: PropTypes.bool.isRequired,
  currentPrescriber: PropTypes.object,
  canEditPrescriber: PropTypes.bool,
  savePrescriber: PropTypes.func.isRequired,
  cancelPrescriberEdit: PropTypes.func.isRequired,
};
