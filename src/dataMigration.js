import packageJson from '../package.json';
import compareVersions from 'semver-compare';
import { SETTINGS_KEYS } from './settings';
import { AsyncStorage } from 'react-native';

const APP_VERSION_KEY = 'AppVersion';

export async function migrateDataToVersion(database, settings) {
  // Get the current version we are upgrading from
  let fromVersion;
  try {
    // First check for the old app version in local storage, our current way of storing it
    fromVersion = await AsyncStorage.getItem(APP_VERSION_KEY);
  } catch (error) {
    // Silently ignore errors in getting app version, and try alternatives below
  }
  // If app version not correctly retrieved from local storage, check settings (our old way)
  if (!fromVersion || fromVersion.length === 0) {
    fromVersion = settings.get(SETTINGS_KEYS.APP_VERSION);
    // Move app version into local storage and out of settings
    AsyncStorage.setItem(APP_VERSION_KEY, fromVersion);
    settings.delete(SETTINGS_KEYS.APP_VERSION);
  }
  // If it was in neither local storage or settings, just set it to 0.0.0
  if (!fromVersion || fromVersion.length === 0) {
    fromVersion = '0.0.0';
  }
  // Get the new version we are upgrading to
  const toVersion = packageJson.version;
  // If the version has not changed, we are not upgrading, so don't do anything
  if (fromVersion === toVersion) return;
  // Do any required version update data migrations
  for (const migration of dataMigrations) {
    if (compareVersions(fromVersion, migration.version) < 0 &&
        compareVersions(toVersion, migration.version) >= 0) {
      migration.migrate(database, settings);
    }
  }
  // Record the new app version
  AsyncStorage.setItem(APP_VERSION_KEY, toVersion);
}

// All data migration functions should be kept in this array, in sequential order. Each migration
// needs a 'version' key, denoting the version that migration will migrate to, and a 'migrate' key,
// which is a function taking the database and the settings and performs the migration
const dataMigrations = [
  {
    version: '1.0.30',
    migrate: (database, settings) => {
      // 1.0.30 added the setting 'SYNC_IS_INITIALISED', where it previously relied on 'SYNC_URL'
      const syncURL = settings.get(SETTINGS_KEYS.SYNC_URL);
      if (syncURL && syncURL.length > 0) settings.set(SETTINGS_KEYS.SYNC_IS_INITIALISED, 'true');
    },
  },
  {
    version: '1.2.0',
    migrate: (database, settings) => {
      const nameResults = database.objects('Name').filtered('id = $0',
                                settings.get(SETTINGS_KEYS.SUPPLYING_STORE_NAME_ID));
      if (nameResults.length < 1) return;
      const mainSupplyingStoreName = nameResults[0];

      let requisitions = database.objects('Requisition').filtered('supplyingStoreName = Null');

      requisitions = requisitions.filter(requisition => !requisition.isFinalised);

      database.write(() => {
        requisitions.forEach(requisition => {
          requisition.supplyingStoreName = mainSupplyingStoreName;
        });
      });
    },
  },
];
