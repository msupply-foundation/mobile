/* eslint-disable max-classes-per-file */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/* eslint-disable quote-props */
/* eslint-disable max-classes-per-file */

import { NAME_TYPE_KEYS } from '../database/utilities/constants';

export const INTERNAL_TO_EXTERNAL = 0;
export const EXTERNAL_TO_INTERNAL = 1;

class SyncTranslator {
  constructor(internalToExternal) {
    this.internalToExternal = internalToExternal;
    this.externalToInternal = {};
    // TODO: replace generators with explicit loops.
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(internalToExternal)) {
      this.externalToInternal[value] = key;
    }
  }

  translate(key, direction) {
    switch (direction) {
      case INTERNAL_TO_EXTERNAL:
      default:
        return this.internalToExternal[key];
      case EXTERNAL_TO_INTERNAL:
        return this.externalToInternal[key];
    }
  }
}

// Map of internal database object types to external record types.
export const RECORD_TYPES = new SyncTranslator({
  Abbreviation: 'abbreviation',
  AdverseDrugReaction: 'adverse_drug_reaction',
  Currency: 'currency',
  Ethnicity: 'Ethnicity',
  FormSchema: 'form_schema',
  IndicatorAttribute: 'indicator_attribute',
  IndicatorValue: 'indicator_value',
  InsurancePolicy: 'nameInsuranceJoin',
  InsuranceProvider: 'insuranceProvider',
  Item: 'item',
  ItemBatch: 'item_line',
  ItemCategory: 'item_category',
  ItemDepartment: 'item_department',
  ItemDirection: 'item_direction',
  ItemStoreJoin: 'item_store_join',
  LocalListItem: 'list_local_line',
  Location: 'Location',
  LocationMovement: 'location_movement',
  LocationType: 'Location_type',
  MasterList: 'list_master',
  MasterListItem: 'list_master_line',
  MasterListNameJoin: 'list_master_name_join',
  MedicineAdministrator: 'medicine_administrator',
  Message: 'message',
  Name: 'name',
  NameNote: 'name_note',
  NameStoreJoin: 'name_store_join',
  NameTag: 'name_tag',
  NameTagJoin: 'name_tag_join',
  Nationality: 'nationality',
  NumberSequence: 'number',
  NumberToReuse: 'number_reuse',
  Occupation: 'Occupation',
  Options: 'options',
  PatientEvent: 'patient_event',
  PaymentType: 'paymentType',
  Period: 'period',
  PeriodSchedule: 'periodSchedule',
  Preference: 'pref',
  Prescriber: 'clinician',
  ProgramIndicator: 'program_indicator',
  Report: 'dashboard_store_report',
  Requisition: 'requisition',
  RequisitionItem: 'requisition_line',
  Sensor: 'sensor',
  Stocktake: 'Stock_take',
  StocktakeBatch: 'Stock_take_lines',
  Store: 'store',
  TemperatureBreach: 'temperature_breach',
  TemperatureBreachConfiguration: 'temperature_breach_config',
  TemperatureLog: 'temperature_log',
  Transaction: 'transact',
  TransactionBatch: 'trans_line',
  TransactionCategory: 'transaction_category',
  Unit: 'unit',
  User: 'user',
  VaccineVialMonitorStatus: 'vaccine_vial_monitor_status',
  VaccineVialMonitorStatusLog: 'vaccine_vial_monitor_status_log',
});

export const REQUISITION_TYPES = new SyncTranslator({
  imprest: 'im',
  forecast: 'sh',
  request: 'request',
  response: 'response',
});

// Map of internal database change types to external sync types.
export const SYNC_TYPES = new SyncTranslator({
  create: 'I', // For 'insert'
  update: 'U',
  delete: 'D',
  merge: 'M',
});

export const TRANSACTION_TYPES = new SyncTranslator({
  customer_invoice: 'ci',
  customer_credit: 'cc',
  supplier_invoice: 'si',
  supplier_credit: 'sc',
  inventory_adjustment: 'in',
  prescription: 'pi',
  receipt: 'rc',
  payment: 'ps',
  // Following types provided for sync purposes, not actually used by mobile.
  build: 'bu',
  repack: 'sr',
});

export const NAME_TYPES = new SyncTranslator({
  [NAME_TYPE_KEYS.INVENTORY_ADJUSTMENT]: 'invad',
  [NAME_TYPE_KEYS.FACILITY]: 'facility',
  [NAME_TYPE_KEYS.PATIENT]: 'patient',
  [NAME_TYPE_KEYS.BUILD]: 'build',
  [NAME_TYPE_KEYS.STORE]: 'store',
  [NAME_TYPE_KEYS.REPACK]: 'repack',
});

/**
 * Translates requisition statuses, which will be changed by the supplying store
 * once finalised in the mobile store. Despite the supplying store's requisition
 * going through 'sg', 'cn', and 'fn' statuses, it should remain finalised in the
 * mobile store.
 */
class RequisitionStatusTranslator extends SyncTranslator {
  translate(status, direction) {
    if (['cn', 'wf'].includes(status)) return 'finalised';
    return super.translate(status, direction);
  }
}
export const REQUISITION_STATUSES = new RequisitionStatusTranslator({
  new: 'wp', // 'wp', 'wf', 'cn' should never be returned in api/v3.
  suggested: 'sg',
  finalised: 'fn',
});

/**
 * Translates statuses of transactions, stocktakes, etc., which include 'wp' and 'wf'
 * on legacy systems.
 */
class StatusTranslator extends SyncTranslator {
  translate(status, direction) {
    switch (status) {
      case 'wp':
        return 'new';
      case 'wf':
        return 'finalised';
      default:
        return super.translate(status, direction);
    }
  }
}
// Map of internal statuses to external statuses (of transactions, stocktakes, etc.).
export const STATUSES = new StatusTranslator({
  confirmed: 'cn',
  finalised: 'fn',
  suggested: 'sg',
  new: 'nw',
});

/**
 * Translates number sequence keys from internal to external formats, and vice versa.
 * If translating external to internal, will return null if it is a sequence key
 * not used by mobile, or if it relates to a different store.
 */
class SequenceKeyTranslator extends SyncTranslator {
  translate(sequenceKey, direction, thisStoreId) {
    let key = sequenceKey;
    if (direction === EXTERNAL_TO_INTERNAL) {
      if (key.length < thisStoreId.length) return null; // Not a key used here.
      // Relevamt mSupply sequence keys end with the store id they relate to.
      const storeId = key.substring(key.length - thisStoreId.length);
      // If the sequence doesn't relate to this store, ignore.
      if (storeId !== thisStoreId) return null;
      key = key.substring(0, key.length - thisStoreId.length);
    }
    let translatedKey = super.translate(key, direction);
    if (direction === INTERNAL_TO_EXTERNAL) translatedKey += thisStoreId;
    return translatedKey;
  }
}

export const SEQUENCE_KEYS = new SequenceKeyTranslator({
  customer_invoice_serial_number: 'customer_invoice_number_for_store_',
  payment_serial_number: 'payment_serial_number_for_store_',
  receipt_serial_number: 'receipt_serial_number_for_store_',
  inventory_adjustment_serial_number: 'inventory_adjustment_serial_number_for_store_',
  requisition_serial_number: 'requisition_serial_number_for_store_',
  requisition_requester_reference: 'requisition_requester_reference_for_store_',
  stocktake_serial_number: 'stock_take_number_for_store_',
  supplier_invoice_serial_number: 'supplier_invoice_number_for_store_',
});
