/* eslint-disable quote-props */

export const INTERNAL_TO_EXTERNAL = 0;
export const EXTERNAL_TO_INTERNAL = 1;

class SyncTranslator {
  constructor(internalToExternal) {
    this.internalToExternal = internalToExternal;
    this.externalToInternal = {};
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

// Map of internal database object types to external record types
export const RECORD_TYPES = new SyncTranslator({
  'Item': 'item',
  'ItemStoreJoin': 'item_store_join',
  'ItemBatch': 'item_line',
  'ItemDepartment': 'item_department',
  'ItemCategory': 'item_category',
  'LocalListItem': 'list_local_line',
  'MasterList': 'list_master',
  'MasterListItem': 'list_master_line',
  'MasterListNameJoin': 'list_master_name_join',
  'Name': 'name',
  'NameStoreJoin': 'name_store_join',
  'NumberSequence': 'number',
  'NumberToReuse': 'number_reuse',
  'Requisition': 'requisition',
  'RequisitionItem': 'requisition_line',
  'Stocktake': 'Stock_take',
  'StocktakeBatch': 'Stock_take_lines',
  'Transaction': 'transact',
  'TransactionCategory': 'transaction_category',
  'TransactionBatch': 'trans_line',
  'User': 'user',
});

export const REQUISITION_TYPES = new SyncTranslator({
  'imprest': 'im',
  'forecast': 'sh',
  'request': 'request',
  'response': 'response',
});

// Map of internal database change types to external sync types
export const SYNC_TYPES = new SyncTranslator({
  'create': 'I', // For 'insert'
  'update': 'U',
  'delete': 'D',
});

export const TRANSACTION_TYPES = new SyncTranslator({
  'customer_invoice': 'ci',
  'customer_credit': 'cc',
  'supplier_invoice': 'si',
  'supplier_credit': 'sc',
  'inventory_adjustment': 'in',
  'prescription': 'pi',
});

export const TRANSACTION_BATCH_TYPES = new SyncTranslator({
  'customer_invoice': 'stock_out',
  'customer_credit': 'stock_in',
  'supplier_invoice': 'stock_in',
  'supplier_credit': 'stock_out',
});

export const NAME_TYPES = new SyncTranslator({
  'inventory_adjustment': 'invad',
  'facility': 'facility',
  'patient': 'patient',
  'build': 'build',
  'store': 'store',
  'repack': 'repack',
});

/**
 * Translates requisition statuses, which will be changed by the supplying store
 * once finalised in the mobile store. Despite the supplying store's requisition
 * going through sg, cn, and fn statuses, it should remain finalised in the mobile
 * store
 */
class RequisitionStatusTranslator extends SyncTranslator {
  translate(status, direction) {
    if (['sg', 'cn', 'fn'].includes(status)) return 'finalised';
    return super.translate(status, direction);
  }
}
export const REQUISITION_STATUSES = new RequisitionStatusTranslator({
  'new': 'wp',
  'finalised': 'wf',
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
// Map of internal statuses to external statuses (of transactions, stocktakes, etc.)
export const STATUSES = new StatusTranslator({
  'confirmed': 'cn',
  'finalised': 'fn',
  'suggested': 'sg',
  'new': 'nw',
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
      if (key.length < thisStoreId.length) return null; // Definitely not a key we use
      // The mSupply sequence keys we care about end with the store id they relate to
      const storeId = key.substring(key.length - thisStoreId.length);
      // If the sequence doesn't relate to this store, we will ignore it
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
  inventory_adjustment_serial_number: 'inventory_adjustment_serial_number_for_store_',
  requisition_serial_number: 'requisition_serial_number_for_store_',
  requisition_requester_reference: 'requisition_requester_reference_for_store_',
  stocktake_serial_number: 'stock_take_number_for_store_',
  supplier_invoice_serial_number: 'supplier_invoice_number_for_store_'
});
