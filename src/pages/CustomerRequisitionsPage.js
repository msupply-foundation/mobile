/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { PageButton, SearchBar, DataTablePageView, ToggleBar } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import { useNavigationFocus, useSyncListener, useDebounce } from '../hooks';
import { createCustomerRequisition, gotoCustomerRequisition } from '../navigation/actions';
import { getItemLayout, getPageDispatchers, PageActions } from './dataTableUtilities';

import globalStyles from '../globalStyles';
import { buttonStrings, generalStrings, modalStrings } from '../localization';

import { ROUTES } from '../navigation/constants';
import { MODAL_KEYS } from '../utilities';
import { DataTablePageModal } from '../widgets/modals';
import { selectCurrentUser } from '../selectors/user';
import { BottomConfirmModal } from '../widgets/bottomModals/index';
import { useLoadingIndicator } from '../hooks/useLoadingIndicator';

/**
 * Renders a mSupply mobile page with a list of Customer requisitions.
 *
 * State:
 * Uses a reducer to manage state with `backingData` being a realm results
 * of items to display. `data` is a plain JS array of realm objects. data is
 * hydrated from `backingData` to display in the interface.
 * i.e: When filtering, data is populated from filtered items of `backingData`.
 *
 * dataState is a simple map of objects corresponding to a row being displayed,
 * holding the state of a given row. Each object has the shape :
 * { isSelected, isFocused },
 */
export const CustomerRequisitions = ({
  dispatch,
  navigation,
  data,
  sortKey,
  isAscending,
  searchTerm,
  columns,
  keyExtractor,
  showFinalised,
  refreshData,
  onFilterData,
  toggleFinalised,
  onSortColumn,
  onNewRequisition,
  modalKey,
  onCloseModal,
  currentUser,
  onCheck,
  onUncheck,
  hasSelection,
  onDeselectAll,
  onDeleteRecords,
  dataState,
}) => {
  // Custom hook to refresh data on this page when becoming the head of the stack again.
  useNavigationFocus(navigation, refreshData);
  useSyncListener(refreshData, 'Requisition');
  const toggleCurrentAndPast = useDebounce(toggleFinalised, 250, true);
  const runWithLoadingIndicator = useLoadingIndicator();

  const getCallback = useCallback((colKey, propName) => {
    switch (colKey) {
      case 'remove':
        if (propName === 'onCheck') return onCheck;
        return onUncheck;
      default:
        return null;
    }
  }, []);

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.PROGRAM_CUSTOMER_REQUISITION:
        return params => {
          onCloseModal();
          runWithLoadingIndicator(() =>
            dispatch(createCustomerRequisition({ ...params, currentUser }))
          );
        };

      default:
        return null;
    }
  };

  const onPressRow = useCallback(rowData => dispatch(gotoCustomerRequisition(rowData)), []);

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = keyExtractor(item);
      return (
        <DataTableRow
          rowState={dataState.get(rowKey)}
          rowData={data[index]}
          rowKey={rowKey}
          columns={columns}
          onPress={onPressRow}
          rowIndex={index}
          getCallback={getCallback}
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
    [sortKey, isAscending]
  );

  const PastCurrentToggleBar = useCallback(
    () => (
      <ToggleBar
        toggles={[
          { text: buttonStrings.current, onPress: toggleCurrentAndPast, isOn: !showFinalised },
          { text: buttonStrings.past, onPress: toggleCurrentAndPast, isOn: showFinalised },
        ]}
      />
    ),
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
          <PastCurrentToggleBar />
          <SearchBar
            onChangeText={onFilterData}
            value={searchTerm}
            placeholder={`${generalStrings.search_by} ${generalStrings.requisition_number} ${generalStrings.or} ${generalStrings.customer}`}
          />
        </View>
        <View style={pageTopRightSectionContainer}>
          <PageButton text={buttonStrings.new_requisition} onPress={onNewRequisition} />
        </View>
      </View>
      <DataTable
        data={data}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
      />

      <BottomConfirmModal
        isOpen={hasSelection}
        questionText={modalStrings.delete_these_requisitions}
        onCancel={onDeselectAll}
        onConfirm={onDeleteRecords}
        confirmText={modalStrings.remove}
      />
      <DataTablePageModal
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={onCloseModal}
        onSelect={getModalOnSelect()}
        dispatch={dispatch}
      />
    </DataTablePageView>
  );
};

const mapDispatchToProps = dispatch => ({
  ...getPageDispatchers(dispatch, 'Requisition', ROUTES.CUSTOMER_REQUISITIONS),
  onFilterData: value =>
    dispatch(PageActions.filterDataWithFinalisedToggle(value, ROUTES.CUSTOMER_REQUISITIONS)),
  refreshData: () =>
    dispatch(PageActions.refreshDataWithFinalisedToggle(ROUTES.CUSTOMER_REQUISITIONS)),
  onNewRequisition: () =>
    dispatch(
      PageActions.openModal(MODAL_KEYS.PROGRAM_CUSTOMER_REQUISITION, ROUTES.CUSTOMER_REQUISITIONS)
    ),
});

const mapStateToProps = state => {
  const { pages } = state;
  const { customerRequisitions } = pages;
  const currentUser = selectCurrentUser(state);
  return { ...customerRequisitions, currentUser };
};

export const CustomerRequisitionsPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomerRequisitions);

CustomerRequisitions.defaultProps = {
  showFinalised: false,
};

CustomerRequisitions.propTypes = {
  dispatch: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  sortKey: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  showFinalised: PropTypes.bool,
  refreshData: PropTypes.func.isRequired,
  onFilterData: PropTypes.func.isRequired,
  toggleFinalised: PropTypes.func.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  onNewRequisition: PropTypes.func.isRequired,
  modalKey: PropTypes.string.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
  onCheck: PropTypes.func.isRequired,
  onUncheck: PropTypes.func.isRequired,
  hasSelection: PropTypes.bool.isRequired,
  onDeselectAll: PropTypes.func.isRequired,
  onDeleteRecords: PropTypes.func.isRequired,
  dataState: PropTypes.object.isRequired,
};
