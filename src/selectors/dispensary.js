/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { createSelector } from 'reselect';
import moment from 'moment';

import { getFormInputConfig } from '../utilities/formInputConfigs';

export const RECORD_TYPES = {
  PATIENT: 'patient',
  PRESCRIBER: 'prescriber',
};

export const LOOKUP_FORM_CONFIGS = {
  [RECORD_TYPES.PATIENT]: 'searchPatient',
  [RECORD_TYPES.PRESCRIBER]: 'searchPrescriber',
};

export const LOOKUP_LIST_CONFIGS = {
  [RECORD_TYPES.PATIENT]: ['firstName', 'lastName', 'dateOfBirth'],
  [RECORD_TYPES.PRESCRIBER]: ['firstName', 'lastName', 'registrationCode'],
};

export const selectSortKey = ({ dispensary }) => {
  const { sortKey } = dispensary;
  return sortKey;
};

export const selectSearchTerm = ({ dispensary }) => {
  const { searchTerm } = dispensary;
  return searchTerm;
};

export const selectIsAscending = ({ dispensary }) => {
  const { isAscending } = dispensary;
  return isAscending;
};

export const selectDataSet = ({ dispensary }) => {
  const { dataSet } = dispensary;
  return dataSet;
};

export const selectData = ({ dispensary }) => {
  const dataSet = selectDataSet({ dispensary });
  const { data } = dispensary;

  return dataSet === 'patient' ? data.filtered('isDeleted == false') : data;
};

export const selectDataSetInUse = ({ dispensary }) => {
  const dataSet = selectDataSet({ dispensary });
  const usingPatientsDataSet =
    dataSet === 'patient' || dataSet === 'patientWithAdverseDrugReactions';
  const usingPrescribersDataSet = dataSet === 'prescriber';

  return [usingPatientsDataSet, usingPrescribersDataSet];
};

export const selectLookupModalOpen = ({ dispensary }) => {
  const { isLookupModalOpen } = dispensary;
  return isLookupModalOpen;
};

export const selectADRModalOpen = ({ dispensary }) => {
  const { isADRModalOpen } = dispensary;
  return isADRModalOpen;
};

export const selectFilteredData = createSelector(
  [selectData, selectSearchTerm, selectDataSetInUse],
  (data, searchTerm, [usingPatientsDataSet]) => {
    const [names, birthYearString] = searchTerm.split(/-d/).map(name => name.trim());
    const [lastName, firstName] = names.split(/,/).map(name => name.trim());

    const birthYearDate = moment(birthYearString, 'Y', null, true);
    const filterByBirthDate = usingPatientsDataSet && birthYearDate.isValid();

    let filteredData = lastName ? data.filtered('lastName BEGINSWITH[c] $0', lastName) : data;
    filteredData = firstName
      ? filteredData.filtered('firstName BEGINSWITH[c] $0', firstName)
      : filteredData;

    return filterByBirthDate
      ? filteredData.filtered('dateOfBirth >= $0', birthYearDate.toDate())
      : filteredData;
  }
);

export const selectSortedData = createSelector(
  [selectFilteredData, selectIsAscending, selectSortKey],
  (data, isAscending, sortKey) => data.sorted(sortKey, !isAscending)
);

export const selectLookupFormConfig = createSelector([selectDataSet], dataSource => {
  const mappedDataSource =
    dataSource === RECORD_TYPES.PRESCRIBER ? RECORD_TYPES.PRESCRIBER : RECORD_TYPES.PATIENT;
  return getFormInputConfig(LOOKUP_FORM_CONFIGS[mappedDataSource]);
});

export const selectLookupListConfig = createSelector(
  [selectDataSet, selectLookupFormConfig],
  (dataSource, formConfig) => {
    const mappedDataSource =
      dataSource === RECORD_TYPES.PRESCRIBER ? RECORD_TYPES.PRESCRIBER : RECORD_TYPES.PATIENT;
    const listKeys = LOOKUP_LIST_CONFIGS[mappedDataSource];

    const listTypes = listKeys.reduce(
      (acc, key) => ({ ...acc, [key]: formConfig.find(config => config.key === key)?.type }),
      {}
    );
    return listKeys.map(key => ({ key, type: listTypes[key] }));
  }
);
