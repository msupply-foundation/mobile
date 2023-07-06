/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import moment from 'moment';

import currency from '../localization/currency';
import { UIDatabase } from '../database';
import { sortDataBy } from '../utilities';
import { PREFERENCE_KEYS } from '../database/utilities/preferenceConstants';
import { selectVaccinePatientHistory } from './Entities/name';

// Returns all of a patient's history
// Regular prescriptions fetched via transaction lookup
// Vaccine history fetched via name note lookup
export const selectPatientHistory = ({ patient }) => {
  const { currentPatient } = patient;
  const { transactions } = currentPatient;

  // If there is no transactions return empty array
  if (!transactions) return [];

  // Create a query string `transaction.id == "{id} OR transaction.id == "{id}" ...`
  // finding all transaction batches for the patient.
  const inQuery = transactions.map(({ id }) => `transaction.id == "${id}"`).join(' OR ');
  const baseQueryString =
    'type != "cash_in" AND type != "cash_out" AND transaction.status == "finalised"';
  const fullQuery = `(${inQuery}) AND ${baseQueryString} AND itemBatch.item.isVaccine == false`;
  const dispensingTransactions = inQuery
    ? UIDatabase.objects('TransactionBatch').filtered(fullQuery)
    : [];
  const vaccineTransactions = selectVaccinePatientHistory(currentPatient);

  return [...dispensingTransactions, ...vaccineTransactions];
};

export const selectSortedPatientHistory = ({ patient }) => {
  const { sortKey, isAscending } = patient;
  const patientHistory = selectPatientHistory({ patient });

  return patientHistory ? sortDataBy(patientHistory.slice(), sortKey, isAscending) : patientHistory;
};

export const selectCurrentPatient = ({ patient }) => {
  const { currentPatient } = patient;
  return currentPatient;
};

export const selectAvailableCredit = ({ patient }) =>
  currency(patient?.currentPatient?.availableCredit);

// TODO
export const selectPatientInsurancePolicies = ({ patient }) => {
  const { currentPatient } = patient;
  const { policies } = currentPatient;
  return policies.map(policy => {
    const { isActive, policyNumber, id, discountRate } = policy;
    return isActive
      ? policy
      : { isActive, id, discountRate, policyNumber: `${policyNumber} (inactive)` };
  });
};
export const selectPatientModalOpen = ({ patient }) => {
  const { creatingADR, viewingHistory, isCreating, isEditing } = patient;
  return [isCreating || isEditing, viewingHistory, creatingADR];
};

/**
 * Check if it is create Patient form.
 * @param { patient } patient
 * @returns boolean
 */
export const selectIsCreatePatient = ({ patient }) => {
  const { isCreating } = patient;
  return isCreating;
};

export const selectCanEditPatient = ({ patient }) => {
  const { currentPatient } = patient;
  const { isEditable = true } = currentPatient ?? {};

  return UIDatabase.getPreference(PREFERENCE_KEYS.CAN_EDIT_PATIENTS_FROM_ANY_STORE) || isEditable;
};

/**
 * Query an existing patient by its name(firstName lastName) and DoB,
 * if patient exist then return True
 * @param { lastName, firstName, dateOfBirth } from completed Form
 * @returns boolean, True if patient exist with same lastName, firstName, dateOfBirth
 */

export const selectPatientByNameAndDoB = ({ lastName, firstName, dateOfBirth }) => {
  if (dateOfBirth) {
    const dob = moment(dateOfBirth).format('L');
    const query = 'lastName BEGINSWITH[c] $0 AND firstName BEGINSWITH[c] $1 AND isDeleted = $2';
    const duplicatePatients = UIDatabase.objects('Patient').filtered(
      query,
      lastName.trim(),
      firstName.trim(),
      false
    );
    if (duplicatePatients) {
      const duplicatePatient = duplicatePatients.some(selectedPatient => {
        const selectedDoB = selectedPatient.dateOfBirth;
        return moment(selectedDoB).format('L') === dob;
      });
      return duplicatePatient;
    }
  }
  return false;
};
