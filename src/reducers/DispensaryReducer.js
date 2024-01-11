/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { DISPENSARY_ACTIONS } from '../actions/DispensaryActions';
import { getColumns } from '../pages/dataTableUtilities';
import { UIDatabase } from '../database';
import { ROUTES } from '../navigation';

const initialState = () => {
  const usingAdverseDrugReactions = UIDatabase.objects('ADRForm').length > 0;
  const defaultDataSet = usingAdverseDrugReactions ? 'patientWithAdverseDrugReactions' : 'patient';

  return {
    searchTerm: '',
    sortKey: 'createdDate',
    isAscending: false,
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

      const patientDataSet = usingAdverseDrugReactions
        ? 'patientWithAdverseDrugReactions'
        : 'patient';

      const prescriberDataSet = 'prescriber';
      const newDataSet = dataSet === patientDataSet ? prescriberDataSet : patientDataSet;

      const newColumns = getColumns(newDataSet);

      const newData = UIDatabase.objects(newDataSet === patientDataSet ? 'Patient' : 'Prescriber');

      return {
        ...state,
        dataSet: newDataSet,
        columns: newColumns,
        sortKey: 'createdDate',
        isAscending: false,
        searchTerm: '',
        data: newData,
      };
    }
    case DISPENSARY_ACTIONS.REFRESH: {
      const { dataSet } = state;

      const usingPatientDataSet =
        dataSet === 'patientWithAdverseDrugReactions' || dataSet === 'patient';
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
