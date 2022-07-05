/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../../../database/index';
import { ACTIONS } from './constants';
import { selectPageState } from '../../../selectors/pages';

/**
 * Uses the stores dataState map to set a row to
 * isSelected.
 *
 * @param {String} rowKey       Key of the row to focus.
 * @param {String} columnKey    Key of the column to focus.
 */
export const selectRow = (rowKey, route) => ({
  type: ACTIONS.SELECT_ROW,
  payload: { rowKey, route },
});

export const selectOneRow = (rowKey, route) => ({
  type: ACTIONS.SELECT_ONE_ROW,
  payload: { rowKey, route },
});

export const deselectOneRow = route => ({
  type: ACTIONS.DESELECT_ONE_ROW,
  payload: { route },
});

/**
 * Uses the stores dataState map to remove a rows
 * isSelected state.
 *
 * @param {String} rowKey       Key of the row to focus.
 * @param {String} columnKey    Key of the column to focus.
 */
export const deselectRow = (rowKey, route) => ({
  type: ACTIONS.DESELECT_ROW,
  payload: { rowKey, route },
});

/**
 * Removes isSelected field in all rows of the stores dataState map.
 */
export const deselectAll = route => ({
  type: ACTIONS.DESELECT_ALL,
  payload: { route },
});

/**
 * Adds isSelected field in all rows of the stores dataState map.
 */
export const selectAll = route => ({
  type: ACTIONS.SELECT_ALL,
  payload: { route },
});

/**
 * Wrapper around deselectAll and selectAll, determining which should
 * be dispatched.
 * @param {Bool} allSelected indicator whether all items are currently selected.
 */
export const toggleSelectAll = route => ({
  type: ACTIONS.TOGGLE_SELECT_ALL,
  payload: { route },
});

/**
 * Sets all rowState objects within the passed items array,
 * in the stores dataState map to isSelected
 *
 * @param {Array} items Row data objects to be set as selected.
 */
export const selectItems = (items, route) => ({
  type: ACTIONS.SELECT_ROWS,
  payload: { items, route },
});

/**
 * Removes all batches which are selected from the underlying pageObject.
 * use case: Removing a selection of items from a Transaction, Requisition
 * or Stocktake.
 *
 * @param {String} pageObjectType Type of the underlying pageObject, i.e. Transaction.
 */
export const deleteSelectedBatches = (pageObjectType, route) => (dispatch, getState) => {
  const { dataState, pageObject } = selectPageState(getState());

  const itemIds = Array.from(dataState.keys()).filter(rowKey => dataState.get(rowKey).isSelected);

  UIDatabase.write(() => {
    pageObject.removeTransactionBatchesById(UIDatabase, itemIds);
    UIDatabase.save(pageObjectType, pageObject);
  });

  dispatch({ type: ACTIONS.DELETE_RECORDS, payload: { route } });
};

/**
 * Removes all items which are selected from the underlying pageObject.
 * use case: Removing a selection of items from a Transaction, Requisition
 * or Stocktake.
 *
 * @param {String} pageObjectType Type of the underlying pageObject, i.e. Transaction.
 */
export const deleteSelectedItems = (pageObjectType, route) => (dispatch, getState) => {
  const { dataState, pageObject } = selectPageState(getState());

  const itemIds = Array.from(dataState.keys()).filter(rowKey => dataState.get(rowKey).isSelected);

  UIDatabase.write(() => {
    pageObject.removeItemsById(UIDatabase, itemIds);
    UIDatabase.save(pageObjectType, pageObject);
  });

  dispatch({ type: ACTIONS.DELETE_RECORDS, payload: { route } });
};

/**
 * Deletes all selected records. Should be used for non-item based records i.e.
 * Transactions, Stocktakes or Requisitions.
 *
 * @param {String} recordType
 */
export const deleteSelectedRecords = (recordType, route) => (dispatch, getState) => {
  const { dataState, backingData } = selectPageState(getState());

  const recordIds = Array.from(dataState.keys()).filter(rowKey => dataState.get(rowKey).isSelected);

  const transactionsToDelete = recordIds.reduce((acc, recordId) => {
    const record = backingData.filtered('id == $0', recordId)[0];
    const shouldDelete = record && record.isValid() && !record.isFinalised;
    if (shouldDelete && record.serialNumber > 0) return [...acc, record];
    return acc;
  }, []);

  UIDatabase.write(() => {
    UIDatabase.delete(recordType, transactionsToDelete);
  });

  dispatch({ type: ACTIONS.DELETE_RECORDS, payload: { route } });
};

export const RowActionsLookup = {
  selectRow,
  deselectRow,
  deselectOneRow,
  deselectAll,
  selectAll,
  toggleSelectAll,
  selectItems,
  deleteSelectedBatches,
  deleteSelectedItems,
  deleteSelectedRecords,
  selectOneRow,
};
