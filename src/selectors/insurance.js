/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const selectInsurancePolicyIsActive = ({ insurancePolicy }) => {
  const { isActive = true } = insurancePolicy ?? {};
  return isActive;
};

export const selectInsurancePolicyDiscountRate = ({ insurancePolicy }) => {
  const isActive = selectInsurancePolicyIsActive({ insurancePolicy });
  const { discountRate = 0 } = isActive ? insurancePolicy ?? {} : {};
  return discountRate;
};

export const selectInsuranceDiscountRate = ({ insurance }) =>
  selectInsurancePolicyDiscountRate(insurance);

export const selectIsSelectedPolicyEditable = ({ insurance }) => {
  const { selectedInsurancePolicy } = insurance ?? {};
  const { patient: policyPatient } = selectedInsurancePolicy ?? {};
  const { isEditable: isPatientEditable } = policyPatient ?? {};
  return isPatientEditable;
};

export const selectInsuranceModalOpen = ({ insurance }) => {
  const { isCreatingInsurancePolicy, isEditingInsurancePolicy } = insurance;
  return isCreatingInsurancePolicy || isEditingInsurancePolicy;
};
