/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/forbid-prop-types */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import * as Animatable from 'react-native-animatable';
import { FlatList, TouchableOpacity } from 'react-native';
import Cell from './DataTable/Cell';
import { dataTableStyles, GREY } from '../globalStyles/index';
import { HeaderCell, HeaderRow, TouchableNoFeedback } from './DataTable/index';
import { getItemLayout, recordKeyExtractor } from '../pages/dataTableUtilities';
import { generalStrings } from '../localization';
import { formatDate } from '../utilities';

/**
 * Simple table component for rendering a large list of un-changing data.
 * Only offers a selection feature.
 *
 * Usage:
 * Pass an array - data: [ { id, .. }, { id, .. }, .. ] (Also accepts a Realm Results array)
 * Also an array - columns: [ { key, alignText, title } ] (example: getColumns.js)
 * Such that each column.key is a field within an object in the data array.
 *
 * selectRow should be a function: (rowId) => { ... }
 *
 * selectedRows, an object with the shape: {rowId1: [bool], rowId2: [bool], ... } used
 * to trigger styling effects on selected rows.
 */
export const SimpleTable = React.memo(
  React.forwardRef(
    (
      { data, columns, selectRow, selectedRows, disabledRows, isDisabled, style, ...flatListProps },
      ref
    ) => {
      const {
        cellText,
        cellContainer,
        selectedRow: selectedRowStyle,
        alternateRow: alternateRowStyle,
        row: basicRowStyle,
        headerRow,
        headerCells,
      } = dataTableStyles;
      const renderCells = useCallback(
        rowData => {
          const { id } = rowData;

          return columns.map(({ key, width, alignText, type }, index) => {
            const disabledStyle = disabledRows?.[id] || isDisabled ? { color: GREY } : {};
            const textStyle = { ...cellText[alignText], ...disabledStyle };
            const valueText =
              type === 'date'
                ? formatDate(rowData[key], 'll') ?? generalStrings.not_available
                : rowData[key];

            return (
              <Cell
                value={valueText}
                viewStyle={cellContainer[alignText]}
                textStyle={textStyle}
                isLastCell={index === columns.length - 1}
                width={width}
                key={`${id}${key}`}
              />
            );
          });
        },
        [disabledRows, isDisabled, data]
      );

      const renderRow = useCallback(
        ({ item, index }) => {
          const { id } = item;
          const isRowDisabled = disabledRows?.[id] || isDisabled;
          const isSelected = selectedRows?.[id];
          const rowStyle = isSelected
            ? selectedRowStyle
            : (index % 2 === 0 && alternateRowStyle) || basicRowStyle;

          return (
            <SimpleRow
              rowData={item}
              rowIndex={index}
              rowKey={id}
              style={rowStyle}
              renderCells={renderCells}
              onPress={isRowDisabled ? null : selectRow}
              isSelected={isSelected}
            />
          );
        },
        [selectedRows, disabledRows, selectRow, isDisabled]
      );

      const renderHeaderCells = useCallback(
        () =>
          columns.map(({ title, width, alignText }, index) => (
            <HeaderCell
              key={title}
              title={title}
              containerStyle={headerCells[alignText]}
              textStyle={cellText[alignText]}
              isLastCell={index === columns.length - 1}
              width={width}
            />
          )),
        [columns]
      );

      const renderHeaders = useCallback(
        () => <HeaderRow style={headerRow} columns={columns} renderCells={renderHeaderCells} />,
        [columns]
      );

      return (
        <FlatList
          ref={ref}
          data={data}
          keyExtractor={recordKeyExtractor}
          getItemLayout={getItemLayout}
          renderItem={renderRow}
          stickyHeaderIndices={[0]}
          ListHeaderComponent={renderHeaders}
          extraData={selectedRows}
          style={style}
          {...flatListProps}
        />
      );
    }
  )
);

SimpleTable.defaultProps = {
  selectedRows: {},
  disabledRows: null,
  selectRow: null,
  isDisabled: false,
  style: null,
};

SimpleTable.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  columns: PropTypes.array.isRequired,
  selectRow: PropTypes.func,
  selectedRows: PropTypes.object,
  disabledRows: PropTypes.object,
  isDisabled: PropTypes.bool,
  style: PropTypes.object,
};

const SimpleRow = React.memo(({ rowData, style, rowKey, renderCells, onPress }) => {
  const onSelect = useCallback(() => onPress(rowData), [rowData, onPress]);
  const Container = onPress ? TouchableOpacity : TouchableNoFeedback;
  return (
    <Container onPress={onSelect} key={rowKey}>
      <Animatable.View animation="fadeIn" duration={1000} useNativeDriver style={style}>
        {renderCells(rowData)}
      </Animatable.View>
    </Container>
  );
});

SimpleRow.defaultProps = {
  onPress: null,
};

SimpleRow.propTypes = {
  rowData: PropTypes.object.isRequired,
  rowKey: PropTypes.string.isRequired,
  style: PropTypes.object.isRequired,
  renderCells: PropTypes.func.isRequired,
  onPress: PropTypes.func,
};
