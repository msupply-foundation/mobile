/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { CHANGE_TYPES, generateUUID } from '../database';

const { CREATE, UPDATE, DELETE } = CHANGE_TYPES;

const recordTypesSynced = [
  'AdverseDrugReaction',
  'IndicatorValue',
  'IndicatorValue',
  'InsurancePolicy',
  'ItemBatch',
  'Location',
  'LocationMovement',
  'Message',
  'Name',
  'NameNote',
  'Prescriber',
  'Requisition',
  'RequisitionItem',
  'Sensor',
  'Stocktake',
  'StocktakeBatch',
  'TemperatureBreach',
  'TemperatureBreachConfiguration',
  'TemperatureLog',
  'Transaction',
  'TransactionBatch',
  'VaccineVialMonitorStatusLog',
];

/**
 * Maintains the queue of records to be synced: listens to database changes,
 * queues sync records, provides them when asked, and removes them when marked as
 * used. First changed, first out, i.e. oldest changes are synced first.
 */
export class SyncQueue {
  constructor(database) {
    this.database = database;
    this.onDatabaseEvent = this.onDatabaseEvent.bind(this);
    this.databaseListenerId = null;
  }

  /**
   * Start the queue listening to database changes.
   *
   * @return {none}
   */
  enable() {
    this.databaseListenerId = this.database.addListener(this.onDatabaseEvent);
  }

  /**
   * Stop the queue listening to database changes.
   *
   * @return {none}
   */
  disable() {
    this.database.removeListener(this.databaseListenerId);
  }

  isValidSyncOutRecord(syncOutRecord) {
    const { recordType, recordId } = syncOutRecord;

    if (!recordId) return false;
    const record = this.database.get(recordType, recordId);
    if (!record) return false;

    switch (recordType) {
      // Only sync out prescribers from this store.
      case 'Prescriber':
        return record.fromThisStore;
      case 'Name':
        return record.isPatient;
      default:
        return true;
    }
  }

  /**
   * Respond to a database change event. Must be called from within a database
   * write transaction.
   *
   * @param   {string}  changeType  The type of database change, e.g. CREATE, UPDATE, DELETE.
   * @param   {string}  recordType  The type of record changed (from database schema).
   * @param   {object}  record      The record changed.
   * @param   {string}  causedBy    The cause of this database event, either 'sync' or undefined.
   * @return  {none}
   */
  onDatabaseEvent(changeType, recordType, record, causedBy) {
    if (causedBy === 'sync') return; // Don't re-sync any changes caused by a sync.
    if (recordTypesSynced.indexOf(recordType) >= 0) {
      switch (changeType) {
        case CREATE:
        case UPDATE:
        case DELETE: {
          const { id: recordId } = record;

          const syncOutRecord = {
            changeTime: new Date().getTime(),
            changeType,
            recordType,
            recordId,
          };

          if (this.isValidSyncOutRecord(syncOutRecord)) {
            const existingSyncOutRecord = this.database.get('SyncOut', recordId, 'recordId');
            if (existingSyncOutRecord) {
              this.database.update('SyncOut', { id: existingSyncOutRecord.id, ...syncOutRecord });
            } else {
              this.database.create('SyncOut', { id: generateUUID(), ...syncOutRecord });
            }
          }

          break;
        }
        default:
          // Not a supported database event, do nothing (e.g. WIPE, takes care of itself).
          break;
      }
    }
  }

  /**
   * Return the number of records in the sync queue.
   *
   * @return  {integer}  Number of records awaiting sync
   */
  get length() {
    return this.database.objects('SyncOut').length;
  }

  /**
   * Return the next x records to be synced.
   *
   * @param   {integer}  numberOfRecords  The number of records to return (defaults to 1).
   * @return  {array}                     An array of the top x records in the sync queue.
   */
  next(numberOfRecords) {
    const numberToReturn = numberOfRecords || 1;
    const allRecords = this.database.objects('SyncOut').sorted('changeTime');
    return allRecords.slice(0, numberToReturn);
  }

  /**
   * Remove the given records from the sync queue.
   *
   * @param   {array}  records  An array of the records that have been used.
   * @return  {none}
   */
  use(records) {
    this.database.write(() => this.database.delete('SyncOut', records));
  }
}

export default SyncQueue;
