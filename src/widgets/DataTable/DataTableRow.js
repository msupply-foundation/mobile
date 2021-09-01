/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import currency from '../../localization/currency';

import { ROW_BLUE, dataTableStyles, SUSSOL_ORANGE } from '../../globalStyles';

import Row from './Row';
import Cell from './Cell';

import CheckableCell from './CheckableCell';
import TouchableCell from './TouchableCell';
import DropDownCell from '../DropDownCell';
import TextInputCell from './TextInputCell';
import { ExpiryDateInput } from '../ExpiryDateInput';
import {
  CheckedIcon,
  UncheckedIcon,
  DisabledCheckedIcon,
  DisabledUncheckedIcon,
  ChevronRightIcon,
  HistoryIcon,
  PencilIcon,
  HazardIcon,
  BookIcon,
  PlusCircle,
} from '../icons';

import { COLUMN_TYPES, COLUMN_KEYS } from '../../pages/dataTableUtilities';
import { generalStrings, tableStrings } from '../../localization';
import { formatStatus, formatDate } from '../../utilities';
import { formatType } from '../../utilities/formatStatus';
import { useDebounce } from '../../hooks';
import { twoDecimalsMax } from '../../utilities/formatters';

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
 * @param {Func}   rowIndex    index of this row.
 * @param {Func}   onPress     On press callback for the row itself.
 * @param {Func}   getCallback Function to return a cells callback
 *                             (colKey, propName) => callback
 */
const DataTableRow = React.memo(
  ({
    rowData,
    rowState,
    rowKey,
    columns,
    isFinalised,
    getCallback,
    onPress,
    rowIndex,
    getCellError,
    isValidated,
  }) => {
    const {
      cellText,
      cellContainer,
      warningCellContainer,
      errorCellContainer,
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

    const [hasFocus, setFocused] = React.useState(false);
    const focus = useDebounce(shouldFocus => setFocused(shouldFocus), 50, false);

    const rowStyle = useMemo(
      () => ({
        ...(rowIndex % 2 === 0 ? alternateRowStyle : basicRowStyle),
        ...(isSelected && selectedRowStyle),
        ...(!isValidated && { borderColor: SUSSOL_ORANGE, borderWidth: 1, borderRadius: 5 }),
        ...(hasFocus && { backgroundColor: ROW_BLUE }),
      }),
      [rowIndex, isSelected, isValidated, hasFocus]
    );

    // Callback for rendering a row of cells.
    const renderCells = useCallback(
      () =>
        // Map each column to an appropriate cell for a given row.
        columns.map(({ key: columnKey, type, width, alignText, icon }, index) => {
          // Indicator if the right hand border should be removed from styles for this cell.
          const isLastCell = index === columns.length - 1;

          const { isLinkedToTransaction, isFinalised: rowIsFinalised } = rowData;
          // This cell is disabled if:
          // - the page is finalised.
          // - the row has been explicitly set as disabled.
          // - The row itself is finalised.
          // - The row was created on the primary
          const rowIsDisabled = rowState?.isDisabled ?? false;
          const isDisabled =
            isFinalised || rowIsDisabled || rowIsFinalised || isLinkedToTransaction;

          // Alignment of this particular column. Default to left hand ide.
          const cellAlignment = alignText || 'left';

          switch (type) {
            case COLUMN_TYPES.EDITABLE_STRING:
            case COLUMN_TYPES.EDITABLE_NUMERIC: {
              const { isVaccine, hasBeenCounted } = rowData;

              // Placeholder values which are determined on a per row basis. For example, display
              // "Not counted" as a placeholder on a stocktake row. Placeholders are used under
              // the condition [placeholder && !value] which can be a source of bugs with JS
              // falsey values. I.e. if a value is 0, the placeholder will display rather than
              // the value.
              const extraPlaceholders = {
                [COLUMN_KEYS.COUNTED_TOTAL_QUANTITY]: hasBeenCounted
                  ? ''
                  : tableStrings.not_counted,
              };

              // Extra disabled conditions for columns which can be determined per row. For example,
              // only allow the doses column for vaccine items.
              const disabledCondition = {
                [COLUMN_KEYS.DOSES]: !isVaccine,
              };

              // Extra text which can be displayed for a column on a per row basis when the
              // cell is disabled. For example display N/A on a row for the doses column rather
              // than the underlying value "0".
              const disabledText = {
                [COLUMN_KEYS.DOSES]: isVaccine ? '' : generalStrings.not_available,
              };

              let value = disabledText[columnKey] ? disabledText[columnKey] : rowData[columnKey];
              if (typeof value === 'number') {
                value = twoDecimalsMax(rowData[columnKey]);
              }

              const placeholder = extraPlaceholders[columnKey] ?? '';

              const inputIsDisabled = isDisabled || !!disabledCondition[columnKey];

              const cellErrors = getCellError?.(rowData, columnKey);
              const alternateCellStyleLookup = {
                warning: warningCellContainer,
                error: errorCellContainer,
              };
              const cellContainerStyle = alternateCellStyleLookup[cellErrors] ?? cellContainer;

              return (
                <TextInputCell
                  onFocus={() => focus(true)}
                  onBlur={() => focus(false)}
                  key={columnKey}
                  value={value}
                  rowKey={rowKey}
                  columnKey={columnKey}
                  onChangeText={getCallback(columnKey)}
                  isDisabled={inputIsDisabled}
                  width={width}
                  viewStyle={cellContainerStyle[cellAlignment]}
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
                  onFocus={() => focus(true)}
                  onBlur={() => focus(false)}
                  key={columnKey}
                  value={rowData[columnKey]}
                  rowKey={rowKey}
                  columnKey={columnKey}
                  onEndEditing={getCallback(columnKey)}
                  isDisabled={isDisabled}
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
                  CheckedComponent={CheckedIcon}
                  UncheckedComponent={UncheckedIcon}
                  DisabledCheckedComponent={DisabledCheckedIcon}
                  DisabledUncheckedComponent={DisabledUncheckedIcon}
                  onCheck={getCallback(columnKey, 'onCheck')}
                  onUncheck={getCallback(columnKey, 'onUncheck')}
                  containerStyle={touchableCellContainer}
                  width={width}
                  isLastCell={isLastCell}
                />
              );

            case COLUMN_TYPES.CURRENCY: {
              const value = currency(rowData[columnKey]).format(false);

              return (
                <Cell
                  key={columnKey}
                  value={value}
                  width={width}
                  viewStyle={cellContainer[cellAlignment]}
                  textStyle={cellText[cellAlignment]}
                  isLastCell={isLastCell}
                />
              );
            }

            case COLUMN_TYPES.STRING: {
              const value = rowData[columnKey];
              let displayValue = columnKey === 'status' ? formatStatus(value) : value;
              displayValue = columnKey === 'type' ? formatType(displayValue) : displayValue;

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
              // Default to simply displaying the row data column key
              let value = rowData[columnKey];
              if (columnKey === COLUMN_KEYS.DIFFERENCE && !rowData.hasBeenCounted) {
                // Special condition for stocktake difference cells.
                // Use the placeholder 'Not counted' when a stocktake item or batch
                // has not been counted yet.
                value = generalStrings.not_available;
              }

              // When cell values can be floats, cut them off at two DP
              if (typeof value === 'number') {
                value = twoDecimalsMax(rowData[columnKey]);
              }

              const cellErrors = getCellError?.(rowData, columnKey);
              const alternateCellStyleLookup = {
                warning: warningCellContainer,
                error: errorCellContainer,
              };
              const cellContainerStyle = alternateCellStyleLookup[cellErrors] ?? cellContainer;

              return (
                <Cell
                  key={columnKey}
                  value={value}
                  width={width}
                  viewStyle={cellContainerStyle[cellAlignment]}
                  textStyle={cellText[cellAlignment]}
                  isLastCell={isLastCell}
                />
              );
            }

            case COLUMN_TYPES.DATE:
              return (
                <Cell
                  key={columnKey}
                  value={formatDate(rowData[columnKey], 'll') ?? generalStrings.not_available}
                  width={width}
                  viewStyle={cellContainer[cellAlignment]}
                  textStyle={cellText[cellAlignment]}
                  isLastCell={isLastCell}
                />
              );

            case COLUMN_TYPES.ICON: {
              const { hasBreached, isVaccine } = rowData ?? {};

              const icons = {
                chevron_right: () => <ChevronRightIcon />,
                history: () => <HistoryIcon color={SUSSOL_ORANGE} />,
                pencil: () => <PencilIcon color={SUSSOL_ORANGE} />,
                breach: () => (hasBreached ? <HazardIcon color={SUSSOL_ORANGE} /> : null),
                book: () => <BookIcon color={SUSSOL_ORANGE} />,
                plus: () => <PlusCircle color={SUSSOL_ORANGE} size={20} />,
              };

              const disabledConditions = {
                [COLUMN_KEYS.HAS_BREACHED]: !(hasBreached && isVaccine),
              };

              const isEditReadOnlyRecord =
                (columnKey === COLUMN_KEYS.PATIENT_EDIT ||
                  columnKey === COLUMN_KEYS.PRESCRIBER_EDIT) &&
                !rowData.isEditable;
              const iconComponent = isEditReadOnlyRecord ? icons.book : icons[icon];

              const isDisabledIcon =
                (isDisabled || disabledConditions[columnKey]) && columnKey !== COLUMN_KEYS.BATCH;

              return (
                <TouchableCell
                  key={columnKey}
                  renderChildren={iconComponent}
                  rowKey={rowKey}
                  columnKey={columnKey}
                  onPress={getCallback(columnKey)}
                  width={width}
                  isLastCell={isLastCell}
                  isDisabled={isDisabledIcon}
                  containerStyle={iconCell}
                />
              );
            }

            case COLUMN_TYPES.DROP_DOWN: {
              const { isVaccine = false, hasVariance = false } = rowData ?? {};

              const disabledConditions = {
                [COLUMN_KEYS.CURRENT_LOCATION]: !isVaccine,
                [COLUMN_KEYS.CURRENT_VVM_STATUS]: !isVaccine,
                [COLUMN_KEYS.REASON_TITLE]: !hasVariance,
              };

              const extraDisabledCondition = disabledConditions[columnKey];

              return (
                <DropDownCell
                  key={columnKey}
                  isDisabled={isDisabled || extraDisabledCondition}
                  onPress={getCallback(columnKey)}
                  rowKey={rowKey}
                  columnKey={columnKey}
                  value={rowData[columnKey]}
                  isLastCell={isLastCell}
                  width={width}
                />
              );
            }

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
      [isFinalised, rowState, rowData, rowIndex, columns]
    );

    return (
      <Row
        onPress={onPress}
        style={rowStyle}
        renderCells={renderCells}
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
  getCallback: null,
  onPress: null,
  rowState: null,
  getCellError: () => null,
  isValidated: true,
};

DataTableRow.propTypes = {
  onPress: PropTypes.func,
  rowData: PropTypes.object.isRequired,
  rowState: PropTypes.object,
  rowKey: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  isFinalised: PropTypes.bool,
  getCallback: PropTypes.func,
  rowIndex: PropTypes.number.isRequired,
  getCellError: PropTypes.func,
  isValidated: PropTypes.bool,
};

export default DataTableRow;
