/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { getItemLayout, getPageDispatchers, PageActions } from './dataTableUtilities';

import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';
import { DataTablePageView, SearchBar, ToggleBar } from '../widgets';

import globalStyles from '../globalStyles';
import { useSyncListener } from '../hooks';

import { generalStrings, buttonStrings } from '../localization';
import { SupplierCreditActions } from '../actions/SupplierCreditActions';
import { RowDetailActions } from '../actions/RowDetailActions';
import { ROUTES } from '../navigation';

/**
 * Renders a mSupply mobile page with Items and their stock levels.
 *
 * State:
 * Uses a reducer to manage state with `backingData` being a realm results
 * of items to display. `data` is a plain JS array of realm objects. data is
 * hydrated from the `backingData` for displaying in the interface.
 * i.e: When filtering, data is populated from filtered items of `backingData`.
 *
 * dataState is a simple map of objects corresponding to a row being displayed,
 * holding the state of a given row. Each object has the shape :
 * { isSelected, isFocused, isDisabled },
 */
export const Stock = ({
  data,
  dataState,
  sortKey,
  isAscending,
  selectedRow,
  searchTerm,
  keyExtractor,
  columns,
  refreshData,
  onSelectRow,
  onDeselectRow,
  onFilterData,
  onSortColumn,
  refund,
  showAll,
  toggleStockOut,
}) => {
  //  Refresh data on retrieving item or itembatch records from sync.
  useSyncListener(refreshData, ['Item', 'ItemBatch']);

  const refundCallback = React.useCallback(() => itemId => refund(itemId), []);

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = keyExtractor(item);
      return (
        <DataTableRow
          rowData={data[index]}
          rowState={dataState.get(rowKey)}
          rowKey={rowKey}
          columns={columns}
          rowIndex={index}
          onPress={onSelectRow}
          getCallback={refundCallback}
        />
      );
    },
    [data, dataState]
  );

  const renderHeader = () => (
    <DataTableHeaderRow
      columns={columns}
      onPress={onSortColumn}
      isAscending={isAscending}
      sortKey={sortKey}
    />
  );

  const toggles = useMemo(
    () => [{ text: buttonStrings.hide_zero_stocks, onPress: toggleStockOut, isOn: !showAll }],
    [showAll]
  );

  const {
    pageTopSectionContainer,
    pageTopRightSectionContainer,
    pageTopLeftSectionContainer,
  } = globalStyles;
  return (
    <DataTablePageView captureUncaughtGestures={false}>
      <View style={pageTopSectionContainer}>
        <View style={pageTopLeftSectionContainer}>
          <SearchBar
            onChangeText={onFilterData}
            value={searchTerm}
            onFocusOrBlur={selectedRow && onDeselectRow}
            // eslint-disable-next-line max-len
            placeholder={`${generalStrings.search_by} ${generalStrings.code} ${generalStrings.or} ${generalStrings.name}`}
          />
        </View>
        <View style={pageTopRightSectionContainer}>
          <ToggleBar toggles={toggles} />
        </View>
      </View>

      <DataTable
        data={data}
        extraData={dataState}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        columns={columns}
      />
    </DataTablePageView>
  );
};

const mapDispatchToProps = dispatch => ({
  ...getPageDispatchers(dispatch, '', 'stock'),
  onSelectRow: rowKey => dispatch(RowDetailActions.openItemDetail(rowKey)),
  refund: rowKey => dispatch(SupplierCreditActions.createFromItem(rowKey)),
  onFilterData: value => dispatch(PageActions.filterDataWithZeroStockToggle(value, ROUTES.STOCK)),
});

const mapStateToProps = state => {
  const { pages } = state;
  const { stock } = pages;

  return stock;
};

export const StockPage = connect(mapStateToProps, mapDispatchToProps)(Stock);

Stock.defaultProps = {
  selectedRow: null,
  showAll: true,
};

Stock.propTypes = {
  data: PropTypes.array.isRequired,
  dataState: PropTypes.object.isRequired,
  sortKey: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  selectedRow: PropTypes.object,
  searchTerm: PropTypes.string.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  columns: PropTypes.array.isRequired,
  refreshData: PropTypes.func.isRequired,
  onSelectRow: PropTypes.func.isRequired,
  onDeselectRow: PropTypes.func.isRequired,
  onFilterData: PropTypes.func.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  refund: PropTypes.func.isRequired,
  showAll: PropTypes.bool,
  toggleStockOut: PropTypes.func.isRequired,
};
