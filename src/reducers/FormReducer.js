/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { FORM_ACTIONS } from '../actions/FormActions';
import { UIDatabase } from '../database/index';
import { INSURANCE_POLICY_FIELDS } from '../utilities/modules/dispensary/constants';

const initialState = config => {
  if (!config) return {};

  return config.reduce(
    (acc, { key, initialValue, validator, isRequired }) => ({
      ...acc,
      [key]: {
        value: initialValue,
        isValid: validator ? validator(initialValue) : true,
        validator,
        isRequired,
      },
    }),
    {}
  );
};

export const FormReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case FORM_ACTIONS.INITIALISE: {
      const { payload } = action;
      const { config } = payload;
      return initialState(config);
    }
    case FORM_ACTIONS.UPDATE: {
      const { payload } = action;
      const { key, value } = payload;

      const updatePolicyNumberPerson = key === INSURANCE_POLICY_FIELDS.POLICY_NUMBER_PERSON;
      const updatePolicyNumberFamily = key === INSURANCE_POLICY_FIELDS.POLICY_NUMBER_FAMILY;

      if (updatePolicyNumberPerson || updatePolicyNumberFamily) {
        const { policyNumberPerson: policyNumberPersonState } = state;
        const { value: policyNumberPersonValue } = updatePolicyNumberPerson
          ? { value }
          : policyNumberPersonState;

        const { policyNumberFamily: policyNumberFamilyState } = state;
        const { value: policyNumberFamilyValue } = updatePolicyNumberFamily
          ? { value }
          : policyNumberFamilyState;

        const policyNumberPersonLength = policyNumberPersonValue.length;
        const policyNumberFamilyLength = policyNumberFamilyValue.length;

        const isPolicyNumberUnique =
          UIDatabase.objects('InsurancePolicy').filtered(
            'policyNumberPerson == $0 && policyNumberFamily == $1',
            policyNumberPersonValue,
            policyNumberFamilyValue
          ).length === 0;

        const isPolicyNumberPersonLengthValid = updatePolicyNumberPerson
          ? policyNumberPersonLength > 0 && policyNumberPersonLength < 50
          : true;
        const isPolicyNumberFamilyLengthValid = updatePolicyNumberFamily
          ? policyNumberFamilyLength > 0 && policyNumberFamilyLength < 50
          : true;

        const newPolicyNumberPersonState = {
          ...policyNumberPersonState,
          value: policyNumberPersonValue,
          isValid: isPolicyNumberUnique && isPolicyNumberPersonLengthValid,
        };

        const newPolicyNumberFamilyState = {
          ...policyNumberFamilyState,
          value: policyNumberFamilyValue,
          isValid: isPolicyNumberUnique && isPolicyNumberFamilyLengthValid,
        };

        return {
          ...state,
          policyNumberPerson: newPolicyNumberPersonState,
          policyNumberFamily: newPolicyNumberFamilyState,
        };
      }

      const stateData = state[key];

      const { validator } = stateData;

      const newStateData = {
        ...stateData,
        value,
        isValid: validator ? validator(value) : true,
      };

      return { ...state, [key]: newStateData };
    }
    case FORM_ACTIONS.CANCEL: {
      return initialState();
    }
    default:
      return state;
  }
};
