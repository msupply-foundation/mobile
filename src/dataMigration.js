/* eslint-disable prettier/prettier */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { compareVersions } from './utilities';
import { SETTINGS_KEYS, SETTINGS_DEFAULTS } from './settings';
import packageJson from '../package.json';
import { createRecord, clearNumberSequences } from './database/utilities';

const APP_VERSION_KEY = 'AppVersion';

export const migrateDataToVersion = async (database, settings) => {
  // Get current app version.
  let fromVersion;
  try {
    // First check for the old app version in local storage.
    fromVersion = await AsyncStorage.getItem(APP_VERSION_KEY);
  } catch (error) {
    // Silently ignore local storage errors.
  }
  // If app version not correctly retrieved from local storage, check settings.
  if (!fromVersion || fromVersion.length === 0) {
    fromVersion = settings.get(SETTINGS_KEYS.APP_VERSION);
    // Migrate app version from settings to local storage.
    AsyncStorage.setItem(APP_VERSION_KEY, fromVersion);
  }

  // Get upgraded version.
  const toVersion = packageJson.version;

  // If version was in neither local storage or settings, app instance is a new install,
  // no need to migrate.
  if (fromVersion && fromVersion.length !== 0) {
    // If version is latest, don't do anything.
    if (fromVersion === toVersion) return;
    // Do any required version update data migrations.
    // eslint-disable-next-line no-restricted-syntax
    for (const migration of dataMigrations) {
      if (
        compareVersions(fromVersion, migration.version) < 0 &&
        compareVersions(toVersion, migration.version) >= 0
      ) {
        migration.migrate(database, settings);
      }
    }
    database.write(() => {
      createRecord(database, 'UpgradeMessage', fromVersion, toVersion);
    });
  }
  // Record the new app version.
  AsyncStorage.setItem(APP_VERSION_KEY, toVersion);
  settings.set(SETTINGS_KEYS.APP_VERSION, toVersion);
};

// All data migration functions should be kept in this array, in sequential order. Each migration
// needs a 'version' key, denoting the version that migration will migrate to, and a 'migrate' key,
// which is a function taking the database and the settings and performs the migration.
const dataMigrations = [
  {
    version: '1.0.30',
    migrate: (database, settings) => {
      // 1.0.30 added the setting 'SYNC_IS_INITIALISED', where it previously relied on 'SYNC_URL'.
      const syncURL = settings.get(SETTINGS_KEYS.SYNC_URL);
      if (syncURL && syncURL.length > 0) {
        settings.set(SETTINGS_KEYS.SYNC_IS_INITIALISED, 'true');
      }
    },
  },
  {
    version: '2.0.0-rc0',
    migrate: (database, settings) => {
      // Changed |SyncQueue| to expect no more than one 'SyncOut' record for every record in
      // database.

      // Assume that last SyncOut record is correct.
      const allRecords = database.objects('SyncOut').sorted('changeTime').snapshot();
      database.write(() => {
        allRecords.forEach(record => {
          const hasDuplicates = allRecords.filtered('recordId == $0', record.id).length > 1;
          if (hasDuplicates) {
            database.delete('SyncOut', record);
          } else if (record.recordType === 'Transaction' || record.recordType === 'Requisition') {
            // 'Transaction' and 'Requisition' records need to be synced after all child records
            // for 2.0.0 interstore features.
            record.changeTime = new Date().getTime();
            database.update('SyncOut', record);
          }
        });
      });
      // A hack to change main supplying store from Adara to SAMES for stores that had Adara PS
      // as supplying store during initial sync.
      if (
        settings.get(SETTINGS_KEYS.SUPPLYING_STORE_NAME_ID) ===
          'B1938F4FFDC2074DB5408B435ACEB198' ||
        settings.get(SETTINGS_KEYS.SUPPLYING_STORE_ID) === '734CC3EC70283A4AABC4E645C8B1E11D'
      ) {
        settings.set(SETTINGS_KEYS.SUPPLYING_STORE_NAME_ID, 'E5D7BB38571C1F428AF397240EEB285F');
        settings.set(SETTINGS_KEYS.SUPPLYING_STORE_ID, '6CFDCD1916B098478422A489625AB9E7');
      }
      // Migration for v2 API request requisitions, set |otherStoreName| to main supplying store
      // name for all existing requisitions (expect no response requisitions at this stage).
      const supplyingStoreId = settings.get(SETTINGS_KEYS.SUPPLYING_STORE_NAME_ID);
      if (!supplyingStoreId || supplyingStoreId === '') {
        throw new Error('Supplying Store Name ID missing from Settings');
      }

      const requisitions = database
        .objects('Requisition')
        .filtered('otherStoreName == null AND type == "request"')
        .snapshot();
      database.write(() => {
        const mainSupplyingStoreName = database.getOrCreate('Name', supplyingStoreId);

        requisitions.forEach(requisition =>
          database.update('Requisition', {
            id: requisition.id,
            otherStoreName: mainSupplyingStoreName,
            status: requisition.status === 'finalised' ? 'finalised' : 'suggested',
          })
        );
      });

      // Previous versions did not add requisitions, transactions, or stocktakes to the sync queue
      // when they were finalised, causing them to have not been synced to the server in finalised
      // form. Find all of these, and set them to resync.
      database.write(() => {
        // Requisitions
        const finalisedRequisitions = database
          .objects('Requisition')
          .filtered('status == "finalised"');
        finalisedRequisitions.forEach(requisition => database.save('Requisition', requisition));

        // Transactions.
        const finalisedTransactions = database
          .objects('Transaction')
          .filtered('status == "finalised"');
        finalisedTransactions.forEach(transaction => database.save('Transaction', transaction));

        // Stocktakes.
        const finalisedStocktakes = database.objects('Stocktake').filtered('status == "finalised"');
        finalisedStocktakes.forEach(stocktake => database.save('Stocktake', stocktake));
      });
    },
  },
  {
    version: '2.1.0-rc10',
    migrate: database => {
      // If we try to delete a 'TransactionBatch' with a parent transaction with 'confirmed' status,
      // then a 'TransactionBatch' destructor will try to revert stock on related 'ItemBatch'
      // objects. To prevent this, the status of these transactions is temporarily changed.
      const deleteBatches = (inventoryAdjustment, batchesToDelete) => {
        const currentStatus = inventoryAdjustment.status;
        database.write(() => {
          // Dot notation assignment won't fire sync events.
          inventoryAdjustment.status = TEMP_STATUS;
          database.delete('TransactionBatch', batchesToDelete);
          inventoryAdjustment.status = currentStatus;
        });
      };

      const TEMP_STATUS = 'nw';
      const matchBatch = (batches, batchToMatch) =>
        batches.some(batch => batch.id === batchToMatch.id);
      // It was possible to finalise stocktakes twice, creating duplicate batches in
      // 'inventory_adjustment' transactions. This need to cleaned up to avoid discrepancies.
      // This did not affect actual 'ItemBatch' quantity.
      const lines = database
        .objects('TransactionItem')
        .filtered('transaction.otherParty.type == "inventory_adjustment"');
      lines.forEach(line => {
        let batchesToDelete = [];
        const { batches } = line;
        // Add duplicated batch to |batchesToDelete|.
        batches.forEach(batch => {
          if (!matchBatch(batchesToDelete, batch)) {
            batchesToDelete = [
              ...batchesToDelete,
              ...batches.filtered('itemBatch.id == $0 AND id != $1', batch.itemBatch.id, batch.id),
            ];
          }
        });
        // Delete duplicate batches.
        if (batchesToDelete.length > 0) {
          deleteBatches(line.transaction, batchesToDelete);
        }
      });
    },
  },

  //  2.3.6 Introduced a patch for ItemBatch outgoing sync supplier. Previously,
  // all outgoing ItemBatches had their supplier field set to the default
  // supplying store record for its store. 2.3.6 ensured that the supplier
  // of a ItemBatch was correctly synced out, maintaining it's supplier field.
  // This migration code
  {
    version: '3.0.0',
    migrate: database => {
      const supplierInvoiceType = 'supplier_invoice';
      const finalisedStatus = 'finalised';
      const itemBatches = database.objects('ItemBatch');
      database.write(() => {
        // For each item batch, find the supplier invoice transaction which
        // introduced it and set the otherParty of the related transaction
        // to the supplier of the related batch.
        itemBatches.forEach(batch => {
          const { id, transactionBatches } = batch;
          // Ensure there are transaction batches before trying to find the transaction.
          if (!(transactionBatches && transactionBatches.length !== 0)) return;
          // There should only be one supplier invoice related to the item batch,
          // in case somethings wrong and there are more, use the first one.
          // Also ensure it is finalised. If it isn't, the supplier will be set when confirmed.
          const supplierInvoiceTransactionBatches = transactionBatches.filtered(
            'transaction.type = $0 && transaction.status = $1',
            supplierInvoiceType,
            finalisedStatus
          );
          // If there aren't any transaction batches, exit.
          if (!(supplierInvoiceTransactionBatches.length > 0)) return;
          const { transaction } = supplierInvoiceTransactionBatches[0];
          // If somehow the transaction batch doesn't have a transaction, return
          if (!transaction) return;
          const { otherParty: transactionsSupplier } = transaction;
          const { supplier: currentSupplier } = batch;
          // If the transaction doesn't have a supplier, early exit
          if (!transactionsSupplier) return;
          const { id: transactionsSupplierId } = transactionsSupplier;
          const { id: currentSuppliersId } = currentSupplier || {};
          // Only update an item batch if the transaction supplier differs from the batches
          if (currentSuppliersId !== transactionsSupplierId) {
            database.update('ItemBatch', { id, supplier: transactionsSupplier });
          }
        });
      });
    },
  },

  // 5.1.2 fixes a sync out queue bug which was preventing invalid sync out records being
  // overwritten. On upgrade, the following migration code filters the sync queue for invalid
  // sync out records and deletes any which are found.
  {
    version: '5.1.2-rc3',
    migrate: database => {
      database.write(() => {
        const syncRecords = database.objects('SyncOut').slice();
        const invalidSyncRecords = syncRecords.filter(syncRecord => {
          const { recordType, recordId } = syncRecord;
          if (!recordType || !recordId) return true;
          const record = database.get(recordType, recordId);
          return !record;
        });
        database.delete('SyncOut', invalidSyncRecords);
      });
    },
  },
  // This adds a sync interval to settings with the default value of 10 minutes which has been
  // the hard coded value for all versions prior to 8.0.
  {
    version: '8.0.0',
    migrate: database => {
      const syncInterval = database.getSetting(SETTINGS_KEYS.SYNC_INTERVAL);

      if (!syncInterval) {
        database.write(() => {
          database.update('Setting', {
            key: SETTINGS_KEYS.SYNC_INTERVAL,
            value: SETTINGS_DEFAULTS[SETTINGS_KEYS.SYNC_INTERVAL],
          });
        });

        database.write(() => {
          database.update('Setting', {
            key: SETTINGS_KEYS.IDLE_LOGOUT_INTERVAL,
            value: SETTINGS_DEFAULTS[SETTINGS_KEYS.IDLE_LOGOUT_INTERVAL],
          });
        });
      }
    },
  },
  {
    version: '8.6.2',
    migrate: database => {
      clearNumberSequences(database);
    },
  },
  {
    version: '8.7.0',
    migrate: database => {
      try {
        // Get all blank request requisitions (i.e requisitions they might have been created
        // possibly from web entries - having status 'wp', 'wf' etc in the mSupply) or
        // through transactions linked to requisitions they were already deleted from the mSupply
        const blankRequisitions = database
          .objects('Requisition')
          .filtered('otherStoreName == null and status == "new" and type == "request"')
          .snapshot();

        // Delete all blank request requisitions and their requisition items
        database.write(() => {
          blankRequisitions.forEach(requisition => {
            // Check for linked transactions and unlink them first before deleting it
            // to avoid any data integrity issues
            const { linkedTransaction } = requisition;
            if (linkedTransaction) {
              database.update('Transaction', {
                id: linkedTransaction.id,
                linkedRequisition: null,
              });
              database.update('Requisition', {
                id: requisition.id,
                linkedTransaction: null,
              });
            }

            // delete the requisition
            database.delete('Requisition', requisition);
          });
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Migration 8.7.0 error:', e.message, e.stack);
      }
    },
  },
];

export default dataMigrations;
