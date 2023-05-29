/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import PropTypes from 'prop-types';
import React, { useMemo, useRef, useCallback, createRef } from 'react';
import { StyleSheet, VirtualizedList, VirtualizedListPropTypes, Keyboard } from 'react-native';
import RefContext from './RefContext';
import { DataTableView } from './DataTableView';
import { DATA_TABLE_DEFAULTS } from './constants';

/**
 * Base DataTable component. Wrapper around VirtualizedList, providing
 * a header component, scroll to top and focus features.
 * All VirtualizedList props can be passed through, however renderItem
 * is renamed renderRow.
 *
 * Managing focus and scrolling:
 * Can manage focusing and auto-scrolling for editable cells through react context API.
 *
 * Four parameters are passed in through the refContext:
 *
 * - `getRefIndex`   : Gets the ref index for an editable cell given the columnkey and row index.
 * - `getCellRef`    : Lazily creates a ref for a cell.
 * - `focusNextCell` : Focus' the next editable cell. Call during onEditingSubmit.
 *
 * @param {Func}   renderRow    Renaming of VirtualizedList renderItem prop.
 * @param {Func}   renderHeader Function which should return a header component
 * @param {Object} style        Style Object for this component.
 * @param {Object} data         Array of data objects.
 * @param {Object} columns      Array of column objects.
 */
const DataTable = React.memo(
  ({ renderRow, renderHeader, style, data, columns, footerHeight, ...otherProps }) => {
    // Array of column keys for determining ref indicies.
    const editableColumnKeys = useMemo(
      () =>
        columns.reduce((columnKeys, column) => {
          const { editable } = column;
          if (editable) return [...columnKeys, column.key];
          return columnKeys;
        }, []),
      [columns]
    );
    const numberOfEditableColumns = editableColumnKeys.length;
    const numberOfRows = data.length;
    const numberOfEditableCells = numberOfEditableColumns * numberOfRows;

    // Array for each editable cell. Needs to be stable, but updates shouldn't cause re-renders.
    const cellRefs = useRef(Array.from({ length: numberOfEditableCells }));

    // Passes a cell it's ref index.
    const getRefIndex = (rowIndex, columnKey) => {
      const columnIndex = editableColumnKeys.findIndex(key => columnKey === key);

      return rowIndex * numberOfEditableColumns + columnIndex;
    };

    // Callback for an editable cell. Lazily creating refs.
    const getCellRef = refIndex => {
      if (cellRefs.current[refIndex]) return cellRefs.current[refIndex];

      const newRef = createRef();
      cellRefs.current[refIndex] = newRef;

      return newRef;
    };

    // Focuses the next editable cell in the list. On the last row, dismiss the keyboard.
    const focusNextCell = refIndex => {
      const lastRefIndex = numberOfEditableCells - 1;
      if (refIndex === lastRefIndex) return Keyboard.dismiss();

      const nextCellRef = (refIndex + 1) % numberOfEditableCells;
      const cellRef = getCellRef(nextCellRef);

      return cellRef.current && cellRef.current.focus();
    };

    // Contexts values. Functions passed to rows and editable cells to control focus/scrolling.
    const contextValue = useMemo(
      () => ({
        getRefIndex,
        getCellRef,
        focusNextCell,
      }),
      [numberOfEditableCells]
    );

    const renderItem = useCallback(rowItem => renderRow(rowItem, focusNextCell, getCellRef), [
      renderRow,
    ]);

    return (
      <RefContext.Provider value={contextValue}>
        <DataTableView style={{ flex: 1 }}>
          <VirtualizedList
            data={data}
            keyboardShouldPersistTaps="always"
            style={style}
            ListHeaderComponent={() => renderHeader && renderHeader()}
            renderItem={renderItem}
            {...otherProps}
          />
        </DataTableView>
      </RefContext.Provider>
    );
  }
);

const defaultStyles = StyleSheet.create({
  virtualizedList: {
    flex: 1,
  },
});

DataTable.propTypes = {
  ...VirtualizedListPropTypes,
  renderRow: PropTypes.func.isRequired,
  renderHeader: PropTypes.func,
  getItem: PropTypes.func,
  getItemCount: PropTypes.func,
  initialNumToRender: PropTypes.number,
  removeClippedSubviews: PropTypes.bool,
  windowSize: PropTypes.number,
  style: PropTypes.object,
  footerHeight: PropTypes.number,
  columns: PropTypes.array,
};

DataTable.defaultProps = {
  renderHeader: DATA_TABLE_DEFAULTS.RENDER_HEADER,
  footerHeight: DATA_TABLE_DEFAULTS.FOOTER_HEIGHT,
  style: defaultStyles.virtualizedList,
  getItem: (items, index) => items[index],
  getItemCount: items => items.length,
  initialNumToRender: DATA_TABLE_DEFAULTS.INITIAL_NUM_TO_RENDER,
  removeClippedSubviews: DATA_TABLE_DEFAULTS.REMOVE_CLIPPED_SUBVIEWS,
  windowSize: DATA_TABLE_DEFAULTS.WINDOW_SIZE_MEDIUM,
  columns: [],
};

export default DataTable;
