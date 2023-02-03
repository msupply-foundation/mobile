/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { selectInsuranceModalOpen, selectCanEditInsurancePolicy } from '../../selectors/insurance';
import { selectCanEditPatient } from '../../selectors/patient';
import { ModalContainer } from './ModalContainer';
import { FormControl } from '..';
import { InsuranceActions } from '../../actions/InsuranceActions';
import { dispensingStrings } from '../../localization';
import { getFormInputConfig } from '../../utilities/formInputConfigs';

const InsurancePolicyModelComponent = ({
  canEditPatient,
  // Insurance variables
  insuranceModalOpen,
  selectedInsurancePolicy,
  canEditInsurancePolicy,
  isCreatingInsurancePolicy,
  // Insurance callbacks
  cancelInsuranceEdit,
  saveInsurancePolicy,
}) => (
  <ModalContainer
    title={`${dispensingStrings.insurance_policy}`}
    noCancel
    isVisible={insuranceModalOpen}
  >
    <FormControl
      isDisabled={!canEditInsurancePolicy}
      confirmOnSave={!canEditPatient}
      confirmText={dispensingStrings.confirm_new_policy}
      onSave={saveInsurancePolicy}
      onCancel={cancelInsuranceEdit}
      inputConfig={getFormInputConfig(
        'insurancePolicy',
        isCreatingInsurancePolicy ? null : selectedInsurancePolicy
      )}
    />
  </ModalContainer>
);

const mapDispatchToProps = dispatch => ({
  cancelInsuranceEdit: () => dispatch(InsuranceActions.cancel()),
  saveInsurancePolicy: policyDetails => dispatch(InsuranceActions.update(policyDetails)),
});

const mapStateToProps = state => {
  const { insurance } = state;
  const { isCreatingInsurancePolicy, selectedInsurancePolicy } = insurance;

  const insuranceModalOpen = selectInsuranceModalOpen(state);
  const canEditPatient = selectCanEditPatient(state);
  const canEditInsurancePolicy = selectCanEditInsurancePolicy(state);

  return {
    insuranceModalOpen,
    canEditPatient,
    canEditInsurancePolicy,
    isCreatingInsurancePolicy,
    selectedInsurancePolicy,
  };
};

export const InsurancePolicyModel = connect(
  mapStateToProps,
  mapDispatchToProps
)(InsurancePolicyModelComponent);

InsurancePolicyModelComponent.defaultProps = {
  selectedInsurancePolicy: null,
};

InsurancePolicyModelComponent.propTypes = {
  canEditPatient: PropTypes.bool.isRequired,
  insuranceModalOpen: PropTypes.bool.isRequired,
  canEditInsurancePolicy: PropTypes.bool.isRequired,
  cancelInsuranceEdit: PropTypes.func.isRequired,
  isCreatingInsurancePolicy: PropTypes.bool.isRequired,
  saveInsurancePolicy: PropTypes.func.isRequired,
  selectedInsurancePolicy: PropTypes.object,
};
