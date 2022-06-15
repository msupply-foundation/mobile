/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/* eslint-disable no-await-in-loop */

import DeviceInfo from 'react-native-device-info';
import Bugsnag from '@bugsnag/react-native';

import {
  incrementSyncProgress,
  setSyncProgress,
  setSyncProgressMessage,
  setSyncTotal,
  setSyncError,
  setSyncIsSyncing,
  setSyncCompletionTime,
} from '../actions';
import { syncStrings } from '../localization';
import { integrateRecord } from './incomingSyncUtils';
import { generateSyncJson } from './outgoingSyncUtils';
import { SyncDatabase } from './SyncDatabase';
import { SyncQueue } from './SyncQueue';
import { SETTINGS_KEYS } from '../settings';

import { version as mobileVersion } from '../../package.json';
import { initialiseFinished } from '../actions/SyncActions';

const {
  SYNC_IS_INITIALISED,
  SYNC_PRIOR_FAILED,
  SYNC_SITE_NAME,
  SYNC_SERVER_ID,
  SYNC_SITE_ID,
  SYNC_URL,
  SYNC_INTERVAL,
} = SETTINGS_KEYS;

const MIN_SYNC_BATCH_SIZE = 10;
const MAX_SYNC_BATCH_SIZE = 500;
const OPTIMAL_BATCH_SPEED = 5;

/**
 * Provides core synchronization functionality, initilising the database with an
 * initial full sync, pushing, and pulling (any regular scheduling of synchronization
 * must be coordinated externally).
 *
 * @param  {Realm}              database       The local database.
 * @param  {SyncAuthenticator}  authenticator  Provides authentication with the sync server.
 * @param  {Settings}           settings       Access to locally stored settings.
 */
export class Synchroniser {
  constructor(database, authenticator, settings, dispatch) {
    this.database = new SyncDatabase(database);
    this.authenticator = authenticator;
    this.settings = settings;
    this.syncQueue = new SyncQueue(this.database);
    this.dispatch = dispatch;
    this.extraHeaders = {
      'msupply-site-uuid': DeviceInfo.getUniqueId(),
      'mobile-version': mobileVersion,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    this.refreshSyncParams();
    if (this.isInitialised()) this.syncQueue.enable();
  }

  /**
   * Redux progress setting functions.
   */
  setTotal = totalCount => this.dispatch(setSyncTotal(totalCount));

  incrementProgress = increment => this.dispatch(incrementSyncProgress(increment));

  setProgress = currentCount => this.dispatch(setSyncProgress(currentCount));

  setProgressMessage = message => this.dispatch(setSyncProgressMessage(message));

  setError = errorMessage => this.dispatch(setSyncError(errorMessage));

  setIsSyncing = isSyncing => this.dispatch(setSyncIsSyncing(isSyncing));

  setCompletionTime = time => this.dispatch(setSyncCompletionTime(time));

  initialiseFinished = () => this.dispatch(initialiseFinished());

  refreshSyncParams = () => {
    this.serverURL = this.settings.get(SYNC_URL);
    this.thisSiteId = this.settings.get(SYNC_SITE_ID);
    this.serverId = this.settings.get(SYNC_SERVER_ID);
    this.thisSiteName = this.settings.get(SYNC_SITE_NAME);
    this.authHeader = this.authenticator.getAuthHeader();
    this.batchSize = MIN_SYNC_BATCH_SIZE;
  };

  fetchWrapper = async (url, opts) => {
    const { body, headers } = opts;

    const bugsnagNotify = async message => {
      const responseText = await responseClone.text();
      Bugsnag.notify(new Error(message), report => {
        report.context = 'SYNC ERROR';
        report.metadata = { error: { url, headers, body, responseText } };
      });
    };

    const response = await fetch(url, opts);
    const responseClone = response.clone();

    if (response.status < 200 || response.status >= 300) {
      throw new Error('Connection failure while attempting to sync.');
    }
    let responseJson;
    try {
      responseJson = await response.json();
    } catch (error) {
      bugsnagNotify('Failed parsing response from server', response);
      throw new Error('Unexpected response from sync server');
    }

    if (responseJson.error) {
      if (
        responseJson.error.startsWith("Site registration doesn't match.") ||
        responseJson.error.startsWith('There are pending response requisition')
      ) {
        throw new Error(responseJson.error);
      } else {
        bugsnagNotify(responseJson.error, response);
        throw new Error('Server rejected pushed records');
      }
    }
    return { responseJson };
  };

  /**
   * Wipe the current database, check that the given URL can be synced against
   * using the given name and password, and if so populate the database by pulling
   * from the remote server.
   *
   * @param   {string}   serverURL         The URL to be synced against.
   * @param   {string}   syncSiteName      The username to use in sync auth.
   * @param   {string}   syncSitePassword  The password to use in sync auth.
   * @return  {Promise}                    Resolve if successfully authenticated and
   *                                       initialised, otherwise throw error.
   */
  initialise = async (serverURL, syncSiteName, syncSitePassword) => {
    this.setIsSyncing(true);
    this.setProgressMessage(syncStrings.initialising);
    this.syncQueue.disable(); // Stop sync queue listening to database changes.

    // Check if the |serverURL| passed in is the same as that which has been used during
    // initialisation. If this is the case, a failed partial initialisation is being continued.
    // If the |serverURL| is different, it is either completely fresh, or the URL has been
    // changed. In either case, initialisation should be started afresh. The same applies to
    // |syncSiteName|, so that it isn't possible to start syncing data from a site different
    // to what initialisation was previously started with.

    const oldSyncURL = this.serverURL;
    const oldSyncSiteName = this.thisSiteName;
    const isFresh =
      !oldSyncURL || serverURL !== oldSyncURL || !syncSiteName || syncSiteName !== oldSyncSiteName;

    if (isFresh) {
      this.database.write(() => {
        this.database.deleteAll();
      });
      this.settings.setDefaults();
    }

    try {
      await this.authenticator.authenticate(serverURL, syncSiteName, syncSitePassword);
      this.refreshSyncParams(); // Authenticate sets all the sync settings in database, so refresh.
      if (isFresh) {
        // If a fresh initialisation, send request to server to prepare required sync records.
        await this.fetchWrapper(
          `${this.serverURL}/sync/v3/initial_dump/?from_site=${this.thisSiteId}&to_site=${this.serverId}`,
          {
            headers: {
              Authorization: this.authHeader,
              ...this.extraHeaders,
            },
          }
        );
        // If the initial_dump has been successful, serverURL is valid, and should now have all sync
        // records queued and ready to send. Safe to store as this.serverURL
        this.serverURL = serverURL;
      }
      await this.pull();
    } catch (error) {
      // Did not authenticate, sync error or no internet, bubble up error.
      this.setError(error.message);
      this.setIsSyncing(false);
      if (isFresh) {
        this.serverURL = '';
        this.thisSiteName = '';
      }

      throw error;
    }

    this.settings.set(SYNC_IS_INITIALISED, 'true');
    this.syncQueue.enable(); // Begin the sync queue listening to database changes.
    this.setIsSyncing(false);
    this.setCompletionTime(new Date().getTime());
    this.initialiseFinished();
  };

  /**
   * Return whether the synchroniser has been initialised.
   *
   * @return  {boolean}  True if initial sync has been completed successfully.
   */
  isInitialised = () => {
    const syncIsInitialised = this.settings.get(SYNC_IS_INITIALISED);
    return syncIsInitialised && syncIsInitialised === 'true';
  };

  syncInterval = () => {
    const syncInterval = this.settings.get(SYNC_INTERVAL);
    return Number(syncInterval);
  };

  /**
   * Return whether or not the last sync of the app failed.
   *
   * @return  {boolean}  True if the last call of synchronise failed.
   */
  lastSyncFailed = () => {
    const lastSyncFailed = this.settings.get(SYNC_PRIOR_FAILED);
    return lastSyncFailed && lastSyncFailed === 'true';
  };

  /**
   * Carry out a synchronisation, first pushing any local changes, then pulling
   * down remote changes and integrating them into the local database.
   *
   * @return  {none}
   */
  synchronise = async () => {
    try {
      if (!this.isInitialised()) throw new Error('Not yet initialised');
      this.setIsSyncing(true);
      this.refreshSyncParams();

      // Keeps track between app close/open whether last sync was successful.
      this.settings.set(SYNC_PRIOR_FAILED, 'true');

      // Using async/await here causes any errors thrown by push or pull will be caught by the
      // outer try/catch.
      await this.push();
      await this.pull();

      // Store persistent sync details in settings.
      this.settings.set(SYNC_PRIOR_FAILED, 'false');

      // Store sync completion progress in redux.
      this.setIsSyncing(false);
      this.setCompletionTime(new Date().getTime());
    } catch (error) {
      this.setError(error.message);
      this.setIsSyncing(false);
    }
  };

  /**
   * Push batches of changes to the local database up to the remote server, until
   * all local changes have been synced.
   *
   * @return  {Promise}  Resolves if successful, or bubbles up any errors thrown.
   */
  push = async () => {
    this.setProgressMessage(syncStrings.pushing_changes);
    this.setProgress(0);
    this.setTotal(this.syncQueue.length);
    while (this.syncQueue.length > 0) {
      const batchComplete = this.batchSizeAdjustor();
      const recordsToSync = this.syncQueue.next(this.batchSize);

      const translatedRecords = recordsToSync
        .map(this.translateRecord) // Get translated records.
        .filter(record => !!record); // If error thrown, may be null so filter falsy values out.

      await this.pushRecords(translatedRecords);
      // Records that threw errors in |translateRecord()| are still removed.
      this.syncQueue.use(recordsToSync);
      this.incrementProgress(recordsToSync.length);
      batchComplete();
    }
  };

  /**
   * Handles translating records for |push()| and catching errors.
   *
   * @param   {object}  record  The outgoing record to be translated.
   * @return  {object}          The translated record output.
   */
  translateRecord = record => {
    try {
      // Try translate the record.
      return generateSyncJson(this.database, this.settings, record);
    } catch (error) {
      // If error not safe to continue sync, bubble up to next error handler.
      if (!error.canDeleteSyncOut) throw error; // See outgoingSyncUtils.js.
      return null;
    }
  };

  /**
   * Pushes a collection of records to the remote sync server.
   *
   * @param   {array}   records  The records to push.
   * @return  {Promise}          Resolves if successful, or passes up any error thrown.
   */
  pushRecords = async records => {
    await this.fetchWrapper(
      `${this.serverURL}/sync/v3/queued_records/?from_site=${this.thisSiteId}&to_site=${this.serverId}`,
      {
        method: 'POST',
        headers: {
          Authorization: this.authHeader,
          ...this.extraHeaders,
        },
        body: JSON.stringify(records),
      }
    );
  };

  /**
   * Pulls any changes to data on the sync server down to the local database.
   *
   * @return  {Promise}  Resolves if successful, or bubbles up any errors thrown.
   */
  pull = async () => {
    let waitingRecordCount = await this.getWaitingRecordCount();
    let total = waitingRecordCount;
    let progress = 0;

    this.setProgressMessage(syncStrings.pulling_changes);
    this.setProgress(progress);
    this.setTotal(total);

    // Pull |this.batchSize| records at a time from server.

    while (progress < total) {
      const batchComplete = this.batchSizeAdjustor();
      // Get a batch of records and integrate them.
      const incomingRecords = await this.getIncomingRecords();
      this.integrateRecords(incomingRecords);
      await this.acknowledgeRecords(incomingRecords);
      // Break out if incoming records is actually empty (unexpected behaviour from server API).
      // Ensure no infinite loops.
      if (incomingRecords.length <= 0) break;
      progress += incomingRecords.length;

      // Check no new records added to incoming queue on last iteration.
      if (progress >= total) {
        waitingRecordCount = await this.getWaitingRecordCount();
        if (waitingRecordCount > 0) {
          total = progress + waitingRecordCount;
          this.setTotal(total);
        }
      }
      this.incrementProgress(incomingRecords.length);
      batchComplete();
    }
  };

  /**
   * Returns the number of records left to pull.
   *
   * @return  {Promise}  Resolves with the record count, or bubbles up any errors thrown.
   */
  getWaitingRecordCount = async () => {
    const { responseJson } = await this.fetchWrapper(
      `${this.serverURL}/sync/v3/queued_records/count?from_site=${this.thisSiteId}&to_site=${this.serverId}`,
      {
        headers: {
          Authorization: this.authHeader,
          ...this.extraHeaders,
        },
      }
    );
    return responseJson.NumRecords;
  };

  /**
   * Returns the next batch of incoming sync records.
   *
   * @return  {Promise}  Resolves with the records, or bubbles up any errors thrown.
   */
  getIncomingRecords = async () => {
    const { responseJson } = await this.fetchWrapper(
      `${this.serverURL}/sync/v3/queued_records?from_site=${this.thisSiteId}&to_site=${this.serverId}&limit=${this.batchSize}`,
      {
        headers: {
          Authorization: this.authHeader,
          ...this.extraHeaders,
        },
      }
    );
    return responseJson;
  };

  /**
   * Parse the batch of incoming records, and integrate them into the local database.
   *
   * @param   {object}  syncJson  The json object the server sent to represent records.
   * @return  {none}
   */
  integrateRecords(syncJson) {
    this.database.write(() => {
      syncJson.forEach(syncRecord => {
        try {
          integrateRecord(this.database, this.settings, syncRecord);
        } catch (error) {
          // There was an error with data (e.g. caused by null object).
          const siteName = this.settings.get(SYNC_SITE_NAME);
          const syncUrl = this.settings.get(SYNC_URL);
          const originalMessage = error.message;

          // Decorate the error with additional detail and notify
          error.message =
            `SYNC ERROR. siteName: ${siteName}, serverUrl: ${syncUrl}, ` +
            `syncRecord.id: ${syncRecord.id}, message: ${originalMessage}`;
          Bugsnag.notify(error);

          // Rethrow with user friendly message
          error.message = `There was an error syncing. Contact mSupply mobile support.\n${originalMessage}\n`;
          throw error;
        }
      });
    });
  }

  /**
   * Sends the sync server a message to indicate the sync records have been consumed.
   *
   * @param   {array}  records  Sync records that have been integrated.
   * @return  {none}
   */
  acknowledgeRecords = async records => {
    const syncIds = records.map(record => record.SyncID);

    const requestBody = {
      SyncRecordIDs: syncIds,
    };

    await this.fetchWrapper(
      `${this.serverURL}/sync/v3/acknowledged_records?from_site=${this.thisSiteId}&to_site=${this.serverId}`,
      {
        method: 'POST',
        headers: {
          Authorization: this.authHeader,
          ...this.extraHeaders,
        },
        body: JSON.stringify(requestBody),
      }
    );
  };

  /**
   * Closure for handling adjusting the batch size that sync uses.
   *
   * @return  {function}  A closure function that when called ends timing and adjusts batch size.
   */
  batchSizeAdjustor = () => {
    const start = Date.now();
    return () => {
      const timeTaken = (Date.now() - start) / 1000;
      const durationPerRecord = timeTaken / this.batchSize;
      const optimalBatchSize = OPTIMAL_BATCH_SPEED / durationPerRecord;
      let newBatchSize = optimalBatchSize;

      newBatchSize = Math.floor(newBatchSize);
      newBatchSize = Math.max(newBatchSize, MIN_SYNC_BATCH_SIZE);
      newBatchSize = Math.min(newBatchSize, MAX_SYNC_BATCH_SIZE);

      this.batchSize = newBatchSize;
    };
  };
}

export default Synchroniser;
