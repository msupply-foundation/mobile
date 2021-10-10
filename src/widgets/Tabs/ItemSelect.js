/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ToastAndroid } from 'react-native';

import { TABS } from '../constants';

import { PageButton } from '../PageButton';
import { PrescriptionInfo } from '../PrescriptionInfo';
import { SimpleTable } from '../SimpleTable';
import { PrescriptionCart } from '../PrescriptionCart';
import { FlexRow } from '../FlexRow';
import { FlexColumn } from '../FlexColumn';
import { FlexView } from '../FlexView';

import { getColumns } from '../../pages/dataTableUtilities';

import {
  selectHasItemsAndQuantity,
  selectItemSearchTerm,
  selectSelectedRows,
} from '../../selectors/prescription';

import { WizardActions } from '../../actions/WizardActions';
import { PrescriptionActions } from '../../actions/PrescriptionActions';
import { SearchBar } from '../SearchBar';

import { dispensingStrings, generalStrings } from '../../localization';
import globalStyles from '../../globalStyles';
import { PageButtonWithOnePress } from '../PageButtonWithOnePress';

const { pageTopViewContainer } = globalStyles;

/**
 * Layout component used for a tab within the prescription wizard.
 *
 * @prop {Func}   chooseItem     Callback for selecting an item.
 * @prop {Func}   nextTab        Callback for transitioning to the next step.
 * @prop {Bool}   canProceed     Indicator whether this step is complete.
 * @prop {Bool}   isComplete     Indicator whether the prescription is complete.
 * @prop {String} itemSearchTerm String used for filtering items.
 * @prop {Func}   filterItems    Callback for filtering items.
 * @prop {Array}  items          Array of sorted and filtered items to choose from.
 * @prop {Object} selectedRows   Object of itemID:bool key value pairs, indicating if selected.
 * @prop {Func}   onDelete       Callback for removing a row from the prescription.
 */
const ItemSelectComponent = ({
  chooseItem,
  nextTab,
  canProceed,
  isComplete,
  itemSearchTerm,
  filterItems,
  items,
  selectedRows,
  onDelete,
}) => {
  const columns = React.useMemo(() => getColumns(TABS.ITEM), []);
  const showToast = React.useCallback(
    () => ToastAndroid.show(dispensingStrings.must_order_one_to_continue, ToastAndroid.LONG),
    []
  );

  // Reload items when component is mounted (component is mounted on every DB action)
  useEffect(() => {
    PrescriptionActions.reloadItems();
  }, []);

  // sort and filter the items
  const displayItems = React.useMemo(() => {
    const lowerCaseSearchTerm = itemSearchTerm.toLocaleLowerCase();
    // Filter the items by the entered search term.
    const filteredItems = items.filter(
      it =>
        it.name.toLocaleLowerCase().includes(lowerCaseSearchTerm) ||
        it.code.toLocaleLowerCase().includes(lowerCaseSearchTerm)
    );

    // Keep the items sorted alphabetically.
    const sortedItems = filteredItems.sort((a, b) => a.name.localeCompare(b.name));

    // Split the items by quantity - showing out-of-stock items at the end of the list.
    const itemsWithStock = sortedItems.filter(it => it.totalQuantity > 0);
    const itemsWithoutStock = sortedItems.filter(it => it.totalQuantity === 0);

    return [...itemsWithStock, ...itemsWithoutStock];
  }, [itemSearchTerm, items]);

  return (
    <FlexView style={pageTopViewContainer}>
      <PrescriptionInfo />
      <FlexRow flex={1}>
        <FlexView flex={10}>
          <SearchBar
            onChangeText={filterItems}
            value={itemSearchTerm}
            placeholder={`${generalStrings.search_by} ${generalStrings.item_name}`}
          />
          <SimpleTable
            data={displayItems}
            columns={columns}
            selectedRows={selectedRows}
            selectRow={chooseItem}
            isDisabled={isComplete}
            style={{ marginTop: 3 }}
          />
        </FlexView>
        <FlexColumn flex={15}>
          <PrescriptionCart isDisabled={isComplete} />

          <FlexRow justifyContent="flex-end">
            <PageButtonWithOnePress text="Cancel" onPress={onDelete} style={{ marginRight: 7 }} />
            <PageButton
              debounceTimer={1000}
              text="Next"
              onPress={canProceed ? nextTab : showToast}
            />
          </FlexRow>
        </FlexColumn>
      </FlexRow>
    </FlexView>
  );
};

const mapDispatchToProps = dispatch => {
  const chooseItem = item => dispatch(PrescriptionActions.addItem(item.id));
  const nextTab = () => dispatch(WizardActions.nextTab());
  const updateQuantity = (id, quantity) => dispatch(PrescriptionActions.editQuantity(id, quantity));
  const filterItems = searchTerm => dispatch(PrescriptionActions.filter(searchTerm));
  const onDelete = () => dispatch(PrescriptionActions.cancelPrescription());
  return { onDelete, filterItems, nextTab, chooseItem, updateQuantity };
};

const mapStateToProps = state => {
  const { wizard } = state;
  const { isComplete } = wizard;
  const itemSearchTerm = selectItemSearchTerm(state);
  const { prescription } = state;
  const selectedRows = selectSelectedRows(state);
  const canProceed = selectHasItemsAndQuantity(state);

  return { selectedRows, itemSearchTerm, items: prescription.items, canProceed, isComplete };
};

ItemSelectComponent.propTypes = {
  chooseItem: PropTypes.func.isRequired,
  nextTab: PropTypes.func.isRequired,
  canProceed: PropTypes.bool.isRequired,
  isComplete: PropTypes.bool.isRequired,
  itemSearchTerm: PropTypes.string.isRequired,
  filterItems: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  selectedRows: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export const ItemSelect = connect(mapStateToProps, mapDispatchToProps)(ItemSelectComponent);
