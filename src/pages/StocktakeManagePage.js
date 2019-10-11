/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { usePageReducer } from '../hooks';
import { getItemLayout } from './dataTableUtilities';
import { createStocktake, updateStocktake } from '../navigation/actions';

import { BottomTextEditor } from '../widgets/modals';
import { ToggleBar, DataTablePageView, SearchBar } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { buttonStrings, modalStrings } from '../localization';
import globalStyles from '../globalStyles';

export const StocktakeManagePage = ({
  routeName,
  dispatch: reduxDispatch,
  stocktake,
  runWithLoadingIndicator,
}) => {
  const initialState = { page: routeName, pageObject: stocktake };
  const [state, dispatch, instantDebouncedDispatch] = usePageReducer(initialState);

  const {
    data,
    dataState,
    sortBy,
    isAscending,
    hasSelection,
    showAll,
    allSelected,
    name,
    keyExtractor,
    searchTerm,
    PageActions,
    columns,
  } = state;

  // On navigating to this screen, if a stocktake is passed through, update the selection with
  // the items already in the stocktake.
  useEffect(() => {
    if (stocktake) dispatch(PageActions.selectItems(stocktake.itemsInStocktake));
  }, []);

  const getAction = useCallback((colKey, propName) => {
    switch (colKey) {
      case 'selected':
        if (propName === 'onCheckAction') return PageActions.selectRow;
        return PageActions.deselectRow;
      default:
        return null;
    }
  }, []);

  const onFilterData = value => dispatch(PageActions.filterData(value));
  const onNameChange = value => dispatch(PageActions.editName(value));
  const onSelectAll = () => dispatch(PageActions.toggleAllSelected(allSelected));
  const onHideStock = () => dispatch(PageActions.toggleStockOut(showAll));

  const onConfirmStocktake = () => {
    runWithLoadingIndicator(() => {
      const itemIds = Array.from(dataState.keys()).filter(id => dataState.get(id).isSelected && id);
      if (stocktake) return reduxDispatch(updateStocktake(stocktake, itemIds, name));
      return reduxDispatch(createStocktake({ stocktakeName: name, itemIds }));
    });
  };

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
          dispatch={dispatch}
          getAction={getAction}
          rowIndex={index}
        />
      );
    },
    [data, dataState, showAll, hasSelection]
  );

  const renderHeader = useCallback(
    () => (
      <DataTableHeaderRow
        columns={columns}
        dispatch={instantDebouncedDispatch}
        sortAction={PageActions.sortData}
        isAscending={isAscending}
        sortBy={sortBy}
      />
    ),
    [sortBy, isAscending]
  );

  const toggles = useMemo(
    () => [
      { text: buttonStrings.hide_stockouts, onPress: onHideStock, isOn: !showAll },
      { text: buttonStrings.all_items_selected, onPress: onSelectAll, isOn: allSelected },
    ],
    [showAll, allSelected]
  );

  const {
    pageTopSectionContainer,
    pageTopLeftSectionContainer,
    pageTopRightSectionContainer,
  } = globalStyles;
  return (
    <DataTablePageView>
      <View style={pageTopSectionContainer}>
        <View style={pageTopLeftSectionContainer}>
          <SearchBar onChangeText={onFilterData} value={searchTerm} />
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
      />

      <BottomTextEditor
        isOpen
        buttonText={stocktake ? modalStrings.confirm : modalStrings.create}
        value={name}
        placeholder={modalStrings.give_your_stocktake_a_name}
        onConfirm={onConfirmStocktake}
        onChangeText={onNameChange}
      />
    </DataTablePageView>
  );
};

StocktakeManagePage.defaultProps = {
  stocktake: null,
};

/* eslint-disable react/forbid-prop-types */
StocktakeManagePage.propTypes = {
  runWithLoadingIndicator: PropTypes.func.isRequired,
  routeName: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  stocktake: PropTypes.object,
};
