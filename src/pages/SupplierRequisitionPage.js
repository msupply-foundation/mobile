/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { View, ToastAndroid } from 'react-native';
import { connect } from 'react-redux';

import { MODAL_KEYS } from '../utilities';
import { DataTablePageModal } from '../widgets/modals';
import { BottomConfirmModal } from '../widgets/bottomModals';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';
import { DATA_TABLE_DEFAULTS } from '../widgets/DataTable/constants';
import {
  DataTablePageView,
  DropDown,
  PageButton,
  PageInfo,
  ToggleBar,
  SearchBar,
} from '../widgets';

import {
  selectIndicatorCodes,
  selectCurrentIndicatorCode,
  selectIndicatorTableColumns,
  selectIndicatorTableRows,
} from '../selectors/indicators';

import { getItemLayout, getPageDispatchers, PageActions } from './dataTableUtilities';

import { ROUTES } from '../navigation/constants';

import globalStyles from '../globalStyles';
import { buttonStrings, modalStrings, programStrings, generalStrings } from '../localization';
import { UIDatabase } from '../database';
import { SETTINGS_KEYS } from '../settings';
import { useLoadingIndicator } from '../hooks/useLoadingIndicator';

/**
 * Renders a mSupply mobile page with a supplier requisition loaded for editing
 *
 * State:
 * Uses a reducer to manage state with `backingData` being a realm results
 * of items to display. `data` is a plain JS array of realm objects. data is
 * hydrated from the `backingData` for displaying in the interface.
 * i.e: When filtering, data is populated from filtered items of `backingData`.
 *
 * dataState is a simple map of objects corresponding to a row being displayed,
 * holding the state of a given row. Each object has the shape :
 * { isSelected, isDisabled },
 */
const SupplierRequisition = ({
  dispatch,
  data,
  dataState,
  sortKey,
  modalValue,
  isAscending,
  modalKey,
  pageObject,
  hasSelection,
  showAll,
  usingIndicators,
  showIndicators,
  currentIndicatorCode,
  indicatorCodes,
  keyExtractor,
  searchTerm,
  columns,
  getPageInfoColumns,
  onSelectNewItem,
  onEditComment,
  onFilterData,
  onDeleteItems,
  onDeselectAll,
  onCloseModal,
  onCheck,
  onUncheck,
  onSortColumn,
  onToggleIndicators,
  onSelectIndicator,
  onEditIndicatorValue,
  onShowOverStocked,
  onHideOverStocked,
  onEditMonth,
  onEditRequiredQuantity,
  onAddRequisitionItem,
  onSetRequestedToSuggested,
  onAddMasterList,
  onApplyMasterLists,
  onEditRequiredQuantityWithReason,
  onEditRequisitionReason,
  onApplyReason,
  route,
}) => {
  const runWithLoadingIndicator = useLoadingIndicator();

  const usingReasons = !!UIDatabase.objects('RequisitionReason').length;
  const onAddMasterLists = React.useCallback(selected => onApplyMasterLists(pageObject, selected), [
    pageObject,
  ]);

  const { isFinalised, comment, theirRef, program, daysToSupply } = pageObject;

  const createAutomaticOrder = () => dispatch(PageActions.createAutomaticOrder(route));
  const onCreateAutomaticOrder = () => runWithLoadingIndicator(createAutomaticOrder);

  const pageInfoColumns = useMemo(() => getPageInfoColumns(pageObject, dispatch, route), [
    comment,
    theirRef,
    isFinalised,
    daysToSupply,
  ]);

  const getCallback = (colKey, propName) => {
    switch (colKey) {
      case 'requiredQuantity':
        return usingReasons ? onEditRequiredQuantityWithReason : onEditRequiredQuantity;
      case 'remove':
        if (propName === 'onCheck') return onCheck;
        return onUncheck;
      case 'reasonTitle':
        return onEditRequisitionReason;
      default:
        // Indicators functionality generates columns at run-time from indicator attribute
        // data. If known column key not found, assume column is a dynamic indicators column.
        return onEditIndicatorValue;
    }
  };

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.SELECT_ITEM:
        return onAddRequisitionItem;
      case MODAL_KEYS.SELECT_MONTH:
        return onEditMonth;
      case MODAL_KEYS.REQUISITION_COMMENT_EDIT:
        return onEditComment;
      case MODAL_KEYS.SELECT_MASTER_LISTS:
        return onAddMasterLists;
      case MODAL_KEYS.ENFORCE_REQUISITION_REASON:
      case MODAL_KEYS.REQUISITION_REASON:
        return onApplyReason;
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
    [columns, data, dataState]
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

  const AddMasterListItemsButton = () => (
    <PageButton
      style={globalStyles.leftButton}
      text={buttonStrings.add_master_list_items}
      onPress={onAddMasterList}
      isDisabled={isFinalised}
    />
  );

  const AddNewItemButton = () => (
    <PageButton
      style={globalStyles.topButton}
      text={buttonStrings.new_item}
      onPress={onSelectNewItem}
      isDisabled={isFinalised}
    />
  );

  const CreateAutomaticOrderButton = () => (
    <PageButton
      style={{ ...globalStyles.leftButton, marginLeft: 5 }}
      text={buttonStrings.create_automatic_order}
      onPress={onCreateAutomaticOrder}
      isDisabled={isFinalised}
    />
  );

  const UseSuggestedQuantitiesButton = () => (
    <PageButton
      style={program ? globalStyles.wideButton : globalStyles.topButton}
      text={buttonStrings.use_suggested_quantities}
      onPress={onSetRequestedToSuggested}
      isDisabled={isFinalised}
    />
  );

  const ItemIndicatorToggles = useMemo(
    () => [
      {
        text: programStrings.items,
        isOn: !showIndicators,
        onPress: onToggleIndicators,
      },
      {
        text: programStrings.indicators,
        isOn: showIndicators,
        onPress: onToggleIndicators,
      },
    ],
    [showIndicators]
  );

  const ThresholdMOSToggles = useMemo(
    () => [
      {
        text: programStrings.hide_over_stocked,
        isOn: !showAll,
        onPress: onHideOverStocked,
      },
      {
        text: programStrings.show_over_stocked,
        isOn: showAll,
        onPress: onShowOverStocked,
      },
    ],
    [showAll]
  );

  const ItemIndicatorToggle = () => <ToggleBar toggles={ItemIndicatorToggles} />;

  const ThresholdMOSToggle = () => <ToggleBar toggles={ThresholdMOSToggles} />;

  const GeneralButtons = useCallback(() => {
    const { verticalContainer } = globalStyles;
    return (
      <>
        <View style={verticalContainer}>
          <UseSuggestedQuantitiesButton />
          <CreateAutomaticOrderButton />
        </View>
        <View style={verticalContainer}>
          <AddNewItemButton />
          <AddMasterListItemsButton />
        </View>
      </>
    );
  }, [isFinalised]);

  const ProgramItemButtons = useCallback(
    () => (
      <View style={globalStyles.verticalContainer}>
        <UseSuggestedQuantitiesButton />
        <ThresholdMOSToggle />
      </View>
    ),
    [UseSuggestedQuantitiesButton, ThresholdMOSToggle]
  );

  const ProgramIndicatorButtons = useCallback(
    () => (
      <>
        <DropDown
          values={indicatorCodes}
          selectedValue={currentIndicatorCode}
          onValueChange={onSelectIndicator}
          style={globalStyles.pickerTall}
        />
      </>
    ),
    [indicatorCodes, currentIndicatorCode]
  );

  const ProgramButtons = useCallback(() => {
    if (usingIndicators) {
      const Buttons = showIndicators ? ProgramIndicatorButtons : ProgramItemButtons;
      return (
        <View style={globalStyles.verticalContainer}>
          <ItemIndicatorToggle />
          <Buttons />
        </View>
      );
    }
    return <ProgramItemButtons />;
  }, [usingIndicators, showIndicators, showAll, indicatorCodes, currentIndicatorCode, isFinalised]);

  const placeholderStrings = useMemo(
    () => ({
      name: showIndicators ? generalStrings.indicator_name : generalStrings.item_name,
      code: showIndicators ? generalStrings.indicator_code : generalStrings.item_code,
    }),
    [showIndicators]
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
          <PageInfo columns={pageInfoColumns} isEditingDisabled={isFinalised} />
          <SearchBar
            onChangeText={onFilterData}
            value={searchTerm}
            placeholder={`${generalStrings.search_by} ${placeholderStrings.name} ${generalStrings.or} ${placeholderStrings.code}`}
          />
        </View>
        <View style={pageTopRightSectionContainer}>
          {program ? <ProgramButtons /> : <GeneralButtons />}
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
        windowSize={
          showIndicators
            ? DATA_TABLE_DEFAULTS.WINDOW_SIZE_SMALL
            : DATA_TABLE_DEFAULTS.WINDOW_SIZE_MEDIUM
        }
      />
      <BottomConfirmModal
        isOpen={hasSelection}
        questionText={modalStrings.remove_these_items}
        onCancel={onDeselectAll}
        onConfirm={onDeleteItems}
        confirmText={modalStrings.remove}
      />
      <DataTablePageModal
        fullScreen={false}
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

const mapDispatchToProps = dispatch => {
  const thisStoreID = UIDatabase.getSetting(SETTINGS_KEYS.THIS_STORE_NAME_ID);
  const thisStore = UIDatabase.get('Name', thisStoreID);
  const hasMasterLists = thisStore?.masterLists?.length > 0;

  const noMasterLists = () =>
    ToastAndroid.show(modalStrings.supplier_no_masterlist_available, ToastAndroid.LONG);

  return {
    ...getPageDispatchers(dispatch, 'Requisition', ROUTES.SUPPLIER_REQUISITION),
    [hasMasterLists ? null : 'onAddMasterList']: noMasterLists,
  };
};

const mapStateToProps = state => {
  const { pages = {} } = state;
  const { supplierRequisition = {} } = pages;
  const { usingIndicators = false, showIndicators = false } = supplierRequisition;

  if (usingIndicators && showIndicators) {
    return {
      ...supplierRequisition,
      indicatorCodes: selectIndicatorCodes(supplierRequisition),
      currentIndicatorCode: selectCurrentIndicatorCode(supplierRequisition),
      data: selectIndicatorTableRows(supplierRequisition),
      columns: selectIndicatorTableColumns(supplierRequisition),
    };
  }
  return supplierRequisition;
};

export const SupplierRequisitionPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(SupplierRequisition);

SupplierRequisition.defaultProps = {
  modalValue: null,
  showAll: false,
  usingIndicators: false,
  showIndicators: false,
  indicatorCodes: [],
  currentIndicatorCode: '',
};

SupplierRequisition.propTypes = {
  dispatch: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  sortKey: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  keyExtractor: PropTypes.func.isRequired,
  dataState: PropTypes.object.isRequired,
  modalKey: PropTypes.string.isRequired,
  pageObject: PropTypes.object.isRequired,
  getPageInfoColumns: PropTypes.func.isRequired,
  hasSelection: PropTypes.bool.isRequired,
  showAll: PropTypes.bool,
  usingIndicators: PropTypes.bool,
  showIndicators: PropTypes.bool,
  currentIndicatorCode: PropTypes.string,
  indicatorCodes: PropTypes.array,
  modalValue: PropTypes.any,
  onSelectNewItem: PropTypes.func.isRequired,
  onEditComment: PropTypes.func.isRequired,
  onFilterData: PropTypes.func.isRequired,
  onDeleteItems: PropTypes.func.isRequired,
  onDeselectAll: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  onCheck: PropTypes.func.isRequired,
  onUncheck: PropTypes.func.isRequired,
  onSortColumn: PropTypes.func.isRequired,
  onToggleIndicators: PropTypes.func.isRequired,
  onShowOverStocked: PropTypes.func.isRequired,
  onHideOverStocked: PropTypes.func.isRequired,
  onSelectIndicator: PropTypes.func.isRequired,
  onEditIndicatorValue: PropTypes.func.isRequired,
  onEditMonth: PropTypes.func.isRequired,
  onEditRequiredQuantity: PropTypes.func.isRequired,
  onAddRequisitionItem: PropTypes.func.isRequired,
  onSetRequestedToSuggested: PropTypes.func.isRequired,
  onAddMasterList: PropTypes.func.isRequired,
  onApplyMasterLists: PropTypes.func.isRequired,
  route: PropTypes.string.isRequired,
  onEditRequiredQuantityWithReason: PropTypes.func.isRequired,
  onEditRequisitionReason: PropTypes.func.isRequired,
  onApplyReason: PropTypes.func.isRequired,
};
