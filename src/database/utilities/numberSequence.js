import { NUMBER_SEQUENCE_KEYS } from './constants';

const getMaxSerialNumber = (database, sequenceKey) => {
  switch (sequenceKey) {
    case NUMBER_SEQUENCE_KEYS.SUPPLIER_INVOICE_NUMBER: {
      return database.objects('SupplierTransaction').max('serialNumber');
    }
    case NUMBER_SEQUENCE_KEYS.STOCKTAKE_SERIAL_NUMBER: {
      return database.objects('Stocktake').max('serialNumber');
    }
    case NUMBER_SEQUENCE_KEYS.REQUISITION_REQUESTER_REFERENCE: {
      const requisition = database.objects('Requisition');
      const filteredData = requisition.filtered('type == $0', 'request');
      return filteredData.max('requesterReference');
    }
    case NUMBER_SEQUENCE_KEYS.REQUISITION_SERIAL_NUMBER: {
      const requisition = database.objects('Requisition');
      const filteredData = requisition.filtered('type == $0', 'request');
      return filteredData.max('serialNumber');
    }
    case NUMBER_SEQUENCE_KEYS.INVENTORY_ADJUSTMENT_SERIAL_NUMBER: {
      const transactions = database.objects('Transaction');
      const filteredData = transactions.filtered(
        '((type == $0 OR type == $1) AND otherParty.type == $2)',
        'supplier_invoice',
        'supplier_credit',
        'inventory_adjustment'
      );
      return filteredData.max('serialNumber');
    }
    case NUMBER_SEQUENCE_KEYS.CUSTOMER_INVOICE_NUMBER: {
      const transactions = database.objects('Transaction');
      const filteredData = transactions.filtered(
        'type == $0 OR type == $1 OR type == $2 OR type == $3',
        'customer_invoice',
        'customer_credit',
        'payment',
        'receipt'
      );
      return filteredData.max('serialNumber');
    }
    default:
      return 0;
  }
};

export { getMaxSerialNumber };
