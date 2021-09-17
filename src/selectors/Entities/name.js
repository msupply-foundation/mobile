import { createSelector } from 'reselect';
import moment from 'moment';
import { UIDatabase } from '../../database';
import { selectSpecificEntityState } from './index';
import { DATE_FORMAT } from '../../utilities/constants';
import { PREFERENCE_KEYS } from '../../database/utilities/preferenceConstants';

export const selectEditingNameId = state => {
  const NameState = selectSpecificEntityState(state, 'name');
  const { editing } = NameState;
  const { id } = editing ?? {};
  return id;
};

export const selectEditingName = state => {
  const NameState = selectSpecificEntityState(state, 'name');
  const { editing } = NameState;
  return editing;
};

export const selectSortKey = state => {
  const NameState = selectSpecificEntityState(state, 'name');
  const { sortKey } = NameState;
  return sortKey;
};

export const selectSearchParameters = state => {
  const NameState = selectSpecificEntityState(state, 'name');
  const { searchParameters } = NameState;
  return searchParameters;
};

export const selectIsAscending = state => {
  const NameState = selectSpecificEntityState(state, 'name');
  const { isAscending } = NameState;
  return isAscending;
};

export const selectFilteredPatients = createSelector([selectSearchParameters], searchParameters => {
  const { lastName, firstName, dateOfBirth } = searchParameters;
  const query = 'lastName BEGINSWITH[c] $0 AND firstName BEGINSWITH[c] $1';
  const patients = UIDatabase.objects('Patient').filtered(query, lastName, firstName);

  if (!dateOfBirth) {
    return patients;
  }

  const dob = moment(dateOfBirth, DATE_FORMAT.DD_MM_YYYY, null, true);
  if (!dob.isValid()) {
    return patients;
  }

  const dayOfDOB = dob.startOf('day').toDate();
  const dayAfterDOB = dob.endOf('day').toDate();
  return patients.filtered('dateOfBirth >= $0 AND dateOfBirth < $1', dayOfDOB, dayAfterDOB);
});

export const selectSortedPatients = createSelector(
  [selectSortKey, selectIsAscending, selectFilteredPatients],
  (sortKey, isAscending, patients) => patients.sorted(sortKey, !isAscending)
);

export const selectFullName = state => {
  const NameState = selectSpecificEntityState(state, 'name');
  const { editing } = NameState;
  const { firstName = '', lastName = '' } = editing ?? {};
  return `${firstName} ${lastName}`.trim();
};

export const selectCanEditPatient = state => {
  const nameState = selectSpecificEntityState(state, 'name');
  const { editing } = nameState;

  const { isEditable = false } = editing ?? {};

  return UIDatabase.getPreference(PREFERENCE_KEYS.CAN_EDIT_PATIENTS_FROM_ANY_STORE) || isEditable;
};
