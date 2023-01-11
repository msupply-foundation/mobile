import { createSelector } from 'reselect';
import moment from 'moment';

import { selectSpecificEntityState } from './index';
import { getFormInputConfig } from '../../utilities/formInputConfigs';
import { UIDatabase } from '../../database';

export const selectEditingVaccinePrescriptionId = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { creating } = VaccinePrescriptionState;
  const { id } = creating;
  return id;
};

export const selectEditingVaccinePrescription = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { creating } = VaccinePrescriptionState;
  return creating;
};

export const selectPatientSearchFormConfig = createSelector([], () =>
  getFormInputConfig('searchVaccinePatient')
);

export const selectVaccines = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { vaccines } = VaccinePrescriptionState;
  return vaccines;
};

export const selectSelectedVaccines = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { selectedVaccines } = VaccinePrescriptionState;

  return selectedVaccines;
};

export const selectSelectedBatches = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { selectedBatches } = VaccinePrescriptionState;

  return selectedBatches;
};

export const selectSortedVaccines = createSelector([selectVaccines], vaccines => {
  const sortedVaccines = vaccines.sorted('name');

  // Split the items by quantity - showing out-of-stock items at the end of the list.
  const vaccinesWithStock = sortedVaccines.filtered('ANY batches.numberOfPacks > 0').slice();
  const vaccinesWithoutStock = sortedVaccines.filtered('ALL batches.numberOfPacks == 0').slice();

  return [...vaccinesWithStock, ...vaccinesWithoutStock];
});

export const selectSelectedRows = createSelector([selectSelectedVaccines], vaccines =>
  vaccines.reduce((acc, vaccine) => ({ ...acc, [vaccine?.id]: true }), {})
);

export const selectSelectedBatchRows = createSelector([selectSelectedBatches], batches =>
  batches.reduce((acc, itemBatch) => ({ ...acc, [itemBatch?.id]: true }), {})
);

export const selectHasVaccines = () => {
  const vaccines = UIDatabase.objects('Vaccine');
  return vaccines.length > 0;
};

export const selectHasRefused = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { hasRefused } = VaccinePrescriptionState;
  return hasRefused;
};

export const selectRefusalReason = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { refusalReason } = VaccinePrescriptionState;
  return refusalReason;
};

export const selectSelectedVaccinator = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { vaccinator } = VaccinePrescriptionState;
  return vaccinator;
};

export const selectHaveVaccineStock = () =>
  UIDatabase.objects('Vaccine').filtered(
    'subquery(batches, $batches, $batches.numberOfPacks > 0 ).@count > 0'
  ).length > 0;

export const selectFoundBonusDose = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { bonusDose } = VaccinePrescriptionState;
  return bonusDose;
};

export const selectHistoryIsOpen = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { historyIsOpen } = VaccinePrescriptionState;
  return historyIsOpen;
};

export const selectSelectedSupplementalData = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { supplementalData } = VaccinePrescriptionState;

  return supplementalData;
};

export const selectSupplementalDataIsValid = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { isSupplementalDataValid } = VaccinePrescriptionState;

  return isSupplementalDataValid;
};

export const selectLastSupplementalData = () => {
  const inQuery = UIDatabase.objects('Transaction')
    .filtered("type == 'customer_invoice' AND customData != null")
    .map(({ id }) => `transaction.id == "${id}"`)
    .join(' OR ');
  const fullQuery = `(${inQuery}) AND itemBatch.item.isVaccine == true`;

  if (inQuery) {
    const result = UIDatabase.objects('TransactionBatch')
      .filtered(fullQuery)
      .sorted('transaction.entryDate', true)
      .slice();
    return result.length ? JSON.parse(result[0].transaction.customData) : null;
  }

  return null;
};

export const selectCurrentPatientVaccineHistory = state => {
  const selectedPatient = selectSpecificEntityState(state, 'name');
  const { editing } = selectedPatient;

  const [vaccinationPatientEvent] = UIDatabase.objects('PatientEvent').filtered(
    "code == 'vaccination'"
  );
  const { id: vaccinationPatientEventID } = vaccinationPatientEvent ?? {};

  const patientVaccinationHistory = editing?.nameNotes
    ?.filter(({ patientEventID }) => patientEventID === vaccinationPatientEventID)
    .map(({ data: vaccinationHistory }) => vaccinationHistory);

  return patientVaccinationHistory;
};

export const selectWasPatientVaccinatedWithinOneWeek = state => {
  const oneWeekAgo = moment().subtract(7, 'days').format('L');
  const vaccinationHistory = selectCurrentPatientVaccineHistory(state);
  const weeklyVaccinationHistory = vaccinationHistory?.filter(
    ({ vaccineDate }) => vaccineDate >= oneWeekAgo
  );
  return weeklyVaccinationHistory;
};

export const selectDepartmentFromWeeklyVaccinationHistory = state => {
  const selectDepartmentFromWeeklyVaccination = [];
  const vaccineList = UIDatabase.objects('Vaccine');
  const weeklyVaccinationHistory = selectWasPatientVaccinatedWithinOneWeek(state) ?? [];
  weeklyVaccinationHistory.forEach(vaccine => {
    const matchedVaccine =
      vaccineList.filter(({ code }) => code === vaccine.itemCode)[0]?.department ?? '';
    if (matchedVaccine) {
      selectDepartmentFromWeeklyVaccination.push(matchedVaccine);
    }
  });
  return selectDepartmentFromWeeklyVaccination;
};
