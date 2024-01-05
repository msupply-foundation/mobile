/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { DISPENSARY_ACTIONS } from '../actions/DispensaryActions';
import { getColumns } from '../pages/dataTableUtilities';
import { UIDatabase } from '../database';
import { ROUTES } from '../navigation';
import { PREFERENCE_KEYS } from '../database/utilities/preferenceConstants';

const initialState = () => {
  let defaultDataSet = 'patient';

  const usingAdverseDrugReactions = UIDatabase.objects('ADRForm').length > 0;
  defaultDataSet = usingAdverseDrugReactions ? 'patientWithAdverseDrugReactions' : 'patient';

  const patientWithCreatedDate = UIDatabase.getPreference(PREFERENCE_KEYS.SORTED_BY_CREATED_DATE);
  defaultDataSet = patientWithCreatedDate ? 'patientWithCreatedDate' : defaultDataSet;
  return {
    searchTerm: '',
    sortKey: 'firstName',
    isAscending: true,
    dataSet: defaultDataSet,
    columns: getColumns(defaultDataSet),
    data: UIDatabase.objects('Patient'),
    isLookupModalOpen: false,
    isADRModalOpen: false,
  };
};

export const DispensaryReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case 'NAVIGATE': {
      const { payload } = action;
      const { name } = payload;

      if (name === ROUTES.DISPENSARY) return initialState();
      return state;
    }

    case DISPENSARY_ACTIONS.FILTER: {
      const { payload } = action;
      const { searchTerm } = payload;

      return { ...state, searchTerm };
    }

    case DISPENSARY_ACTIONS.SORT: {
      const { isAscending, sortKey } = state;
      const { payload } = action;
      const { sortKey: newSortKey } = payload;

      const newIsAscending = sortKey === newSortKey ? !isAscending : true;

      return { ...state, sortKey: newSortKey, isAscending: newIsAscending };
    }

    case DISPENSARY_ACTIONS.SWITCH: {
      const { payload } = action;
      const { usingAdverseDrugReactions } = payload;
      const { dataSet } = state;

      let patientDataSet = usingAdverseDrugReactions
        ? 'patientWithAdverseDrugReactions'
        : 'patient';

      const patientWithCreatedDate = UIDatabase.getPreference(
        PREFERENCE_KEYS.SORTED_BY_CREATED_DATE
      );
      patientDataSet = patientWithCreatedDate ? 'patientWithCreatedDate' : patientDataSet;

      const prescriberDataSet = 'prescriber';
      const newDataSet = dataSet === patientDataSet ? prescriberDataSet : patientDataSet;

      const newColumns = getColumns(newDataSet);

      const newData = UIDatabase.objects(newDataSet === patientDataSet ? 'Patient' : 'Prescriber');

      return {
        ...state,
        dataSet: newDataSet,
        columns: newColumns,
        sortKey: 'firstName',
        isAscending: true,
        searchTerm: '',
        data: newData,
      };
    }
    case DISPENSARY_ACTIONS.REFRESH: {
      const { dataSet } = state;

      const usingPatientDataSet =
        dataSet === 'patientWithAdverseDrugReactions' ||
        dataSet === 'patientWithCreatedDate' ||
        dataSet === 'patient';
      const objectType = usingPatientDataSet ? 'Patient' : 'Prescriber';
      const newData = UIDatabase.objects(objectType);

      return { ...state, data: newData };
    }

    case DISPENSARY_ACTIONS.OPEN_LOOKUP_MODAL: {
      return { ...state, isLookupModalOpen: true };
    }

    case DISPENSARY_ACTIONS.CLOSE_LOOKUP_MODAL: {
      return { ...state, isLookupModalOpen: false };
    }

    default:
      return state;
  }
};
