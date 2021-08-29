/* eslint-disable no-undef */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../database';
import { PREFERENCE_KEYS } from '../database/utilities/constants';
import { INITIALISE_FINISHED, SYNC_TRANSACTION_COMPLETE } from '../sync/constants';

/**
 * Simple reducer managing the stores current modules state.
 */

const initialState = () => {
  const usingInsurance = UIDatabase.objects('InsuranceProvider').length > 0;
  const usingPaymentTypes = UIDatabase.objects('PaymentType').length > 0;
  const usingPrescriptionCategories = UIDatabase.objects('PrescriptionCategory').length > 0;
  const usingSupplierCreditCategories = UIDatabase.objects('SupplierCreditCategory').length > 0;

  const usingDashboard = Boolean(UIDatabase.getPreference(PREFERENCE_KEYS.DASHBOARD_MODULE));
  const usingDispensary = Boolean(UIDatabase.getPreference(PREFERENCE_KEYS.DISPENSARY_MODULE));
  const usingVaccines = Boolean(UIDatabase.getPreference(PREFERENCE_KEYS.VACCINE_MODULE));
  const usingPayments = Boolean(UIDatabase.getPreference(PREFERENCE_KEYS.PAYMENT_MODULE));
  const usingPatientTypes = Boolean(UIDatabase.getPreference(PREFERENCE_KEYS.PATIENT_TYPES));
  const usingAdverseDrugReactions = UIDatabase.objects('ADRForm').length > 0;

  const usingHideSnapshotColumn = Boolean(
    UIDatabase.getPreference(PREFERENCE_KEYS.HIDE_SNAPSHOT_COLUMN)
  );
  const usingCashRegister = Boolean(
    UIDatabase.getPreference(PREFERENCE_KEYS.CASH_REGISTER_MODULE) && usingPaymentTypes
  );

  const canEditAnyPatient = Boolean(
    UIDatabase.getPreference(PREFERENCE_KEYS.CAN_EDIT_PATIENTS_FROM_ANY_STORE)
  );

  const usingModules = usingDashboard || usingVaccines || usingCashRegister;

  return {
    usingAdverseDrugReactions,
    canEditAnyPatient,
    usingPayments,
    usingDashboard,
    usingDispensary,
    usingVaccines,
    usingCashRegister,
    usingModules,
    usingInsurance,
    usingPrescriptionCategories,
    usingSupplierCreditCategories,
    usingPaymentTypes,
    usingPatientTypes,
    usingHideSnapshotColumn,
  };
};

export const ModulesReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    // After sync, refresh modules state
    case INITIALISE_FINISHED:
    case SYNC_TRANSACTION_COMPLETE: {
      return initialState();
    }

    default:
      return state;
  }
};
