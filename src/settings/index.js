import { AsyncStorage } from 'react-native';

export { MobileAppSettings } from './MobileAppSettings';
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
};
export async function getAppVersion() {
  const appVersion = await AsyncStorage.getItem(SETTINGS_KEYS.APP_VERSION);
  return appVersion;
}
