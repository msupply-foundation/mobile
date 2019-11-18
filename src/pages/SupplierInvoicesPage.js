/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { MODAL_KEYS } from '../utilities';
import { usePageReducer, useNavigationFocus, useSyncListener } from '../hooks';
import { getItemLayout } from './dataTableUtilities';
import { gotoSupplierInvoice, createSupplierInvoice } from '../navigation/actions';

import { PageButton, SearchBar, DataTablePageView, ToggleBar } from '../widgets';
import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { buttonStrings, modalStrings } from '../localization';
import globalStyles from '../globalStyles';

export const SupplierInvoicesPage = ({
  currentUser,
  routeName,
  navigation,
  dispatch: reduxDispatch,
}) => {
  const initialState = { page: routeName };
  const [state, dispatch, instantDebouncedDispatch] = usePageReducer(initialState);

  const {
    data,
    dataState,
    sortKey,
    isAscending,
    modalKey,
    hasSelection,
    keyExtractor,
    searchTerm,
    columns,
    PageActions,
    showFinalised,
  } = state;

  // Listen to changes from sync and navigation events re-focusing this screen,
  // such that any side effects that occur trigger a reconcilitation of data.
  const refreshCallback = () => dispatch(PageActions.refreshData());
  useNavigationFocus(refreshCallback, navigation);
  useSyncListener(refreshCallback, ['Transaction']);

  const onCloseModal = () => dispatch(PageActions.closeModal());
  const onFilterData = value => dispatch(PageActions.filterData(value));
  const onNewInvoice = () => dispatch(PageActions.openModal(MODAL_KEYS.SELECT_EXTERNAL_SUPPLIER));
  const onConfirmDelete = () => dispatch(PageActions.deleteTransactions());
  const onCancelDelete = () => dispatch(PageActions.deselectAll());
  const onToggleShowFinalised = () => dispatch(PageActions.toggleShowFinalised(showFinalised));

  const onNavigateToInvoice = useCallback(
    invoice => reduxDispatch(gotoSupplierInvoice(invoice)),
    []
  );

  const onCreateInvoice = otherParty => {
    reduxDispatch(createSupplierInvoice(otherParty, currentUser));
    onCloseModal();
  };

  const getAction = useCallback((colKey, propName) => {
    switch (colKey) {
      case 'remove':
        if (propName === 'onCheckAction') return PageActions.selectRow;
        return PageActions.deselectRow;
      default:
        return null;
    }
  }, []);

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.SELECT_EXTERNAL_SUPPLIER:
        return onCreateInvoice;
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
          dispatch={dispatch}
          getAction={getAction}
          rowIndex={index}
          onPress={onNavigateToInvoice}
        />
      );
    },
    [data, dataState]
  );

  const renderHeader = useCallback(
    () => (
      <DataTableHeaderRow
        columns={columns}
        dispatch={instantDebouncedDispatch}
        sortAction={PageActions.sortData}
        isAscending={isAscending}
        sortKey={sortKey}
      />
    ),
    [sortKey, isAscending]
  );

  const toggles = useMemo(
    () => [
      { text: buttonStrings.current, onPress: onToggleShowFinalised, isOn: !showFinalised },
      { text: buttonStrings.past, onPress: onToggleShowFinalised, isOn: showFinalised },
    ],
    [showFinalised]
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
          <ToggleBar toggles={toggles} />
          <SearchBar onChangeText={onFilterData} value={searchTerm} />
        </View>
        <View style={pageTopRightSectionContainer}>
          <PageButton text={buttonStrings.new_invoice} onPress={onNewInvoice} />
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
        isOpen={hasSelection}
        questionText={modalStrings.delete_these_invoices}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
        confirmText={modalStrings.delete}
      />
      <DataTablePageModal
        fullScreen={false}
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={onCloseModal}
        onSelect={getModalOnSelect()}
        dispatch={dispatch}
      />
    </DataTablePageView>
  );
};

export default SupplierInvoicesPage;

/* eslint-disable react/forbid-prop-types */
SupplierInvoicesPage.propTypes = {
  currentUser: PropTypes.object.isRequired,
  routeName: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
