import { MILLISECONDS } from '../utilities/constants';

export const SETTINGS_KEYS = {
  APP_VERSION: 'AppVersion',
  CURRENT_LANGUAGE: 'CurrentLanguage',
  MOST_RECENT_USERNAME: 'MostRecentUsername',
  SUPPLYING_STORE_ID: 'SupplyingStoreId',
  SUPPLYING_STORE_NAME_ID: 'SupplyingStoreNameId',
  LAST_POST_PROCESSING_FAILED: 'LastPostProcessingFailed',
  SYNC_IS_INITIALISED: 'SyncIsInitialised',
  SYNC_PRIOR_FAILED: 'SyncPriorFailed',
  SYNC_URL: 'SyncURL',
  SYNC_SITE_ID: 'SyncSiteId',
  SYNC_SERVER_ID: 'SyncServerId',
  SYNC_SITE_NAME: 'SyncSiteName',
  SYNC_SITE_PASSWORD_HASH: 'SyncSitePasswordHash',
  THIS_STORE_ID: 'ThisStoreId',
  THIS_STORE_NAME_ID: 'ThisStoreNameId',
  THIS_STORE_TAGS: 'ThisStoreTags',
  THIS_STORE_CODE: 'ThisStoreCode',
  SYNC_INTERVAL: 'SyncInterval',
  IDLE_LOGOUT_INTERVAL: 'IdleLogoutInterval',
  ME_PREDICTION_URL: 'MEPredictionURL',
  ME_PREDICTION_API_KEY: 'MEPredictionAPIKey',
};

export const SETTINGS_DEFAULTS = {
  [SETTINGS_KEYS.SYNC_INTERVAL]: String(MILLISECONDS.TEN_MINUTES),
  [SETTINGS_KEYS.IDLE_LOGOUT_INTERVAL]: String(MILLISECONDS.THREE_MINUTES),
};
