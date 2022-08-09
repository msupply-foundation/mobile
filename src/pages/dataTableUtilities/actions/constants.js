/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

export const ACTIONS = {
  // tableAction constants
  SORT_DATA: 'sortData',
  FILTER_DATA: 'filterData',
  REFRESH_DATA: 'refreshData',
  REFRESH_CASH_REGISTER: 'refreshCashRegister',
  ADD_ITEM: 'addItem',
  ADD_RECORD: 'addRecord',
  TOGGLE_INDICATORS: 'toggleIndicators',
  SELECT_INDICATOR: 'selectIndicator',
  HIDE_OVER_STOCKED: 'hideOverStocked',
  TOGGLE_STOCK_OUT: 'toggleStockOut',
  TOGGLE_SHOW_FINALISED: 'toggleShowFinalised',
  TOGGLE_TRANSACTION_TYPE: 'toggleTransactionType',
  REFRESH_DATA_WITH_FINALISED_TOGGLE: 'refreshDataWithFinalisedToggle',
  FILTER_DATA_WITH_FINALISED_TOGGLE: 'filterDataWithFinalisedToggle',
  FILTER_DATA_WITH_OVER_STOCK_TOGGLE: 'filterDataWithOverStockToggle',
  TOGGLE_COLUMN_SET: 'toggleColumnSet',
  FILTER_DATA_WITH_ZERO_STOCK_TOGGLE: 'filterDataWithZeroStockToggle',

  // pageAction constants
  OPEN_MODAL: 'openModal',
  CLOSE_MODAL: 'closeModal',
  EDIT_NAME: 'editName',
  OPEN_DATE_PICKER: 'openDatePicker',
  CLOSE_DATE_PICKER: 'closeDatePicker',

  // rowAction constants
  REFRESH_ROW: 'refreshRow',
  EDIT_TOTAL_QUANTITY: 'editTotalQuantity',
  EDIT_COUNTED_QUANTITY: 'editCountedQuantity',
  EDIT_REQUIRED_QUANTITY: 'editRequiredQuantity',
  EDIT_EXPIRY_DATE: 'editExpiryDate',

  // cellAction constants
  FOCUS_CELL: 'focusCell',
  FOCUS_NEXT: 'focusNext',
  SELECT_ROW: 'selectRow',
  TOGGLE_SELECT_ALL: 'toggleSelectAll',
  DESELECT_ALL: 'deselectAll',
  SELECT_ONE_ROW: 'selectOneRow',
  DESELECT_ONE_ROW: 'deselectOneRow',
  SELECT_ROWS: 'selectRows',
  DESELECT_ROW: 'deselectRow',
  DELETE_RECORDS: 'deleteRecords',
};

export const DATA_SET = {
  PATIENTS: 'patients',
  PRESCRIBERS: 'prescribers',
};
