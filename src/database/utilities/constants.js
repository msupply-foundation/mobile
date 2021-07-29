/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;

export const MILLISECONDS_PER_MINUTE = MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE;
export const MILLISECONDS_PER_HOUR = MILLISECONDS_PER_MINUTE * MINUTES_PER_HOUR;
export const MILLISECONDS_PER_DAY = MILLISECONDS_PER_HOUR * HOURS_PER_DAY;

export const NUMBER_OF_DAYS_IN_A_MONTH = 365 / 12;
export const PATIENT_CODE_LENGTH = 8;

export const NUMBER_SEQUENCE_KEYS = {
  CUSTOMER_INVOICE_NUMBER: 'customer_invoice_serial_number',
  INVENTORY_ADJUSTMENT_SERIAL_NUMBER: 'inventory_adjustment_serial_number',
  REQUISITION_SERIAL_NUMBER: 'requisition_serial_number',
  REQUISITION_REQUESTER_REFERENCE: 'requisition_requester_reference',
  STOCKTAKE_SERIAL_NUMBER: 'stocktake_serial_number',
  SUPPLIER_INVOICE_NUMBER: 'supplier_invoice_serial_number',
};

export const NAME_TYPE_KEYS = {
  INVENTORY_ADJUSTMENT: 'inventory_adjustment',
  FACILITY: 'facility',
  PATIENT: 'patient',
  BUILD: 'build',
  STORE: 'store',
  REPACK: 'repack',
};

export {
  INDICATOR_CODES,
  INDICATOR_COLUMN_CODES,
  INDICATOR_VALUE_TYPES,
} from './indicatorConstants';

export { PREFERENCE_KEYS, PREFERENCE_TYPE_KEYS, PREFERENCE_TYPES } from './preferenceConstants';
