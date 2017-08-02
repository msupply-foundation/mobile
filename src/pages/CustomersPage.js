/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { GenericPage } from './GenericPage';
import { sortDataBy } from '../utilities';
import { tableStrings } from '../localization';

const DATA_TYPES_SYNCHRONISED = ['Name'];

/**
* Renders the page for displaying Customers.
* @prop   {Realm}               database      App wide database.
* @prop   {func}                navigateTo    CallBack for navigation stack.
* @state  {Realm.Results}       transactions  Filtered to have only supplier_invoice.
*/
export class CustomersPage extends GenericPage {
  constructor(props) {
    super(props);
    this.state.sortBy = 'name';
    this.state.customers = props.database.objects('Customer');
    this.state.columns = [
      {
        key: 'code',
        width: 1,
        title: tableStrings.code,
        sortable: true,
      },
      {
        key: 'name',
        width: 5,
        title: tableStrings.name,
        sortable: true,
      },
      {
        key: 'numberOfTransactions',
        width: 1,
        title: tableStrings.invoices,
        alignText: 'right',
        sortable: true,
      },
    ];
    this.dataTypesSynchronised = DATA_TYPES_SYNCHRONISED;
    this.getFilteredSortedData = this.getFilteredSortedData.bind(this);
    this.onRowPress = this.onRowPress.bind(this);
  }

  onRowPress(customer) {
    this.props.navigateTo(
      'customer',
      `${customer.name}`,
      { customer: customer },
    );
  }

  /**
   * Returns updated data according to searchTerm, sortBy and isAscending.
   */
  getFilteredSortedData(searchTerm, sortBy, isAscending) {
    const data = this.state.customers.filtered(
      'name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0',
      searchTerm
    );

    let sortDataType;
    switch (sortBy) {
      case 'numberOfTransactions':
        sortDataType = 'number';
        break;
      default:
        sortDataType = 'realm';
    }
    return sortDataBy(data, sortBy, sortDataType, isAscending);
  }

  renderCell(key, customer) {
    switch (key) {
      default:
      case 'code':
        return customer.code;
      case 'name':
        return customer.name;
      case 'numberOfTransactions':
        return customer.numberOfTransactions;
    }
  }
}

CustomersPage.propTypes = {
  database: PropTypes.object,
  navigateTo: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
};
