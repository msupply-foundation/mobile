/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { ROUTES } from '../../../navigation/constants';
import { sortDataBy } from '../../../utilities';

/**
 * Sorts the current set of data by the provided
 * key and direction in action.
 *
 * sortKey: String key of the field of the objects to sort by, see sortDataBy.js
 */
export const sortData = (state, action) => {
  const { data, isAscending, sortKey } = state;
  const { payload } = action;
  const { sortKey: newSortKey } = payload;

  // If the new sortKey is the same as the sortKey in state, then invert isAscending
  // that was set by the last sortKey action. Otherwise, default to true.
  const newIsAscending = newSortKey === sortKey ? !isAscending : true;

  const newData = sortDataBy(data, newSortKey, newIsAscending);

  return { ...state, data: newData, sortKey: newSortKey, isAscending: newIsAscending };
};

/**
 * Filters the backingData WITH REALM, returning a JS array. Sorting
 * is held stable.
 */
export const filterData = (state, action) => {
  const {
    backingData,
    filterDataKeys,
    sortKey,
    isAscending,
    usingIndicators,
    showIndicators,
  } = state;
  const { payload } = action;
  const { route } = payload;

  const searchTerm = payload.searchTerm?.trim();

  // Data filtering may be deferred to state-to-prop selectors.
  switch (route) {
    case ROUTES.CASH_REGISTER: {
      return {
        ...state,
        searchTerm,
      };
    }
    case ROUTES.SUPPLIER_REQUISITION: {
      if (usingIndicators && showIndicators) {
        return {
          ...state,
          searchTerm,
        };
      }
      break;
    }
    case ROUTES.CUSTOMER_REQUISITION: {
      if (usingIndicators && showIndicators) {
        return {
          ...state,
          searchTerm,
        };
      }
      break;
    }
    default:
  }

  const queryString = filterDataKeys.map(filterTerm => `${filterTerm} CONTAINS[c] $0`).join(' OR ');
  const filteredData = backingData.filtered(queryString, searchTerm).slice();

  return {
    ...state,
    data: sortKey ? sortDataBy(filteredData, sortKey, isAscending) : filteredData,
    searchTerm,
  };
};

/**
 * Filters the backingData with REALM - first applying the finalised filtering
 * returning a JS array. Sorting is held stable.
 *
 */
export const filterDataWithFinalisedToggle = (state, action) => {
  const { backingData, filterDataKeys, sortKey, isAscending, showFinalised } = state;
  const { payload } = action;
  const { searchTerm } = payload;

  // Filter by toggle status - showing or not showing finalised records.
  const finalisedCondition = showFinalised ? '==' : '!=';
  const statusFilteredData = backingData.filtered(`status ${finalisedCondition} $0`, 'finalised');

  // Apply query filtering
  const queryString = filterDataKeys.map(filterTerm => `${filterTerm} CONTAINS[c] $0`).join(' OR ');
  const queryFilteredData = statusFilteredData.filtered(queryString, searchTerm.trim()).slice();

  // Sort the data by the current sorting parameters.
  const sortedData = sortKey
    ? sortDataBy(queryFilteredData, sortKey, isAscending)
    : statusFilteredData;

  return { ...state, data: sortedData, searchTerm };
};

/**
 * Filters the backingData with REALM - first applying show/hide over stock filtering
 * toggle. Sorting is held stable.
 *
 */
export const filterDataWithOverStockToggle = (state, action) => {
  const { backingData, filterDataKeys, sortKey, isAscending, showAll } = state;
  const { payload } = action;
  const { searchTerm } = payload;

  // Apply query filtering
  const queryString = filterDataKeys.map(filterTerm => `${filterTerm} CONTAINS[c] $0`).join(' OR ');
  const queryFilteredData = backingData.filtered(queryString, searchTerm.trim()).slice();

  // Filter by toggle status - showing or not showing over stocked records.
  const stockFilteredData = !showAll
    ? queryFilteredData.slice().filter(item => item.isLessThanThresholdMOS)
    : queryFilteredData.slice();

  // Sort the data by the current sorting parameters.
  const sortedData = sortKey
    ? sortDataBy(stockFilteredData, sortKey, isAscending)
    : stockFilteredData;

  return { ...state, data: sortedData, searchTerm };
};

/**
 * Filters the backingData with REALM - first applying show/hide zero stock filtering
 * toggle. Sorting is held stable.
 *
 */
export const filterDataWithZeroStockToggle = (state, action) => {
  const { backingData, filterDataKeys, sortKey, isAscending, showAll } = state;
  const { payload } = action;
  const { searchTerm } = payload;

  // Apply query filtering
  const queryString = filterDataKeys.map(filterTerm => `${filterTerm} CONTAINS[c] $0`).join(' OR ');
  const queryFilteredData = backingData.filtered(queryString, searchTerm.trim()).slice();

  // Filter by toggle status - showing or not showing zero stocked records.
  const stockFilteredData = !showAll
    ? queryFilteredData.slice().filter(item => item.hasStock)
    : queryFilteredData.slice();

  // Sort the data by the current sorting parameters.
  const sortedData = sortKey
    ? sortDataBy(stockFilteredData, sortKey, isAscending)
    : stockFilteredData;

  return { ...state, data: sortedData, searchTerm };
};

/**
 * Simply refresh's the data object in state to correctly match the
 * backingData. Used for when side effects such as finalizing manipulate
 * the state of a page from outside the reducer.
 */
export const refreshData = state => {
  const { backingData, sortKey, isAscending } = state;

  const backingDataArray = backingData.slice();
  const newData = sortKey ? sortDataBy(backingDataArray, sortKey, isAscending) : backingDataArray;

  return { ...state, data: newData, searchTerm: '', showAll: true };
};

/**
 * Override for refreshData for cash register. Filtering is deferred to state-to-prop
 * selectors.
 */
export const refreshCashRegister = state => {
  const { backingData, sortKey, isAscending } = state;

  const backingDataArray = backingData.slice();
  const data = sortKey ? sortDataBy(backingDataArray, sortKey, isAscending) : backingDataArray;

  return { ...state, data };
};

/**
 * Override for refreshData for pages which use a finalised toggle,
 * which will display either finalised records, or unfinalised.
 */
export const refreshDataWithFinalisedToggle = state => {
  const { backingData, sortKey, isAscending, showFinalised } = state;

  const finalisedCondition = showFinalised ? '==' : '!=';
  const filteredData = backingData.filtered(`status ${finalisedCondition} $0`, 'finalised');

  const newData = sortKey ? sortDataBy(filteredData.slice(), sortKey, isAscending) : filteredData;

  return { ...state, data: newData, searchTerm: '', showAll: true };
};

/**
 * Filters `backingData` by status, setting `data` as all elements whose
 * status is finalised.
 */
export const toggleShowFinalised = state => {
  const { backingData, sortKey, isAscending, showFinalised } = state;

  const newShowFinalisedState = !showFinalised;
  const finalisedCondition = newShowFinalisedState ? '==' : '!=';

  const filteredData = backingData.filtered(`status ${finalisedCondition} $0`, 'finalised').slice();

  const sortedData = sortKey ? sortDataBy(filteredData, sortKey, isAscending) : filteredData;

  return { ...state, data: sortedData, showFinalised: newShowFinalisedState, searchTerm: '' };
};

export const toggleTransactionType = state => {
  const { transactionType } = state;
  const newTransactionType = transactionType === 'payment' ? 'receipt' : 'payment';
  return { ...state, transactionType: newTransactionType };
};

export const toggleIndicators = state => {
  const { showIndicators } = state;
  return {
    ...state,
    showIndicators: !showIndicators,
    searchTerm: '',
  };
};

export const selectIndicator = (state, action) => {
  const { payload } = action;
  const { indicatorCode } = payload;
  const { indicators } = state;

  const currentIndicator = indicators.find(indicator => indicator.code === indicatorCode);
  const indicatorColumns = currentIndicator?.columns;
  const indicatorRows = currentIndicator?.rows;

  return { ...state, currentIndicator, indicatorColumns, indicatorRows };
};

/**
 * Filters backingData by the elements isLessThanThresholdMOS field.
 */
export const hideOverStocked = state => {
  const { backingData } = state;

  const newData = backingData.filter(item => item.isLessThanThresholdMOS);

  return { ...state, data: newData, showAll: false };
};
/**
 * Filters by backingData elements `hasStock` field.
 */
export const toggleStockOut = state => {
  const { backingData } = state;

  const newData = backingData.filter(item => item.hasStock);

  return { ...state, data: newData, showAll: false, searchTerm: '' };
};

/**
 * Creates adds the passed record to the HEAD of the current
 * data array.
 *
 * Also removes the current sorting and filter.
 */
export const addRecord = state => {
  const { backingData } = state;

  return {
    ...state,
    data: backingData.sorted('id', true).slice(),
    modalKey: '',
    sortKey: '',
    searchTerm: '',
  };
};

export const toggleColumnSet = state => ({
  ...state,
  columnSet: state.columnSet === 'a' ? 'b' : 'a',
});

export const TableReducerLookup = {
  toggleStockOut,
  toggleShowFinalised,
  toggleTransactionType,
  addRecord,
  toggleIndicators,
  selectIndicator,
  hideOverStocked,
  refreshData,
  refreshCashRegister,
  filterData,
  sortData,
  refreshDataWithFinalisedToggle,
  filterDataWithFinalisedToggle,
  filterDataWithOverStockToggle,
  toggleColumnSet,
  filterDataWithZeroStockToggle,
};
