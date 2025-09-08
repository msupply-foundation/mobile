/* eslint-disable react/forbid-prop-types */

import React from 'react';
import PropTypes from 'prop-types';

import HeaderRow from './HeaderRow';
import HeaderCell from './HeaderCell';

import { SortAscIcon, SortNeutralIcon, SortDescIcon } from '../icons';

import { dataTableStyles } from '../../globalStyles';

/**
 * Simple wrapper around HeaderRow component. Applies mSupply styles and extracts
 * the generic shared logic for all data table pages header rows into one place.
 *
 * @param {Array}  columns     Array of column objects see columns.js
 * @param {String} sortKey      columnKey indicating which column is sorted for the correct icon.
 * @param {Bool}   isAscending Additional indicator for the column which is sorted by.
 * @param {Func}   dispatch    Dispatch function for managing the row containers state.
 * @param {Func}   sortAction  Action creator for generating a sorting action.
 *
 *
 */
const DataTableHeaderRow = React.memo(({ columns, sortKey, isAscending, onPress, isSortable }) => {
  const { headerRow, headerCells, cellText } = dataTableStyles;
  const renderCells = React.useCallback(
    () =>
      columns.map(({ key, title, sortable, width, alignText }, index) => {
        const sortDirection = isAscending ? 'ASC' : 'DESC';
        const directionForThisColumn = key === sortKey ? sortDirection : null;
        const isLastCell = index === columns.length - 1;
        const cellKey = `header-${key}-${index}`;

        return (
          <HeaderCell
            key={cellKey}
            title={title || ''}
            SortAscComponent={<SortAscIcon />}
            SortDescComponent={<SortDescIcon />}
            SortNeutralComponent={<SortNeutralIcon />}
            columnKey={key}
            onPress={sortable ? onPress : null}
            sortDirection={directionForThisColumn}
            sortable={isSortable ? sortable : false}
            width={width}
            containerStyle={headerCells[alignText || 'left']}
            textStyle={cellText[alignText || 'left']}
            isLastCell={isLastCell}
          />
        );
      }),
    [columns, sortKey, isAscending, onPress]
  );
  return <HeaderRow style={headerRow} renderCells={renderCells} />;
});

DataTableHeaderRow.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object),
  sortKey: PropTypes.string,
  isAscending: PropTypes.bool,
  onPress: PropTypes.func,
  isSortable: PropTypes.bool,
};

DataTableHeaderRow.defaultProps = {
  isAscending: false,
  columns: [],
  sortKey: '',
  onPress: null,
  isSortable: true,
};

export default DataTableHeaderRow;
