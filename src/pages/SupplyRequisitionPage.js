/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import { View } from 'react-native';

import { GenericPage } from './GenericPage';
import globalStyles from '../globalStyles';
import { formatDate, parsePositiveInteger, sortDataBy } from '../utilities';
import { buttonStrings, modalStrings, pageInfoStrings, tableStrings } from '../localization';
import {
  PageButton,
  PageInfo,
  PageContentModal,
  TextEditor,
} from '../widgets';

const DATA_TYPES_SYNCHRONISED = ['RequisitionItem', 'Item', 'ItemBatch'];
const MODAL_KEYS = {
  COMMENT_EDIT: 'commentEdit',
  ITEM_SELECT: 'itemSelect',
  MONTHS_SELECT: 'monthsSelect',
};

export class SupplyRequisitionPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalKey: null,
      modalIsOpen: false,
      selection: [],
    };
    this.dataFilters = {
      searchTerm: '',
      sortBy: 'itemName',
      isAscending: true,
    };
    autobind(this);
  }

  /**
   * Respond to the user editing the number in the required quantity column
   * @param  {string} key             Should always be 'requiredQuantity'
   * @param  {object} requisitionItem The requisition item from the row being edited
   * @param  {string} newValue        The value the user entered in the cell
   * @return {none}
   */
  onEndEditing(key, requisitionItem, newValue) {
    // This will update associated CustomerInvoice if one exists or if linked
    // CustomerInvoice does not exist, suppliedQuantity will not be updated
    if (key !== 'suppliedQuantity') return;
    const { database } = this.props;
    database.write(() => {
      const transactionItem = requisitionItem.linkedTransactionItem;
      if (!transactionItem) return;
      transactionItem.setTotalQuantity(database, parsePositiveInteger(newValue),
                                                 transactionItem.availableQuantity);
      requisitionItem.suppliedQuantity = transactionItem.totalQuantity;
      database.save('TransactionItem', transactionItem);
      database.save('RequisitionItem', requisitionItem);
    });
  }

  onUseSuggestedQuantities() {
    this.props.runWithLoadingIndicator(() => {
      const { database, requisition } = this.props;
      database.write(() => {
        requisition.setRequestedToSuggested(database);
        database.save('Requisition', requisition);
      });
      this.refreshData();
    });
  }

  onSelectionChange(newSelection) {
    this.setState({ selection: newSelection });
  }

  getModalTitle() {
    const { ITEM_SELECT, COMMENT_EDIT } = MODAL_KEYS;
    switch (this.state.modalKey) {
      default:
      case ITEM_SELECT:
        return modalStrings.search_for_an_item_to_add;
      case COMMENT_EDIT:
        return modalStrings.edit_the_requisition_comment;
    }
  }

  updateDataFilters(newSearchTerm, newSortBy, newIsAscending) {
    // We use != null, which checks for both null or undefined (undefined coerces to null)
    if (newSearchTerm != null) this.dataFilters.searchTerm = newSearchTerm;
    if (newSortBy != null) this.dataFilters.sortBy = newSortBy;
    if (newIsAscending != null) this.dataFilters.isAscending = newIsAscending;
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  refreshData(newSearchTerm, newSortBy, newIsAscending) {
    this.updateDataFilters(newSearchTerm, newSortBy, newIsAscending);
    const { searchTerm, sortBy, isAscending } = this.dataFilters;
    const data = this.props.requisition.items
                 .filtered('item.name BEGINSWITH[c] $0 OR item.code BEGINSWITH[c] $0', searchTerm);
    let sortDataType;
    switch (sortBy) {
      case 'itemCode':
      case 'itemName':
        sortDataType = 'string';
        break;
      case 'monthlyUsage':
      case 'suggestedQuantity':
      case 'requiredQuantity':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    this.setState({ data: sortDataBy(data, sortBy, sortDataType, isAscending) });
  }

  openModal(key) {
    this.setState({ modalKey: key, modalIsOpen: true });
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  openCommentEditor() {
    this.openModal(MODAL_KEYS.COMMENT_EDIT);
  }

  renderPageInfo() {
    const { requisition } = this.props;
    const infoColumns = [
      [
        {},
        {
          title: `${pageInfoStrings.entry_date}:`,
          info: formatDate(requisition.entryDate),
        },
        {
          title: `${pageInfoStrings.entered_by}:`,
          info: requisition.enteredByName,
        },
      ],
      [
        {
          title: `${pageInfoStrings.supplying_store_name}`,
          info: requisition.otherStoreName.name,
        },
        {
          title: `${pageInfoStrings.months_stock_required}:`,
          info: requisition.monthsToSupply,
        },
        {
          title: `${pageInfoStrings.comment}:`,
          info: requisition.comment,
          onPress: this.openCommentEditor,
          editableType: 'text',
        },
      ],
    ];
    return (
      <PageInfo
        columns={infoColumns}
        isEditingDisabled={requisition.isFinalised}
      />
    );
  }

  renderCell(key, requisitionItem) {
    const { requisition } = this.props;
    switch (key) {
      case 'monthlyUsage':
      case 'suggestedQuantity':
      case 'requiredQuantity':
      case 'ourStockOnHand':
        return Math.round(requisitionItem[key]);
      case 'suppliedQuantity':
        return {
          type: requisition.isFinalised ? 'text' : 'editable',
          cellContents: requisitionItem.suppliedQuantity || 0,
        };
      case 'remove':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: this.props.requisition.isFinalised,
        };
      default:
        return requisitionItem[key];
    }
  }

  renderModalContent() {
    const { COMMENT_EDIT } = MODAL_KEYS;
    switch (this.state.modalKey) {
      default:
      case COMMENT_EDIT:
        return (
          <TextEditor
            text={this.props.requisition.comment}
            onEndEditing={(newComment) => {
              if (newComment !== this.props.requisition.comment) {
                this.props.database.write(() => {
                  this.props.requisition.comment = newComment;
                  this.props.database.save('Requisition', this.props.requisition);
                });
              }
              this.closeModal();
            }}
          />);
    }
  }

  renderButton() {
    return (
      <View style={globalStyles.pageTopRightSectionContainer}>
        <View style={globalStyles.verticalContainer}>
          <PageButton
            style={globalStyles.topButton}
            text={buttonStrings.use_requested_quantities}
            onPress={this.onUseRequestedQuantity}
            isDisabled={this.props.requisition.isFinalised}
          />
        </View>
      </View>
    );
  }

  render() {
    return (
      <GenericPage
        data={this.state.data}
        refreshData={this.refreshData}
        renderCell={this.renderCell}
        renderTopLeftComponent={this.renderPageInfo}
        renderTopRightComponent={this.renderButton}
        onEndEditing={this.onEndEditing}
        onSelectionChange={this.onSelectionChange}
        defaultSortKey={this.dataFilters.sortBy}
        defaultSortDirection={this.dataFilters.isAscending ? 'ascending' : 'descending'}
        columns={[
          {
            key: 'itemCode',
            width: 1.5,
            title: tableStrings.code,
            sortable: true,
          },
          {
            key: 'itemName',
            width: 4,
            title: tableStrings.item_name,
            sortable: true,
          },
          {
            key: 'ourStockOnHand',
            width: 1.5,
            title: tableStrings.our_stock,
            sortable: true,
            alignText: 'right',
          },
          {
            key: 'stockOnHand',
            width: 1.5,
            title: tableStrings.their_stock,
            sortable: true,
            alignText: 'right',
          },
          {
            key: 'monthlyUsage',
            width: 2,
            title: tableStrings.monthly_usage,
            sortable: true,
            alignText: 'right',
          },
          {
            key: 'suggestedQuantity',
            width: 2,
            title: tableStrings.suggested_quantity,
            sortable: true,
            alignText: 'right',
          },
          {
            key: 'requiredQuantity',
            width: 2,
            title: tableStrings.required_quantity,
            sortable: true,
            alignText: 'right',
          },
          {
            key: 'suppliedQuantity',
            width: 2,
            title: tableStrings.supply_quantity,
            sortable: true,
            alignText: 'right',
          },
        ]}
        dataTypesSynchronised={DATA_TYPES_SYNCHRONISED}
        finalisableDataType={'Requisition'}
        database={this.props.database}
        selection={this.state.selection}
        {...this.props.genericTablePageStyles}
        topRoute={this.props.topRoute}
      >
        <PageContentModal
          isOpen={this.state.modalIsOpen && !this.props.requisition.isFinalised}
          onClose={this.closeModal}
          title={this.getModalTitle()}
        >
          {this.renderModalContent()}
        </PageContentModal>
      </GenericPage>
    );
  }
}

SupplyRequisitionPage.propTypes = {
  database: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  runWithLoadingIndicator: PropTypes.func.isRequired,
  requisition: PropTypes.object.isRequired,
};
