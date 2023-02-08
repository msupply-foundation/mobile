/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import { ToastAndroid } from 'react-native';
import { batch as reduxBatch } from 'react-redux';
import currency from '../../../localization/currency';
import { UIDatabase } from '../../../database';
import { parsePositiveIntegerInterfaceInput as parsePositiveInteger } from '../../../utilities';
import {
  getIndicatorRow,
  getIndicatorColumn,
  updateIndicatorValue,
  getIndicatorRowColumnValue,
} from '../../../database/utilities/getIndicatorData';
import { ACTIONS } from './constants';
import { closeModal } from './pageActions';
import { selectPageState } from '../../../selectors/pages';
import { tableStrings } from '../../../localization';

/**
 * Refreshes a row in the DataTable component.
 * Use case: editing a field of a realm object and ensuring the
 * UI is updated.
 *
 * @param {String} rowKey Key of the row to edit.
 */
export const refreshRow = (rowKey, route) => ({
  type: ACTIONS.REFRESH_ROW,
  payload: { rowKey, route },
});

export const refreshIndicatorRow = route => ({
  type: 'refreshIndicatorRow',
  payload: { route },
});

export const editSensorLocation = (location, route) => (dispatch, getState) => {
  const { modalValue, keyExtractor } = selectPageState(getState());

  UIDatabase.write(() => UIDatabase.update('Sensor', { id: modalValue.id, location }));

  reduxBatch(() => {
    dispatch(refreshRow(keyExtractor(modalValue), route));
    dispatch(closeModal(route));
  });
};

export const editSensorName = (newValue, rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = selectPageState(getState());

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);
  const { id } = objectToEdit;

  if (objectToEdit) {
    UIDatabase.write(() => UIDatabase.update('Sensor', { id, name: newValue }));
    dispatch(refreshRow(rowKey, route));
  }
};

export const editLocationDescription = (newValue, rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = selectPageState(getState());

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);
  const { id } = objectToEdit;

  if (objectToEdit) {
    UIDatabase.write(() => UIDatabase.update('Location', { id, description: newValue }));
    dispatch(refreshRow(rowKey, route));
  }
};

export const editLocationCode = (newValue, rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = selectPageState(getState());

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);
  const { id } = objectToEdit;

  if (objectToEdit) {
    UIDatabase.write(() => UIDatabase.update('Location', { id, code: newValue }));
    dispatch(refreshRow(rowKey, route));
  }
};

export const editBatchDoses = (newValue, rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = selectPageState(getState());

  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  if (objectToEdit) {
    UIDatabase.write(() => objectToEdit.setDoses(UIDatabase, parsePositiveInteger(newValue)));
    dispatch(refreshRow(rowKey, route));
  }
};

export const editBatchVvmStatus = (vvmStatus, objectType, route) => (dispatch, getState) => {
  const { modalValue, keyExtractor } = selectPageState(getState());
  const { id = '' } = modalValue ?? {};

  UIDatabase.write(() =>
    UIDatabase.update(objectType, { id, vaccineVialMonitorStatus: vvmStatus })
  );

  reduxBatch(() => {
    dispatch(refreshRow(keyExtractor(modalValue), route));
    dispatch(closeModal(route));
  });
};

export const editTransactionBatchVvmStatus = (vvmStatus, route) =>
  editBatchVvmStatus(vvmStatus, 'TransactionBatch', route);

export const editStocktakeBatchVvmStatus = (vvmStatus, route) =>
  editBatchVvmStatus(vvmStatus, 'StocktakeBatch', route);

export const editBatchLocation = (location, objectType, route) => (dispatch, getState) => {
  const { modalValue, keyExtractor } = selectPageState(getState());

  UIDatabase.write(() => UIDatabase.update(objectType, { id: modalValue.id, location }));

  reduxBatch(() => {
    dispatch(refreshRow(keyExtractor(modalValue), route));
    dispatch(closeModal(route));
  });
};

export const editTransactionBatchLocation = (location, route) =>
  editBatchLocation(location, 'TransactionBatch', route);

export const editStocktakeBatchLocation = (location, route) =>
  editBatchLocation(location, 'StocktakeBatch', route);

export const editOpeningStock = (value, rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = selectPageState(getState());

  const requisitionItem = data.find(row => keyExtractor(row) === rowKey);
  if (requisitionItem) {
    UIDatabase.write(() => {
      requisitionItem.setOpeningStock(parsePositiveInteger(value));
      UIDatabase.save('RequisitionItem', requisitionItem);
    });

    if (!requisitionItem.closingStockIsValid) {
      ToastAndroid.show(tableStrings.opening_stock_validation, ToastAndroid.LONG);
    }

    dispatch(refreshRow(rowKey, route));
  }
};

export const editDaysOutOfStock = (value, rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = selectPageState(getState());

  const requisitionItem = data.find(row => keyExtractor(row) === rowKey);
  if (requisitionItem) {
    UIDatabase.write(() => {
      requisitionItem.setDaysOutOfStock(parsePositiveInteger(value));
      UIDatabase.save('RequisitionItem', requisitionItem);
    });
    dispatch(refreshRow(rowKey, route));
  }
};

export const editIncomingStock = (value, rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = selectPageState(getState());

  const requisitionItem = data.find(row => keyExtractor(row) === rowKey);
  if (requisitionItem) {
    UIDatabase.write(() => {
      requisitionItem.setIncomingStock(parsePositiveInteger(value));
      UIDatabase.save('RequisitionItem', requisitionItem);
    });

    if (!requisitionItem.closingStockIsValid) {
      ToastAndroid.show(tableStrings.incoming_stock_validation, ToastAndroid.LONG);
    }

    dispatch(refreshRow(rowKey, route));
  }
};

export const editOutgoingStock = (value, rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = selectPageState(getState());

  const requisitionItem = data.find(row => keyExtractor(row) === rowKey);
  if (requisitionItem) {
    UIDatabase.write(() => {
      requisitionItem.setOutgoingStock(parsePositiveInteger(value));
      UIDatabase.save('RequisitionItem', requisitionItem);
    });

    if (!requisitionItem.closingStockIsValid) {
      ToastAndroid.show(tableStrings.outgoing_stock_validation, ToastAndroid.LONG);
    }

    dispatch(refreshRow(rowKey, route));
  }
};

export const editPositiveAdjustments = (value, rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = selectPageState(getState());

  const requisitionItem = data.find(row => keyExtractor(row) === rowKey);
  if (requisitionItem) {
    UIDatabase.write(() => {
      requisitionItem.setPositiveAdjustments(parsePositiveInteger(value));
      UIDatabase.save('RequisitionItem', requisitionItem);
    });

    if (!requisitionItem.closingStockIsValid) {
      ToastAndroid.show(tableStrings.positive_adjustments_validation, ToastAndroid.LONG);
    }

    dispatch(refreshRow(rowKey, route));
  }
};

export const editNegativeAdjustments = (value, rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = selectPageState(getState());

  const requisitionItem = data.find(row => keyExtractor(row) === rowKey);
  if (requisitionItem) {
    UIDatabase.write(() => {
      requisitionItem.setNegativeAdjustments(parsePositiveInteger(value));
      UIDatabase.save('RequisitionItem', requisitionItem);
    });

    if (!requisitionItem.closingStockIsValid) {
      ToastAndroid.show(tableStrings.negative_adjustments_validation, ToastAndroid.LONG);
    }

    dispatch(refreshRow(rowKey, route));
  }
};

/**
 * Edits a rows underlying `batch` field.
 *
 * @param {Date}    value       The new batch name value.
 * @param {String}  rowKey      Key of the row to edit.
 * @param {String}  objectType  Type of object to edit i.e. 'TransactionBatch'
 */
export const editBatchName = (value, rowKey, objectType, route) => (dispatch, getState) => {
  const { data, keyExtractor } = selectPageState(getState());
  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);
  const { id = '' } = objectToEdit ?? {};

  if (objectToEdit) {
    const { batch } = objectToEdit;
    if (value !== batch) {
      UIDatabase.write(() => UIDatabase.update(objectType, { id, batch: value }));
      dispatch(refreshRow(rowKey, route));
    }
  }
};

export const editSellPrice = (value, rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = selectPageState(getState());
  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);
  const objectDataType = objectToEdit.stocktake ? 'StocktakeBatch' : 'TransactionBatch';
  const { sellPrice, id } = objectToEdit;
  const valueAsCurrency = currency(value);
  const { value: currencyValue } = valueAsCurrency;
  if (currencyValue !== sellPrice) {
    UIDatabase.write(() => {
      if (!Number.isNaN(currencyValue)) {
        UIDatabase.update(objectDataType, { id, sellPrice: currencyValue });
      }
      dispatch(refreshRow(rowKey, route));
    });
  }
};

export const editBatchSupplier = (supplier, batch, route) => dispatch => {
  const { id } = batch;
  UIDatabase.write(() => {
    UIDatabase.update('StocktakeBatch', { id, supplier });
  });

  reduxBatch(() => {
    dispatch(refreshRow(batch.id, route));
    dispatch(closeModal(route));
  });
};

export const editIndicatorValue = (value, rowKey, columnKey, route) => (dispatch, getState) => {
  const { indicatorRows, indicatorColumns, pageObject } = selectPageState(getState());
  const { period } = pageObject;
  const row = getIndicatorRow(indicatorRows, rowKey);
  const column = getIndicatorColumn(indicatorColumns, columnKey);
  const indicatorValue = getIndicatorRowColumnValue(row, column, period);
  updateIndicatorValue(indicatorValue, value);
  dispatch(refreshIndicatorRow(route));
};

/**
 * Wrapper around editBatchName for StocktakeBatches
 */
export const editStocktakeBatchName = (value, rowKey, route) =>
  editBatchName(value, rowKey, 'StocktakeBatch', route);

export const editTransactionBatchName = (value, rowKey, route) =>
  editBatchName(value, rowKey, 'TransactionBatch', route);

/**
 * Edits a rows underlying `expiryDate` field.
 *
 * @param {Date}    newDate     The new date to set as the expiry.
 * @param {String}  rowKey      Key of the row to edit.
 * @param {String}  objectType  Type of object to edit i.e. 'TransactionBatch'
 */
export const editExpiryDate = (newDate, rowKey, objectType, route) => (dispatch, getState) => {
  const { data, keyExtractor } = selectPageState(getState());
  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);
  if (objectToEdit) {
    UIDatabase.write(() => {
      objectToEdit.expiryDate = newDate;
      UIDatabase.save(objectType, objectToEdit);
    });

    dispatch(refreshRow(rowKey, route));
  }
};

/**
 * Wrapper around editExpiryDate.
 */
export const editTransactionBatchExpiryDate = (newDate, rowKey, route) =>
  editExpiryDate(newDate, rowKey, 'TransactionBatch', route);

export const editStocktakeBatchExpiryDate = (newDate, rowKey, route) =>
  editExpiryDate(newDate, rowKey, 'StocktakeBatch', route);

/**
 * Edits the field `totalQuantity` of a rows underlying data object.
 *
 * @param {String|Number} value      The new value to set (parsed as a positive integer)
 * @param {String}        rowKey     The key of the row to edit.
 */
export const editTotalQuantity = (value, rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = selectPageState(getState());
  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);
  if (objectToEdit) {
    UIDatabase.write(() => {
      objectToEdit.setTotalQuantity(UIDatabase, parsePositiveInteger(value));
    });
    dispatch(refreshRow(rowKey, route));
  }
};

/**
 * Edits a rows underlying `suggestedQuantity` field.
 *
 * @param {String|Number}   value       The new value to set as the required quantity.
 * @param {String}          rowKey      Key of the row to edit.
 * @param {String}          objectType  Type of object to edit i.e. 'RequisitionItem'
 */
export const editSuppliedQuantity = (value, rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = selectPageState(getState());
  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);
  if (objectToEdit) {
    UIDatabase.write(() =>
      objectToEdit.setSuppliedQuantity(UIDatabase, parsePositiveInteger(value))
    );
  }
  dispatch(refreshRow(rowKey, route));
};

/**
 * Edits a rows underlying `requiredQuantity` field.
 *
 * @param {String|Number}   value       The new value to set as the required quantity.
 * @param {String}          rowKey      Key of the row to edit.
 * @param {String}          objectType  Type of object to edit i.e. 'RequisitionItem'
 */
export const editRequiredQuantity = (value, rowKey, objectType, route) => (dispatch, getState) => {
  const { data, keyExtractor } = selectPageState(getState());
  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);
  if (objectToEdit) {
    UIDatabase.write(() => {
      objectToEdit.requiredQuantity = parsePositiveInteger(value);
      UIDatabase.save(objectType, objectToEdit);
    });

    if (!objectToEdit?.hasVariance && !!objectToEdit.option) dispatch(removeReason(rowKey, route));

    dispatch(refreshRow(rowKey, route));
  }
};

/**
 * Wrapper around editRequiredQuantity.
 */
export const editRequisitionItemRequiredQuantity = (value, rowKey, route) =>
  editRequiredQuantity(value, rowKey, 'RequisitionItem', route);

/**
 * Edits a rows underlying countedTotalQuantity field.
 *
 * @param {String|Number}   value   The new value to set as the ccounted total quantity.
 * @param {String}          rowKey  Key of the row to edit.
 */
export const editCountedQuantity = (value, rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = selectPageState(getState());
  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);
  if (objectToEdit) objectToEdit.setCountedTotalQuantity(UIDatabase, parsePositiveInteger(value));

  if (!objectToEdit?.hasValidReason) dispatch(removeReason(rowKey, route));

  dispatch(refreshRow(rowKey, route));
};

/**
 * Edits a StocktakeBatches underlying `countedTotalQuantity`
 *
 * @param {String|Number}   value  New value for the underlying `countedTotalQuantity` field
 * @param {String}          rowKey Key of the row to edit.
 */
export const editStocktakeBatchCountedQuantity = (value, rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = selectPageState(getState());
  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);
  if (objectToEdit) {
    UIDatabase.write(() => {
      objectToEdit.countedTotalQuantity = parsePositiveInteger(value);
      UIDatabase.save('StocktakeBatch', objectToEdit);
    });
  }

  if (!objectToEdit?.hasValidReason) dispatch(removeReason(rowKey, route));

  dispatch(refreshRow(rowKey, route));
};

/**
 * Removes a reason from a rows underlying data.
 *
 * @param {String} rowKey   Key for the row to edit.
 */
export const removeReason = (rowKey, route) => (dispatch, getState) => {
  const { data, keyExtractor } = selectPageState(getState());
  const objectToEdit = data.find(row => keyExtractor(row) === rowKey);

  objectToEdit.removeReason(UIDatabase);
  dispatch(refreshRow(rowKey, route));
};

/**
 * Applys a passed reason to the underlying row data. Can be a StocktakeItem
 * or StocktakeBatch.
 *
 * @param {Realm.Option} value Reason to apply to the underlying rorw.
 */
export const applyReason = (value, route) => (dispatch, getState) => {
  const { modalValue, keyExtractor } = selectPageState(getState());
  modalValue.applyReason(UIDatabase, value);
  const rowKey = keyExtractor(modalValue);
  dispatch(closeModal(route));
  dispatch(refreshRow(rowKey, route));
};

export const CellActionsLookup = {
  refreshRow,
  refreshIndicatorRow,
  editExpiryDate,
  editTransactionBatchExpiryDate,
  editStocktakeBatchExpiryDate,
  editTotalQuantity,
  editSuppliedQuantity,
  editRequiredQuantity,
  editRequisitionItemRequiredQuantity,
  editCountedQuantity,
  editStocktakeBatchCountedQuantity,
  removeReason,
  applyReason,
  editBatchName,
  editIndicatorValue,
  editStocktakeBatchName,
  editSellPrice,
  editBatchSupplier,
  editTransactionBatchName,
  editTransactionBatchLocation,
  editStocktakeBatchLocation,
  editTransactionBatchVvmStatus,
  editStocktakeBatchVvmStatus,
  editBatchDoses,
  editLocationCode,
  editLocationDescription,
  editSensorLocation,
  editSensorName,
  editOpeningStock,
  editNegativeAdjustments,
  editPositiveAdjustments,
  editOutgoingStock,
  editIncomingStock,
  editDaysOutOfStock,
};
