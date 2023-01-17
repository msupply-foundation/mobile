/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { getItemLayout, getPageDispatchers, PageActions } from './dataTableUtilities';
import { createStocktake, updateStocktake } from '../navigation/actions';

import { ToggleBar, DataTablePageView, SearchBar } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';
import { BottomTextEditor } from '../widgets/bottomModals';

import { buttonStrings, modalStrings, generalStrings } from '../localization';
import globalStyles from '../globalStyles';

import { ROUTES } from '../navigation/constants';
import { useLoadingIndicator } from '../hooks/useLoadingIndicator';
import { checkIsObjectValuesEmpty } from '../utilities';

export const StocktakeManage = ({
  dispatch,
  data,
  pageObject,
  dataState,
  sortKey,
  isAscending,
  hasSelection,
  showAll,
  allSelected,
  name,
  keyExtractor,
  searchTerm,
  columns,
  onCheck,
  onUncheck,
  onSortColumn,
  onFilterData,
  onNameChange,
  toggleSelectAll,
  toggleStockOut,
  route,
}) => {
  const runWithLoadingIndicator = useLoadingIndicator();
  // On navigating to this screen, if a stocktake is passed through, update the selection with
  // the items already in the stocktake.
  useEffect(() => {
    if (pageObject?.itemsInStocktake) {
      dispatch(PageActions.selectItems(pageObject.itemsInStocktake, route));
    }
  }, [pageObject]);

  const getCallback = (colKey, propName) => {
    switch (colKey) {
      case 'selected':
        if (propName === 'onCheck') return onCheck;
        return onUncheck;
      default:
        return null;
    }
  };

  const onConfirmStocktake = () => {
    runWithLoadingIndicator(() => {
      const itemIds = Array.from(dataState.keys()).filter(id => dataState.get(id).isSelected && id);
      if (!checkIsObjectValuesEmpty(pageObject)) {
        return dispatch(updateStocktake(pageObject, itemIds, name));
      }
      return dispatch(createStocktake({ stocktakeName: name, itemIds }));
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
          getCallback={getCallback}
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
        onPress={onSortColumn}
        isAscending={isAscending}
        sortKey={sortKey}
      />
    ),
    [sortKey, isAscending]
  );

  const toggles = useMemo(
    () => [
      { text: buttonStrings.hide_stockouts, onPress: toggleStockOut, isOn: !showAll },
      { text: buttonStrings.all_items_selected, onPress: toggleSelectAll, isOn: allSelected },
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
          <SearchBar
            onChangeText={onFilterData}
            value={searchTerm}
            placeholder={`${generalStrings.search_by} ${generalStrings.item_name} ${generalStrings.or} ${generalStrings.item_code}`}
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
      />

      <BottomTextEditor
        isOpen
        buttonText={
          !checkIsObjectValuesEmpty(pageObject) ? modalStrings.confirm : modalStrings.create
        }
        value={name}
        placeholder={modalStrings.give_your_stocktake_a_name}
        onConfirm={onConfirmStocktake}
        onChangeText={onNameChange}
      />
    </DataTablePageView>
  );
};

const mapDispatchToProps = dispatch => ({
  ...getPageDispatchers(dispatch, 'Stocktake', ROUTES.STOCKTAKE_MANAGER),
  onFilterData: value =>
    dispatch(PageActions.filterDataWithOverStockToggle(value, ROUTES.STOCKTAKE_MANAGER)),
});

const mapStateToProps = (state, ownProps) => {
  const { pages } = state;
  const { stocktakeManager } = pages;
  const { route } = ownProps;
  const { params } = route ?? {};
  const { pageObject } = params ?? {};

  return { ...stocktakeManager, pageObject };
};

export const StocktakeManagePage = connect(mapStateToProps, mapDispatchToProps)(StocktakeManage);

StocktakeManage.propTypes = {
  pageObject: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  dataState: PropTypes.object.isRequired,
  sortKey: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  hasSelection: PropTypes.bool.isRequired,
  showAll: PropTypes.bool.isRequired,
  allSelected: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  onCheck: PropTypes.func.isRequired,
  onUncheck: PropTypes.func.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  onFilterData: PropTypes.func.isRequired,
  onNameChange: PropTypes.func.isRequired,
  toggleSelectAll: PropTypes.func.isRequired,
  toggleStockOut: PropTypes.func.isRequired,
  route: PropTypes.string.isRequired,
};

StocktakeManage.defaultProps = {
  pageObject: {},
};
