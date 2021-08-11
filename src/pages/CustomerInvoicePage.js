/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View, ToastAndroid } from 'react-native';
import { connect } from 'react-redux';

import { MODAL_KEYS } from '../utilities';
import { getColumns, getItemLayout, getPageDispatchers } from './dataTableUtilities';
import { ROUTES } from '../navigation/constants';

import { DataTablePageModal } from '../widgets/modals';
import { PageButton, PageInfo, SearchBar, DataTablePageView } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';
import { BottomConfirmModal } from '../widgets/bottomModals';

import { buttonStrings, modalStrings, generalStrings } from '../localization';
import globalStyles from '../globalStyles';
import { BreachActions } from '../actions/BreachActions';
import { useLoadingIndicator } from '../hooks/useLoadingIndicator';

/**
 * Renders a mSupply mobile page with customer invoice loaded for editing
 *
 * State:
 * Uses a reducer to manage state with `backingData` being a realm results
 * of items to display. `data` is a plain JS array of realm objects. data is
 * hydrated from the `backingData` for displaying in the interface.
 * i.e: When filtering, data is populated from filtered items of `backingData`.
 *
 * dataState is a simple map of objects corresponding to a row being displayed,
 * holding the state of a given row. Each object has the shape :
 * { isSelected, isFocused, isDisabled }
 */
export const CustomerInvoice = ({
  dispatch,
  data,
  dataState,
  pageObject,
  sortKey,
  isAscending,
  modalKey,
  hasSelection,
  keyExtractor,
  searchTerm,
  modalValue,
  columns,
  getPageInfoColumns,
  onSelectNewItem,
  onEditComment,
  onEditTheirRef,
  onFilterData,
  onDeleteItems,
  onDeselectAll,
  onCloseModal,
  onCheck,
  onUncheck,
  onSortColumn,
  onEditTotalQuantity,
  onAddTransactionItem,
  onAddMasterList,
  onApplyMasterLists,
  route,
  onEditBatchDoses,
  onViewBreaches,
}) => {
  const { isFinalised, comment, theirRef } = pageObject;

  const pageInfoColumns = useCallback(getPageInfoColumns(pageObject, dispatch, route), [
    comment,
    theirRef,
    isFinalised,
  ]);

  const runWithLoadingIndicator = useLoadingIndicator();

  const onAddFromMasterLists = selected => {
    onCloseModal();
    runWithLoadingIndicator(() => onApplyMasterLists(selected, pageObject));
  };

  const getCallback = (colKey, propName) => {
    switch (colKey) {
      case 'totalQuantity':
        return onEditTotalQuantity;
      case 'remove':
        if (propName === 'onCheck') return onCheck;
        return onUncheck;
      case 'doses':
        return onEditBatchDoses;
      case 'hasBreached':
        return onViewBreaches;
      default:
        return null;
    }
  };

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.SELECT_ITEM:
        return onAddTransactionItem;
      case MODAL_KEYS.TRANSACTION_COMMENT_EDIT:
        return onEditComment;
      case MODAL_KEYS.THEIR_REF_EDIT:
        return onEditTheirRef;
      case MODAL_KEYS.SELECT_MASTER_LISTS:
        return onAddFromMasterLists;
      default:
        return null;
    }
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
          isFinalised={isFinalised}
          getCallback={getCallback}
          rowIndex={index}
        />
      );
    },
    [data, dataState]
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
    [columns, sortKey, isAscending]
  );

  const { verticalContainer, topButton } = globalStyles;
  const {
    pageTopSectionContainer,
    pageTopLeftSectionContainer,
    pageTopRightSectionContainer,
  } = globalStyles;
  return (
    <DataTablePageView>
      <View style={pageTopSectionContainer}>
        <View style={pageTopLeftSectionContainer}>
          <PageInfo columns={pageInfoColumns} isEditingDisabled={isFinalised} />
          <SearchBar
            onChangeText={onFilterData}
            value={searchTerm}
            // eslint-disable-next-line max-len
            placeholder={`${generalStrings.search_by} ${generalStrings.item_name} ${generalStrings.or} ${generalStrings.item_code}`}
          />
        </View>
        <View style={pageTopRightSectionContainer}>
          <View style={verticalContainer}>
            <PageButton
              style={{ ...topButton, marginLeft: 0 }}
              text={buttonStrings.new_item}
              onPress={onSelectNewItem}
              isDisabled={isFinalised}
            />
            <PageButton
              text={buttonStrings.add_master_list_items}
              onPress={onAddMasterList}
              isDisabled={isFinalised}
            />
          </View>
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
      <BottomConfirmModal
        isOpen={hasSelection && !isFinalised}
        questionText={modalStrings.remove_these_items}
        onCancel={onDeselectAll}
        onConfirm={onDeleteItems}
        confirmText={modalStrings.remove}
      />
      <DataTablePageModal
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={onCloseModal}
        onSelect={getModalOnSelect()}
        dispatch={dispatch}
        currentValue={modalValue}
      />
    </DataTablePageView>
  );
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { transaction } = ownProps?.route?.params || {};
  const { otherParty } = transaction || {};
  const hasMasterLists = otherParty?.masterLists?.length > 0;

  const onViewBreaches = rowKey => dispatch(BreachActions.viewTransactionItemBreaches(rowKey));

  const noMasterLists = () =>
    ToastAndroid.show(modalStrings.customer_no_masterlist_available, ToastAndroid.LONG);
  return {
    ...getPageDispatchers(dispatch, 'Transaction', ROUTES.CUSTOMER_INVOICE),
    [hasMasterLists ? null : 'onAddMasterList']: noMasterLists,
    onViewBreaches,
  };
};

const mapStateToProps = state => {
  const { pages, modules } = state;
  const { customerInvoice } = pages;
  const { usingVaccines } = modules;
  const { pageObject } = customerInvoice ?? {};
  const { isCredit = false } = pageObject ?? {};
  if (isCredit) return { ...customerInvoice, columns: getColumns(ROUTES.CUSTOMER_CREDIT) };
  if (usingVaccines && pageObject?.hasVaccine) {
    return { ...customerInvoice, columns: getColumns(ROUTES.CUSTOMER_INVOICE_WITH_VACCINES) };
  }
  return { ...customerInvoice, columns: getColumns(ROUTES.CUSTOMER_INVOICE) };
};

export const CustomerInvoicePage = connect(mapStateToProps, mapDispatchToProps)(CustomerInvoice);

CustomerInvoice.defaultProps = {
  modalValue: null,
};

CustomerInvoice.propTypes = {
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  dataState: PropTypes.object.isRequired,
  pageObject: PropTypes.object.isRequired,
  sortKey: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  modalKey: PropTypes.string.isRequired,
  hasSelection: PropTypes.bool.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  modalValue: PropTypes.any,
  columns: PropTypes.array.isRequired,
  getPageInfoColumns: PropTypes.func.isRequired,
  onSelectNewItem: PropTypes.func.isRequired,
  onAddMasterList: PropTypes.func.isRequired,
  onEditComment: PropTypes.func.isRequired,
  onEditTheirRef: PropTypes.func.isRequired,
  onFilterData: PropTypes.func.isRequired,
  onDeleteItems: PropTypes.func.isRequired,
  onDeselectAll: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  onCheck: PropTypes.func.isRequired,
  onUncheck: PropTypes.func.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  onEditTotalQuantity: PropTypes.func.isRequired,
  onAddTransactionItem: PropTypes.func.isRequired,
  onApplyMasterLists: PropTypes.func.isRequired,
  route: PropTypes.string.isRequired,
  onEditBatchDoses: PropTypes.func.isRequired,
  onViewBreaches: PropTypes.func.isRequired,
};
