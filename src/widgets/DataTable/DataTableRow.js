/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { dataTableStyles } from '../../globalStyles';

import Row from './Row';
import Cell from './Cell';

import CheckableCell from './CheckableCell';
import TouchableCell from './TouchableCell';
import DropDownCell from '../DropDownCell';

import { ExpiryDateInput } from '../ExpiryDateInput';

import {
  CheckedComponent,
  UncheckedComponent,
  DisabledCheckedComponent,
  DisabledUncheckedComponent,
  OpenModal,
} from '../icons';
import TextInputCell from './TextInputCell';

import { formatStatus } from '../../utilities';

import { COLUMN_TYPES, COLUMN_NAMES } from '../../pages/dataTableUtilities';
import { tableStrings } from '../../localization/index';

/**
 * Wrapper component for a mSupply DataTable page row.
 * Wraps Row component with a contained RenderCells, which
 * will generate the appropriate cell for a given columnKey.
 * Doesn't need to be used, but is a convenience component.
 *
 * @param {Object} rowData     Data object for a row i.e. ItemBatch object
 * @param {Object} rowState    State object for a row, see: Row.js
 * @param {Object} style       Style object the be passed to inner Row
 * @param {String} rowKey      Unique key for a row
 * @param {Array}  columns     Array of column objects, see: columns.js
 * @param {Bool}   isFinalised Boolean indicating if the DataTable page is finalised.
 * @param {Func}   dispatch    Dispatch function for containing reducer.
 * @param {Func}   rowIndex    index of this row.
 * @param {Func}   onPress     On press callback for the row itself.
 * @param {Func}   getAction   Function to return an action for a cell
 *                             (colKey, propName) => actionObject
 */
const DataTableRow = React.memo(
  ({ rowData, rowState, rowKey, columns, isFinalised, dispatch, getAction, onPress, rowIndex }) => {
    const {
      cellText,
      cellContainer,
      touchableCellContainer,
      editableCellText,
      editableCellTextView,
      editableCellUnfocused,
      selectedRow: selectedRowStyle,
      alternateRow: alternateRowStyle,
      row: basicRowStyle,
      iconCell,
    } = dataTableStyles;

    const { isSelected = false } = rowState || {};
    // If the row is selected, use selectedRow style, otherwise alternate row style on index.
    const rowStyle = isSelected
      ? selectedRowStyle
      : (rowIndex % 2 === 0 && alternateRowStyle) || basicRowStyle;

    // Callback for rendering a row of cells.
    const renderCells = useCallback(
      () =>
        // Map each column to an appropriate cell for a given row.
        columns.map(({ key: columnKey, type, width, alignText }, index) => {
          // Indicator if the right hand border should be removed from styles for this cell.
          const isLastCell = index === columns.length - 1;

          // This cell is disabled if the pageObject is finalised, the row has been explicitly set
          // as disabled, or the rowData is disabled (i.e. data is an invoice),
          const isDisabled =
            isFinalised || (rowState && rowState.isDisabled) || rowData.isFinalised;

          // Alignment of this particular column. Default to left hand ide.
          const cellAlignment = alignText || 'left';

          switch (type) {
            case COLUMN_TYPES.EDITABLE_STRING:
            case COLUMN_TYPES.EDITABLE_NUMERIC: {
              // Special condition for stocktake counted total quantity cells.
              // Use the placeholder 'Not counted' when a stocktake item or batch
              // has not been counted yet.
              let placeholder = '';
              if (columnKey === COLUMN_NAMES.COUNTED_TOTAL_QUANTITY) {
                placeholder = rowData.hasBeenCounted ? '' : tableStrings.not_counted;
              }

              return (
                <TextInputCell
                  key={columnKey}
                  value={rowData[columnKey]}
                  rowKey={rowKey}
                  columnKey={columnKey}
                  editAction={getAction(columnKey)}
                  isDisabled={isDisabled}
                  dispatch={dispatch}
                  width={width}
                  viewStyle={cellContainer[cellAlignment]}
                  textViewStyle={editableCellTextView}
                  isLastCell={isLastCell}
                  keyboardType={type === COLUMN_TYPES.EDITABLE_NUMERIC ? 'numeric' : 'default'}
                  textInputStyle={cellText[cellAlignment]}
                  textStyle={editableCellUnfocused[cellAlignment]}
                  cellTextStyle={editableCellText}
                  rowIndex={rowIndex}
                  placeholder={placeholder}
                />
              );
            }
            case COLUMN_TYPES.EDITABLE_EXPIRY_DATE:
              return (
                <ExpiryDateInput
                  key={columnKey}
                  value={rowData[columnKey]}
                  rowKey={rowKey}
                  columnKey={columnKey}
                  editAction={getAction(columnKey)}
                  isDisabled={isDisabled}
                  dispatch={dispatch}
                  width={width}
                  isLastCell={isLastCell}
                  rowIndex={rowIndex}
                />
              );

            case COLUMN_TYPES.CHECKABLE:
              return (
                <CheckableCell
                  key={columnKey}
                  rowKey={rowKey}
                  columnKey={columnKey}
                  isChecked={rowState && rowState.isSelected}
                  isDisabled={isDisabled}
                  CheckedComponent={CheckedComponent}
                  UncheckedComponent={UncheckedComponent}
                  DisabledCheckedComponent={DisabledCheckedComponent}
                  DisabledUncheckedComponent={DisabledUncheckedComponent}
                  onCheckAction={getAction(columnKey, 'onCheckAction')}
                  onUncheckAction={getAction(columnKey, 'onUncheckAction')}
                  dispatch={dispatch}
                  containerStyle={touchableCellContainer}
                  width={width}
                  isLastCell={isLastCell}
                />
              );

            case COLUMN_TYPES.STRING: {
              const value = rowData[columnKey];
              const displayValue = columnKey === 'status' ? formatStatus(value) : value;
              return (
                <Cell
                  key={columnKey}
                  value={displayValue}
                  width={width}
                  viewStyle={cellContainer[cellAlignment]}
                  textStyle={cellText[cellAlignment]}
                  isLastCell={isLastCell}
                />
              );
            }

            case COLUMN_TYPES.NUMERIC: {
              return (
                <Cell
                  key={columnKey}
                  value={Math.round(rowData[columnKey])}
                  width={width}
                  viewStyle={cellContainer[cellAlignment]}
                  textStyle={cellText[cellAlignment]}
                  isLastCell={isLastCell}
                />
              );
            }

            case COLUMN_TYPES.DATE:
              return (
                <Cell
                  key={columnKey}
                  value={rowData[columnKey] && rowData[columnKey].toDateString()}
                  width={width}
                  viewStyle={cellContainer[cellAlignment]}
                  textStyle={cellText[cellAlignment]}
                  isLastCell={isLastCell}
                />
              );

            case COLUMN_TYPES.ICON:
              return (
                <TouchableCell
                  key={columnKey}
                  renderChildren={OpenModal}
                  rowKey={rowKey}
                  columnKey={columnKey}
                  onPressAction={getAction(columnKey)}
                  dispatch={dispatch}
                  width={width}
                  isLastCell={isLastCell}
                  containerStyle={iconCell}
                />
              );

            case COLUMN_TYPES.DROP_DOWN:
              return (
                <DropDownCell
                  key={columnKey}
                  isDisabled={isFinalised}
                  dispatch={dispatch}
                  onPressAction={getAction(columnKey)}
                  rowKey={rowKey}
                  columnKey={columnKey}
                  value={rowData[columnKey]}
                  isLastCell={isLastCell}
                  width={width}
                />
              );

            default: {
              return (
                <Cell
                  key={columnKey}
                  value={rowData[columnKey]}
                  width={width}
                  viewStyle={cellContainer[cellAlignment]}
                  textStyle={cellText[cellAlignment]}
                  isLastCell={isLastCell}
                />
              );
            }
          }
        }),
      [isFinalised, rowState, rowData, rowIndex]
    );

    return (
      <Row
        onPress={onPress}
        style={rowStyle}
        renderCells={renderCells}
        debug
        rowKey={rowKey}
        rowData={rowData}
        rowState={rowState}
        rowIndex={rowIndex}
      />
    );
  }
);

DataTableRow.defaultProps = {
  isFinalised: false,
  getAction: null,
  onPress: null,
  rowState: null,
};

DataTableRow.propTypes = {
  onPress: PropTypes.func,
  rowData: PropTypes.object.isRequired,
  rowState: PropTypes.object,
  rowKey: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  isFinalised: PropTypes.bool,
  getAction: PropTypes.func,
  rowIndex: PropTypes.number.isRequired,
};

export default DataTableRow;
