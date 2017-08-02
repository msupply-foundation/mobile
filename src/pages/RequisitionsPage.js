/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */


import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { createRecord } from '../database';
import { BottomConfirmModal, PageButton } from '../widgets';
import globalStyles from '../globalStyles';
import { GenericPage } from './GenericPage';
import { formatStatus, sortDataBy } from '../utilities';
import { buttonStrings, modalStrings, navStrings, tableStrings } from '../localization';

const DATA_TYPES_SYNCHRONISED = ['Requisition'];

/**
* Renders the page for displaying Requisitions.
* @prop   {Realm}               database      App wide database.
* @prop   {func}                navigateTo    CallBack for navigation stack.
* @prop   {Realm.Object}        currentUser   User object representing the current user logged in.
* @state  {Realm.Results}       requisitions  Results object containing all Requisition records.
*/
export class RequisitionsPage extends GenericPage {
  constructor(props) {
    super(props);
    this.state.requisitions = props.database.objects('Requisition');
    this.state.sortBy = 'entryDate';
    this.state.isAscending = false;
    this.state.columns = [
      {
        key: 'serialNumber',
        width: 2,
        title: tableStrings.requisition_number,
        sortable: true,
      },
      {
        key: 'entryDate',
        width: 1,
        title: tableStrings.entered_date,
        sortable: true,
      },
      {
        key: 'numberOfItems',
        width: 1,
        title: tableStrings.items,
        sortable: true,
        alignText: 'right',
      },
      {
        key: 'status',
        width: 1,
        title: tableStrings.status,
        sortable: true,
      },
      {
        key: 'delete',
        width: 1,
        title: tableStrings.delete,
        alignText: 'center',
      },
    ];
    this.dataTypesSynchronised = DATA_TYPES_SYNCHRONISED;
    this.getFilteredSortedData = this.getFilteredSortedData.bind(this);
    this.onNewRequisition = this.onNewRequisition.bind(this);
    this.onRowPress = this.onRowPress.bind(this);
    this.renderCell = this.renderCell.bind(this);
    this.navigateToRequisition = this.navigateToRequisition.bind(this);
  }

  onDeleteConfirm() {
    const { selection, requisitions } = this.state;
    const { database } = this.props;
    database.write(() => {
      const requisitionsToDelete = [];
      for (let i = 0; i < selection.length; i++) {
        const requisition = requisitions.find(currentRequisition =>
                                                currentRequisition.id === selection[i]);
        if (requisition.isValid() && !requisition.isFinalised) {
          requisitionsToDelete.push(requisition);
        }
      }
      database.delete('Requisition', requisitionsToDelete);
    });
    this.setState({ selection: [] });
    this.refreshData();
  }

  onDeleteCancel() {
    this.setState({ selection: [] });
    this.refreshData();
  }

  onNewRequisition() {
    let requisition;
    this.props.database.write(() => {
      requisition = createRecord(this.props.database, 'Requisition', this.props.currentUser);
    });
    this.navigateToRequisition(requisition);
  }

  onRowPress(requisition) {
    this.navigateToRequisition(requisition);
  }

  navigateToRequisition(requisition) {
    this.setState({ selection: [] }); // Clear any requsitions selected for delete
    this.props.navigateTo(
      'requisition',
      `${navStrings.requisition} ${requisition.serialNumber}`,
      { requisition: requisition },
    );
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getFilteredSortedData(searchTerm, sortBy, isAscending) {
    const data = this.state.requisitions.filtered('serialNumber BEGINSWITH $0', searchTerm);
    let sortDataType;
    switch (sortBy) {
      case 'serialNumber':
      case 'numberOfItems':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    return sortDataBy(data, sortBy, sortDataType, isAscending);
  }

  renderCell(key, requisition) {
    switch (key) {
      default:
      case 'serialNumber':
        return requisition.serialNumber;
      case 'entryDate':
        return requisition.entryDate.toDateString();
      case 'numberOfItems':
        return requisition.numberOfItems;
      case 'status':
        return formatStatus(requisition.status);
      case 'delete':
        return {
          type: 'checkable',
          icon: 'md-remove-circle',
          isDisabled: requisition.isFinalised,
        };
    }
  }

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            <View style={globalStyles.pageTopLeftSectionContainer}>
              {this.renderSearchBar()}
            </View>
            <View style={globalStyles.pageTopRightSectionContainer}>
              <PageButton
                text={buttonStrings.new_requisition}
                onPress={this.onNewRequisition}
              />
            </View>
          </View>
          {this.renderDataTable()}
          <BottomConfirmModal
            isOpen={this.state.selection.length > 0}
            questionText={modalStrings.delete_these_requisitions}
            onCancel={() => this.onDeleteCancel()}
            onConfirm={() => this.onDeleteConfirm()}
            confirmText={modalStrings.delete}
          />
        </View>
      </View>
    );
  }
}

RequisitionsPage.propTypes = {
  database: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  navigateTo: PropTypes.func.isRequired,
};
