/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import currency from '../localization/currency';
import { UIDatabase } from '../database';
import { sortDataBy } from '../utilities';
import { PREFERENCE_KEYS } from '../database/utilities/preferenceConstants';
import { validateJsonSchemaData } from '../utilities/ajvValidator';
import { convertMobileDateToISO } from '../utilities/formatters';
import { MILLISECONDS_PER_DAY } from '../database/utilities/constants';

// Returns all of a patient's history
// Regular prescriptions fetched via transaction lookup
// Vaccine history fetched via name note lookup
export const selectPatientHistory = ({ patient }) => {
  const { currentPatient } = patient;

  const dispensingTransactions = selectPatientDispensingHistory(currentPatient);
  const vaccineTransactions = selectVaccinePatientHistory(currentPatient);

  return [...dispensingTransactions, ...vaccineTransactions];
};

export const selectPatientDispensingHistory = currentPatient => {
  const { transactions } = currentPatient;

  // Create a query string `transaction.id == "{id} OR transaction.id == "{id}" ...`
  // finding all transaction batches for the patient.
  const inQuery = transactions.map(({ id }) => `transaction.id == "${id}"`).join(' OR ');
  const baseQueryString =
    'type != "cash_in" AND type != "cash_out" AND transaction.status == "finalised"';
  const fullQuery = `(${inQuery}) AND ${baseQueryString} AND itemBatch.item.isVaccine == false`;
  const dispensingTransactions = inQuery
    ? UIDatabase.objects('TransactionBatch').filtered(fullQuery)
    : [];

  return dispensingTransactions;
};

export const selectVaccinePatientHistory = patient => {
  const [vaccinationPatientEvent] = UIDatabase.objects('PatientEvent').filtered(
    "code == 'vaccination'"
  );
  const { id: vaccinationPatientEventID } = vaccinationPatientEvent ?? {};

  const jsonSchema = {
    type: 'object',
    properties: {
      refused: {
        type: 'boolean',
        enum: [false],
      },
      vaccinator: {
        type: 'string',
      },
      itemName: {
        type: 'string',
      },
      itemCode: {
        type: 'string',
      },
      vaccineDate: {
        type: 'string',
      },
    },
  };

  const nameNotes = patient?.nameNotes
    ?.filter(
      ({ patientEventID, data }) =>
        patientEventID === vaccinationPatientEventID && validateJsonSchemaData(jsonSchema, data)
    )
    .map(({ id, data: vaccinationNameNotes }) => ({
      ...vaccinationNameNotes,
      id,
      doses: 1, // Currently not possible to dispense more than 1 dose
      totalQuantity: 1,
      confirmDate: new Date(convertMobileDateToISO(vaccinationNameNotes.vaccineDate)),
      prescriberOrVaccinator: vaccinationNameNotes.vaccinator,
      isVaccine: true,
    }));

  return nameNotes ?? [];
};

export const selectWasPatientVaccinatedWithinOneDay = state => {
  const history = selectVaccinePatientHistory(state);
  const oneDayAgo = new Date().getTime() - MILLISECONDS_PER_DAY;

  return !!history.filter(historyRecord => historyRecord.confirmDate.getTime() > oneDayAgo).length;
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

export const selectCanEditPatient = ({ patient }) => {
  const { currentPatient } = patient;
  const { isEditable = true } = currentPatient ?? {};

  return UIDatabase.getPreference(PREFERENCE_KEYS.CAN_EDIT_PATIENTS_FROM_ANY_STORE) || isEditable;
};
