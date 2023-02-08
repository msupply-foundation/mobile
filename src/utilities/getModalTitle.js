/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import {
  navStrings,
  programStrings,
  authStrings,
  modalStrings,
  buttonStrings,
} from '../localization';

export const MODAL_KEYS = {
  CONFIRM_FACTORY_RESET: 'confirmFactoryReset',
  CONFIRM_FACTORY_RESET_MASTER: 'confirmFactoryResetMaster',
  CONFIRM_MASTER_PASSWORD: 'confirmMasterPassword',
  CONFIRM_USER_PASSWORD: 'confirmUserPassword',
  CREATE_CASH_TRANSACTION: 'createCashTransaction',
  SYNC_URL_EDIT: 'syncUrlEdit',
  SYNC_PASSWORD_EDIT: 'syncPasswordEdit',
  STOCKTAKE_COMMENT_EDIT: 'stocktakeCommentEdit',
  STOCKTAKE_NAME_EDIT: 'stocktakeNameEdit',
  TRANSACTION_COMMENT_EDIT: 'transactionCommentEdit',
  REQUISITION_COMMENT_EDIT: 'requisitionCommentEdit',
  THEIR_REF_EDIT: 'theirRefEdit',
  SELECT_ITEM: 'selectItem',
  SELECT_MONTH: 'selectMonth',
  SELECT_CUSTOMER: 'selectCustomer',
  SELECT_PATIENT: 'selectPatient',
  SELECT_PRESCRIBER: 'selectPrescriber',
  SELECT_ITEM_BATCH_SUPPLIER: 'selectItemBatchSupplier',
  SELECT_INTERNAL_SUPPLIER: 'selectInternalSupplier',
  SELECT_EXTERNAL_SUPPLIER: 'selectExternalSupplier',
  SELECT_LANGUAGE: 'selectLanguage',
  PROGRAM_REQUISITION: 'programRequisition',
  PROGRAM_STOCKTAKE: 'programStocktake',
  PROGRAM_CUSTOMER_REQUISITION: 'programCustomerRequisition',
  VIEW_REGIMEN_DATA: 'viewRegimenData',
  EDIT_STOCKTAKE_BATCH: 'editStocktakeBatch',
  STOCKTAKE_OUTDATED_ITEM: 'stocktakeOutdatedItems',
  REQUISITION_REASON: 'requisitionReason',
  STOCKTAKE_REASON: 'stocktakeReason',
  SELECT_MASTER_LISTS: 'selectMasterList',
  SELECT_LOCATION: 'selectLocation',
  SELECT_VVM_STATUS: 'selectVvmStatus',
};

export const getModalTitle = modalKey => {
  switch (modalKey) {
    default:
      return '';
    case MODAL_KEYS.PROGRAM_CUSTOMER_REQUISITION:
    case MODAL_KEYS.PROGRAM_REQUISITION:
      return `${navStrings.requisition} ${programStrings.details}`;
    case MODAL_KEYS.PROGRAM_STOCKTAKE:
      return `${navStrings.stocktake} ${programStrings.details}`;
    case MODAL_KEYS.CREATE_CASH_TRANSACTION:
      return modalStrings.create_cash_transaction;
    case MODAL_KEYS.SELECT_PRESCRIBER:
      return 'Select a prescriber';
    case MODAL_KEYS.SELECT_PATIENT:
      return 'Select a patient';
    case MODAL_KEYS.SELECT_LANGUAGE:
      return modalStrings.select_a_language;
    case MODAL_KEYS.SELECT_MONTH:
      return modalStrings.select_the_number_of_months_stock_required;
    case MODAL_KEYS.STOCKTAKE_NAME_EDIT:
      return modalStrings.edit_the_stocktake_name;
    case MODAL_KEYS.STOCKTAKE_COMMENT_EDIT:
      return modalStrings.edit_the_stocktake_comment;
    case MODAL_KEYS.REQUISITION_COMMENT_EDIT:
      return modalStrings.edit_the_requisition_comment;
    case MODAL_KEYS.TRANSACTION_COMMENT_EDIT:
      return modalStrings.edit_the_invoice_comment;
    case MODAL_KEYS.SELECT_ITEM:
      return modalStrings.search_for_an_item_to_add;
    case MODAL_KEYS.THEIR_REF_EDIT:
      return modalStrings.edit_their_reference;
    case MODAL_KEYS.SELECT_CUSTOMER:
      return modalStrings.search_for_the_customer;
    case MODAL_KEYS.SELECT_ITEM_BATCH_SUPPLIER:
    case MODAL_KEYS.SELECT_EXTERNAL_SUPPLIER:
    case MODAL_KEYS.SELECT_INTERNAL_SUPPLIER:
      return modalStrings.search_for_the_supplier;
    case MODAL_KEYS.VIEW_REGIMEN_DATA:
      return buttonStrings.view_regimen_data;
    case MODAL_KEYS.REQUISITION_REASON:
    case MODAL_KEYS.STOCKTAKE_REASON:
      return modalStrings.select_a_reason;
    case MODAL_KEYS.SYNC_URL_EDIT:
    case MODAL_KEYS.SYNC_PASSWORD_EDIT:
      return authStrings.warning_sync_edit;
    case MODAL_KEYS.CONFIRM_USER_PASSWORD:
      return modalStrings.confirm_password;
    case MODAL_KEYS.CONFIRM_FACTORY_RESET:
      return modalStrings.confirm_factory_reset;
    case MODAL_KEYS.SELECT_MASTER_LISTS:
      return modalStrings.select_master_lists;
    case MODAL_KEYS.SELECT_LOCATION:
      return modalStrings.select_a_location;
    case MODAL_KEYS.SELECT_VVM_STATUS:
      return modalStrings.select_vvm_status;
    case MODAL_KEYS.CONFIRM_FACTORY_RESET_MASTER:
      return modalStrings.confirm_factory_reset_master;
    case MODAL_KEYS.CONFIRM_MASTER_PASSWORD:
      return modalStrings.confirm_master_password;
  }
};
