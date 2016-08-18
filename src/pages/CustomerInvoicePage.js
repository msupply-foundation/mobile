/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  View,
} from 'react-native';

import { GenericTablePage } from './GenericTablePage';
import globalStyles from '../globalStyles';
import { formatDate, parsePositiveInteger, sortDataBy } from '../utilities';
import { createRecord } from '../database';
import { buttonStrings, modalStrings, pageInfoStrings, tableStrings } from '../localization';
import {
  AutocompleteSelector,
  BottomConfirmModal,
  PageButton,
  PageContentModal,
  PageInfo,
  TextEditor,
} from '../widgets';

const DATA_TYPES_SYNCHRONISED = ['TransactionItem', 'TransactionBatch', 'Item', 'ItemBatch'];
const MODAL_KEYS = {
  COMMENT_EDIT: 'commentEdit',
  THEIR_REF_EDIT: 'theirRefEdit',
  ITEM_SELECT: 'itemSelect',
};

export class CustomerInvoicePage extends GenericTablePage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'itemName';
    this.columns = COLUMNS;
    this.dataTypesSynchronised = DATA_TYPES_SYNCHRONISED;
    this.finalisableDataType = 'Transaction';
    this.getUpdatedData = this.getUpdatedData.bind(this);
    this.onAddMasterItems = this.onAddMasterItems.bind(this);
    this.onEndEditing = this.onEndEditing.bind(this);
    this.onDatabaseEvent = this.onDatabaseEvent.bind(this);
    this.openItemSelector = this.openItemSelector.bind(this);
    this.openCommentEditor = this.openCommentEditor.bind(this);
    this.openTheirRefEditor = this.openTheirRefEditor.bind(this);
    this.getModalTitle = this.getModalTitle.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.renderPageInfo = this.renderPageInfo.bind(this);
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getUpdatedData(searchTerm, sortBy, isAscending) {
    const data = this.props.transaction.items
                .filtered('item.name BEGINSWITH[c] $0 OR item.code BEGINSWITH[c] $0', searchTerm);
    let sortDataType;
    switch (sortBy) {
      case 'itemCode':
      case 'itemName':
        sortDataType = 'string';
        break;
      case 'availableQuantity':
      case 'totalQuantity':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    return sortDataBy(data, sortBy, sortDataType, isAscending);
  }

  onAddMasterItems() {
    this.props.database.write(() => {
      this.props.transaction.addItemsFromMasterList(this.props.database);
      this.props.database.save('Transaction', this.props.transaction);
    });
    this.refreshData();
  }

  /**
   * Respond to the user editing the number in the number received column
   * @param  {string} key             Should always be 'totalQuantity'
   * @param  {object} transactionItem The transaction item from the row being edited
   * @param  {string} newValue        The value the user entered in the cell
   * @return {none}
   */
  onEndEditing(key, transactionItem, newValue) {
    if (key !== 'totalQuantity') return;
    this.props.database.write(() => {
      const quantity = Math.min(parsePositiveInteger(newValue), transactionItem.availableQuantity);
      transactionItem.setTotalQuantity(this.props.database, quantity);
      this.props.database.save('TransactionItem', transactionItem);
    });
  }

  onDeleteConfirm() {
    const { selection } = this.state;
    const { transaction, database } = this.props;
    database.write(() => {
      transaction.removeItemsById(database, selection);
      database.save('Transaction', transaction);
    });
    this.setState({ selection: [] });
    this.refreshData();
  }

  onDeleteCancel() {
    this.setState({ selection: [] });
    this.refreshData();
  }

  openItemSelector() {
    this.openModal(MODAL_KEYS.ITEM_SELECT);
  }

  openCommentEditor() {
    this.openModal(MODAL_KEYS.COMMENT_EDIT);
  }

  openTheirRefEditor() {
    this.openModal(MODAL_KEYS.THEIR_REF_EDIT);
  }

  getModalTitle() {
    const { ITEM_SELECT, COMMENT_EDIT, THEIR_REF_EDIT } = MODAL_KEYS;
    switch (this.state.modalKey) {
      default:
      case ITEM_SELECT:
        return modalStrings.search_for_an_item_to_add;
      case COMMENT_EDIT:
        return modalStrings.edit_the_invoice_comment;
      case THEIR_REF_EDIT:
        return modalStrings.edit_their_reference;
    }
  }

  renderPageInfo() {
    const infoColumns = [
      [
        {
          title: `${pageInfoStrings.entry_date}:`,
          info: formatDate(this.props.transaction.entryDate),
        },
        {
          title: `${pageInfoStrings.confirm_date}:`,
          info: formatDate(this.props.transaction.confirmDate),
        },
        {
          title: `${pageInfoStrings.entered_by}:`,
          info: this.props.transaction.enteredBy && this.props.transaction.enteredBy.username,
        },
      ],
      [
        {
          title: `${pageInfoStrings.customer}:`,
          info: this.props.transaction.otherParty && this.props.transaction.otherParty.name,
        },
        {
          title: `${pageInfoStrings.their_ref}:`,
          info: this.props.transaction.theirRef,
          onPress: this.openTheirRefEditor,
          editableType: 'text',
        },
        {
          title: `${pageInfoStrings.comment}:`,
          info: this.props.transaction.comment,
          onPress: this.openCommentEditor,
          editableType: 'text',
        },
      ],
    ];
    return (
      <PageInfo
        columns={infoColumns}
        isEditingDisabled={this.props.transaction.isFinalised}
      />
    );
  }

  renderCell(key, transactionItem) {
    switch (key) {
      default:
        return transactionItem[key];
      case 'totalQuantity':
        return {
          type: this.props.transaction.isFinalised ? 'text' : 'editable',
          cellContents: transactionItem.totalQuantity,
        };
      case 'remove':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: this.props.transaction.isFinalised,
        };
    }
  }

  renderModalContent() {
    const { ITEM_SELECT, COMMENT_EDIT, THEIR_REF_EDIT } = MODAL_KEYS;
    const { database, transaction } = this.props;
    switch (this.state.modalKey) {
      default:
      case ITEM_SELECT:
        return (
          <AutocompleteSelector
            options={database.objects('Item')}
            queryString={'name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0'}
            sortByString={'name'}
            onSelect={(item) => {
              database.write(() => {
                if (!transaction.hasItemWithId(item.id)) {
                  createRecord(database, 'TransactionItem', transaction, item);
                }
              });
              this.refreshData();
              this.closeModal();
            }}
            renderLeftText={(item) => `${item.name}`}
            renderRightText={(item) => `${item.totalQuantity}`}
          />
        );
      case COMMENT_EDIT:
        return (
          <TextEditor
            text={transaction.comment}
            onEndEditing={(newComment) => {
              if (newComment !== transaction.comment) {
                database.write(() => {
                  transaction.comment = newComment;
                  database.save('Transaction', transaction);
                });
              }
              this.closeModal();
            }}
          />
        );
      case THEIR_REF_EDIT:
        return (
          <TextEditor
            text={transaction.theirRef}
            onEndEditing={(newTheirRef) => {
              if (newTheirRef !== transaction.theirRef) {
                database.write(() => {
                  transaction.theirRef = newTheirRef;
                  database.save('Transaction', transaction);
                });
              }
              this.closeModal();
            }}
          />
        );
    }
  }

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            <View style={globalStyles.pageTopLeftSectionContainer}>
              {this.renderPageInfo()}
              {this.renderSearchBar()}
            </View>
            <View style={globalStyles.verticalContainer}>
              <PageButton
                style={globalStyles.topButton}
                text={buttonStrings.new_item}
                onPress={this.openItemSelector}
                isDisabled={this.props.transaction.isFinalised}
              />
              <PageButton
                text={buttonStrings.add_master_list_items}
                loadingText="Adding..."
                onPress={this.onAddMasterItems}
                isDisabled={this.props.transaction.isFinalised}
              />
            </View>
          </View>
          {this.renderDataTable()}
          <BottomConfirmModal
            isOpen={this.state.selection.length > 0 && !this.props.transaction.isFinalised}
            questionText={modalStrings.remove_these_items}
            onCancel={() => this.onDeleteCancel()}
            onConfirm={() => this.onDeleteConfirm()}
            confirmText={modalStrings.remove}
          />
          <PageContentModal
            isOpen={this.state.pageContentModalIsOpen && !this.props.transaction.isFinalised}
            onClose={this.closeModal}
            title={this.getModalTitle()}
          >
            {this.renderModalContent()}
          </PageContentModal>
        </View>
      </View>
    );
  }
}

CustomerInvoicePage.propTypes = {
  database: React.PropTypes.object,
  transaction: React.PropTypes.object,
};

const COLUMNS = [
  {
    key: 'itemCode',
    width: 2,
    title: tableStrings.item_code,
    sortable: true,
  },
  {
    key: 'itemName',
    width: 4,
    title: tableStrings.item_name,
    sortable: true,
  },
  {
    key: 'availableQuantity',
    width: 2,
    title: tableStrings.available_stock,
    sortable: true,
    alignText: 'right',
  },
  {
    key: 'totalQuantity',
    width: 2,
    title: tableStrings.quantity,
    sortable: true,
    alignText: 'right',
  },
  {
    key: 'remove',
    width: 1,
    title: tableStrings.remove,
    alignText: 'center',
  },
];

/**
 * Check whether a given customer invoice is safe to be finalised. Return null if it is,
 * otherwise return an appropriate error message if not.
 * @param  {object}  customerInvoice  The customer invoice to check
 * @return {string}  An error message if not able to be finalised
 */
export function checkForFinaliseError(customerInvoice) {
  if (customerInvoice.items.length === 0) {
    return modalStrings.add_at_least_one_item_before_finalising;
  } else if (customerInvoice.totalQuantity === 0) {
    return modalStrings.record_stock_to_issue_before_finalising;
  }
  return null;
}
