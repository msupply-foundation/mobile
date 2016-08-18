/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

// import { CURRENT_LANGUAGE } from '../settings';
const CURRENT_LANGUAGE = 'en'; // settings not set up for this yet

const strings = {
  en: {
    add_at_least_one_item_before_finalising: 'You need to add at least one item before finalising',
    and: 'and',
    cancel: 'Cancel',
    confirm: 'Confirm',
    create: 'Create',
    delete_these_invoices: 'Are you sure you want to delete these invoices?',
    delete_these_requisitions: 'Are you sure you want to delete these requisitions?',
    delete_these_stocktakes: 'Are you sure you want to delete these stocktakes?',
    delete: 'Delete',
    edit_the_invoice_comment: 'Edit the invoice comment',
    edit_the_requisition_comment: 'Edit the requisition comment',
    edit_their_reference: 'Edit their reference',
    finalise_customer_invoice: 'Finalise will lock this invoice permanently.',
    finalise_requisition: 'Finalise will send this requisition and lock it permanently.',
    finalise_stocktake: 'Finalise will adjust inventory and lock this stocktake permanently.',
    finalise_supplier_invoice: 'Finalise will adjust inventory and lock this invoice permanently.',
    following_items_reduced_more_than_available_stock: 'The following items have been reduced by more than the available stock:',
    give_your_stocktake_a_name: 'Give your stocktake a name',
    got_it: 'Got it',
    more: 'more',
    record_stock_required_before_finalising: 'You need to record how much stock is required before finalising',
    record_stock_to_issue_before_finalising: 'You need to record how much stock to issue before finalising',
    remove_these_items: 'Are you sure you want to remove these items?',
    remove: 'Remove',
    search_for_an_item_to_add: 'Search for an item to add',
    search_for_the_customer: 'Search for the customer',
    select_the_number_of_months_stock_required: 'Select the number of months stock required',
    start_typing_to_select_customer: 'Start typing to select customer',
    stocktake_no_counted_items: "Can't finalise a stocktake with no counted items",
  },
  tetum: {
  },
};

export const modalStrings = strings[CURRENT_LANGUAGE];
