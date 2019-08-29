/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { modalStrings } from '../localization';

/**
 * Check whether a given customer invoice is safe to be finalised. If safe to finalise,
 * return null, else return an appropriate error message.
 *
 * @param   {object}  customerInvoice  The customer invoice to check.
 * @return  {string}                   Error message if unsafe to finalise, else null.
 */
export function checkForCustomerInvoiceError(customerInvoice) {
  if (customerInvoice.items.length === 0) {
    return modalStrings.add_at_least_one_item_before_finalising;
  }

  if (customerInvoice.totalQuantity === 0) {
    return modalStrings.record_stock_to_issue_before_finalising;
  }
  return null;
}

/**
 * Check whether a given transaction is safe to be finalised. If safe to finalise,
 * return null, else return an appropriate error message.
 *
 * @param   {object}  transaction  The transaction to check.
 * @return  {string}               Error message if unsafe to finalise, else null.
 */
export function checkForSupplierInvoiceError(transaction) {
  if (!transaction.isExternalSupplierInvoice) return null;
  if (transaction.items.length === 0) {
    return modalStrings.add_at_least_one_item_before_finalising;
  }
  if (transaction.totalQuantity === 0) {
    return modalStrings.stock_quantity_greater_then_zero;
  }

  return null;
}
