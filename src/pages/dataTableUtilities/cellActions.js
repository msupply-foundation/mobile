/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../../database';
import { parsePositiveInteger } from '../../utilities';

const ACTIONS = {
  REFRESH_ROW: 'refreshRow',
  EDIT_TOTAL_QUANTITY: 'editTotalQuantity',
  EDIT_COUNTED_QUANTITY: 'editCountedTotalQuantity',
  EDIT_REQUIRED_QUANTITY: 'editRequiredQuantity',
  EDIT_EXPIRY_DATE: 'editExpiryDate',
  ENFORCE_REASON: 'enforceReasonChoice',
};

/**
 * Refreshes a row in the DataTable component.
 * Use case: editing a field of a realm object and ensuring the
 * UI is updated.
 *
 * @param {String} rowKey Key of the row to edit.
 */
export const refreshRow = rowKey => ({ type: ACTIONS.REFRESH_ROW, payload: { rowKey } });

/**
 * Edits the field `totalQuantity` of a rows underlying data object.
 *
 * @param {String|Number} value      The new value to set (parsed as a positive integer)
 * @param {String}        rowKey     The key of the row to edit.
 * @param {String}        objectType The Type of the underlying data i.e. StocktakeBatch.
 */
export const editTotalQuantity = (value, rowKey, objectType) => (dispatch, getState) => {
  const { data, keyExtractor } = getState();

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  UIDatabase.write(() => {
    objectToEdit.setTotalQuantity(UIDatabase, parsePositiveInteger(value));
    UIDatabase.save(objectType, objectToEdit);
  });

  dispatch(refreshRow(rowKey));
};

/**
 * Edits a TransactionBatch's totalQuantity field.
 *
 * @param {String|Number} value      The new value to set (parsed as a positive integer)
 * @param {String}        rowKey     The key of the row to edit.
 */
export const editTransactionBatchTotalQuantity = (value, rowKey) =>
  editTotalQuantity(value, rowKey, 'TransactionBatch');

/**
 * Edits a rows underlying `expiryDate` field.
 *
 * @param {Date}    newDate     The new date to set as the expiry.
 * @param {String}  rowKey      Key of the row to edit.
 * @param {String}  objectType  Type of object to edit i.e. 'TransactionBatch'
 */
export const editExpiryDate = (newDate, rowKey, objectType) => (dispatch, getState) => {
  const { data, keyExtractor } = getState();

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  UIDatabase.write(() => {
    objectToEdit.expiryDate = newDate;
    UIDatabase.save(objectType, objectToEdit);
  });

  dispatch(refreshRow(rowKey));
};

/**
 * Edits a TransactionBatch Expiry Date field.
 * @param {Date}    newDate     The new date to set as the expiry.
 * @param {String}  rowKey      Key of the row to edit.
 */
export const editTransactionBatchExpiryDate = (newDate, rowKey) =>
  editExpiryDate(newDate, rowKey, 'TransactionBatch');

/**
 * Edits a rows underlying `requiredQuantity` field.
 *
 * @param {String|Number}   value       The new value to set as the required quantity.
 * @param {String}          rowKey      Key of the row to edit.
 * @param {String}          objectType  Type of object to edit i.e. 'RequisitionItem'
 */
export const editRequiredQuantity = (value, rowKey, objectType) => (dispatch, getState) => {
  const { data, keyExtractor } = getState();

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  UIDatabase.write(() => {
    objectToEdit.requiredQuantity = parsePositiveInteger(value);
    UIDatabase.save(objectType, objectToEdit);
  });

  dispatch(refreshRow(rowKey));
};

/**
 * Edits a RequisitionItem Required quantity field.
 *
 * @param {Date}    value       The new value to set as the required quantity.
 * @param {String}  rowKey      Key of the row to edit.
 */
export const editRequisitionItemRequiredQuantity = (value, rowKey) =>
  editRequiredQuantity(value, rowKey, 'RequisitionItem');

/**
 * Edits a rows underlying countedTotalQuantity field.
 *
 * @param {String|Number}   value   The new value to set as the ccounted total quantity.
 * @param {String}          rowKey  Key of the row to edit.
 */
export const editCountedQuantity = (value, rowKey) => (dispatch, getState) => {
  const { data, keyExtractor } = getState();

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  objectToEdit.setCountedTotalQuantity(UIDatabase, parsePositiveInteger(Number(value)));

  dispatch(refreshRow());
};

/**
 * Checks if a rows enforceReason field is true, if so, transforms
 * the action to open a fullScreen reasons modal, otherwise, remove
 * any reasons applied.
 *
 * @param {String} rowKey Key of the row to enforce a reason on
 */
export const enforceReasonChoice = rowKey => (getState, dispatch) => {
  const { data, keyExtractor } = getState();

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  const { enforceReason } = objectToEdit;

  if (enforceReason) {
    // Open modal
  }

  dispatch(removeReason(rowKey));
};

/**
 * Wrapper around `editCountedTotalQuantity`, splitting the action to enforce a
 * reason also.
 *
 * @param {String|Number}   value  New value for the underlying `countedTotalQuantity` field
 * @param {String}          rowKey Key of the row to edit.
 */
export const editStocktakeBatchCountedQuantity = (value, rowKey) => dispatch => {
  dispatch({ type: ACTIONS.EDIT_COUNTED_QUANTITY, payload: { value, rowKey } });
  dispatch({ type: ACTIONS.ENFORCE_REASON, payload: { rowKey } });
};

/**
 * Removes a reason from a rows underlying data.
 *
 * @param {String} rowKey   Key for the row to edit.
 */
export const removeReason = rowKey => (getState, dispatch) => {
  const { data, keyExtractor } = getState();

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  objectToEdit.applyReason(UIDatabase);

  dispatch(refreshRow());
};

/**
 * Applys a passed reason to the underlying row data. Can be a StocktakeItem
 * or StocktakeBatch.
 *
 * @param {Realm.Option} value Reason to apply to the underlying rorw.
 */
export const applyReason = value => (dispatch, getState) => {
  const { modalValue } = getState();

  modalValue.applyReasonToBatches(UIDatabase, value);

  dispatch(refreshRow());
};
