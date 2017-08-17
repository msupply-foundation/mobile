/**
 * All utility functions for processing synced records after being synced. These changes
 * should be detected by SyncQueue and sent back to the server on next sync.
 */
import { SETTINGS_KEYS } from '../settings';
import { getNextNumber, NUMBER_SEQUENCE_KEYS } from '../database/utilities';

const { LAST_POST_PROCESSING_FAILED } = SETTINGS_KEYS;
const { REQUISITION_SERIAL_NUMBER, SUPPLIER_INVOICE_NUMBER } = NUMBER_SEQUENCE_KEYS;

import autobind from 'react-autobind';

export class PostSyncProcessor {
  constructor(database, settings) {
    this.database = database;
    this.settings = settings;
    this.recordQueue = new Map(); // Map of [recordId, recordType]
    this.functionQueue = [];
    autobind(this);
    this.database.addListener(this.onDatabaseEvent);
  }

  setUser(user) {
    this.user = user;
  }

  /**
   * Respond to a database change event relating to incoming sync records. Adds records
   * to end of this.recordQueue and removes any earlier duplicates.
   * @param  {string} changeType  The type of database change, e.g. CREATE, UPDATE, DELETE
   * @param  {string} recordType  The type of record changed (from database schema)
   * @param  {object} record      The record changed
   * @param  {string} causedBy    The cause of this database event, either 'sync' or undefined
   * @return {none}
   */
  onDatabaseEvent(changeType, recordType, record, causedBy) {
    // Exit if not a change caused by incoming sync
    if (causedBy !== 'sync' || recordType === 'SyncOut') return;
    if (this.recordQueue.has(record.id)) {
      // Check if already in queue, remove old
      this.recordQueue.delete(record.id);
    }
    // Add new entry at end of Map
    this.recordQueue.set(record.id, recordType);
  }

  /**
   * Return whether or not the last sync of the app failed
   * @return {boolean} 'true' if the last call of synchronise failed
   */
  lastPostSyncProcessingFailed() {
    const lastPostSyncProcessingFailed = this.settings.get(LAST_POST_PROCESSING_FAILED);
    return lastPostSyncProcessingFailed && lastPostSyncProcessingFailed === 'true';
  }

  /**
   * Attempts to enqueue functions for every record in specified tables of
   * local database, ensuring data is correct.
   * Tables manually added as to not iterate over tables function generators.
   */
  processAnyUnprocessedRecords() {
    this.settings.set(LAST_POST_PROCESSING_FAILED, 'true');
    this.functionQueue = [];
    this.recordQueue = new Map(); // Reset the recordQueue to avoid unnessary runs

    this.database
      .objects('Requisition')
      .forEach(record => this.enqueueFunctionsForRecordType('Requisition', record));

    this.database
      .objects('Transaction')
      .forEach(record => this.enqueueFunctionsForRecordType('Transaction', record));

    this.processFunctionQueue();
    this.settings.set(LAST_POST_PROCESSING_FAILED, 'false');
  }

  /**
   * Iterates through records added through listening to sync, adding needed functions
   * to functionQueue. Runs the functionQueue, making the changes.
   */
  processRecordQueue() {
    this.settings.set(LAST_POST_PROCESSING_FAILED, 'true');
    this.recordQueue.forEach((recordType, recordId) => {
      // Use local database record, not what comes in sync. Ensures that records are
      // integrated information (definitely after sync is done)
      const internalRecord = this.database.objects(recordType).filtered('id == $0', recordId)[0];
      this.enqueueFunctionsForRecordType(recordType, internalRecord);
    });
    this.processFunctionQueue();
    this.settings.set(LAST_POST_PROCESSING_FAILED, 'false');
  }

  /**
   * Runs all the post sync functions in this.functionQueue and clears queue.
   */
  processFunctionQueue() {
    this.database.write(() => this.functionQueue.forEach(func => func()));
    this.functionQueue = [];
  }

  /**
   * Delegates records to the correct utility function and adds generated functions
   * to this.functionQueue
   * @param  {string} recordType  The type of record changed (from database schema)
   * @param  {object} record      The record changed
   * @return {none}
   */
  enqueueFunctionsForRecordType(recordType, record) {
    switch (recordType) {
      case 'Requisition':
        this.functionQueue = this.functionQueue.concat(
          this.generateFunctionsForRequisition(record)
        );
        break;
      case 'Transaction':
        this.functionQueue = this.functionQueue.concat(
          this.generateFunctionsForTransaction(record)
        );
        break;
      default:
        break;
    }
  }

  /**
   * Builds an array of post sync functions based on conditions, appends a database write call
   * to apply all the post sync functions if there are any.
   * @param  {object} record     The record changed
   * @return {array}  An array of functions to be called for the given record
   */
  generateFunctionsForRequisition(record) {
    const funcs = [];

    // Allocate serial number to requisitions with serial number of -1. This has been generated
    // by the server, coming from another store as supplier.
    if (record.serialNumber === '-1') {
      funcs.push(() => {
        record.serialNumber = getNextNumber(this.database, REQUISITION_SERIAL_NUMBER);
      });
    }

    if (!record.isRequest && !record.isFinalised) {
      funcs.push(() => {
        record.createCustomerInvoice(this.database, this.user);
      });
    }


    // If any changes, add database update for record
    if (funcs.length > 0) {
      funcs.push(() => this.database.save('Requisition', record));
    }

    return funcs;
  }

  /**
   * Builds an array of post sync functions based on conditions, appends a database write call
   * to apply all the post sync functions if there are any.
   * @param  {object} record     The record changed
   * @return {array}  An array of functions to be called for the given record
   */
  generateFunctionsForTransaction(record) {
    const funcs = [];

    // Allocate serial number to supplier invoices with serial number of -1. This has been generated
    // by the server, coming from another store as supplier.
    if (record.serialNumber === '-1' && record.type === 'supplier_invoice') {
      funcs.push(() => {
        record.serialNumber = getNextNumber(this.database, SUPPLIER_INVOICE_NUMBER);
      });
    }

    // If any changes, add database update for record
    if (funcs.length > 0) {
      funcs.push(() => this.database.save('Transaction', record));
    }

    return funcs;
  }
}
