/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import DeviceInfo from 'react-native-device-info';

import { getAuthHeader, hashPassword } from 'sussol-utilities';
import { authenticateAsync } from './Helpers';
import packageJson from '../../package.json';

import { SERVER_COMPATIBILITIES } from '../sync/constants';
import { SETTINGS_KEYS } from '../settings';
import { authStrings } from '../localization';

const {
  SUPPLYING_STORE_ID,
  SUPPLYING_STORE_NAME_ID,
  SYNC_URL,
  SYNC_SERVER_ID,
  SYNC_SITE_ID,
  SYNC_SITE_NAME,
  SYNC_SITE_PASSWORD_HASH,
  THIS_STORE_ID,
  THIS_STORE_NAME_ID,
} = SETTINGS_KEYS;

const AUTH_ENDPOINT = '/sync/v3/site';

export class SyncAuthenticator {
  constructor(settings) {
    this.settings = settings;
    this.extraHeaders = { 'msupply-site-uuid': DeviceInfo.getUniqueId() };
  }

  /**
   * Validate username and password on server-side. On successful authentication,
   * save the details in settings.
   *
   * @param  {string}    username          The sync site username to test
   * @param  {string}    password          The password to test
   * @param  {function}  onAuthentication  The function to call on authentication, with
   *                                       a boolean parameter representing success, and
   *                                       any error message as a second parameter
   * @return {none}
   */
  async authenticate(serverURL, username, password, hashedPassword) {
    if (serverURL.length === 0) throw new Error('Enter a server URL');
    if (username.length === 0) throw new Error('Enter the sync site username');
    if (!password && !hashedPassword) throw new Error('Enter the sync site password');

    // Hash the password.
    const passwordHash = hashedPassword ?? hashPassword(password);

    const authURL = `${serverURL}${AUTH_ENDPOINT}`;

    const responseJson = await authenticateAsync(authURL, username, passwordHash, {
      ...this.extraHeaders,
    });

    const { version: appVersion } = packageJson;
    const [majorAppVersion] = appVersion.split('.');
    const { ServerVersion: serverVersion } = responseJson;

    if (serverVersion < SERVER_COMPATIBILITIES[majorAppVersion]) {
      throw new Error(authStrings.incompatible_server);
    }

    this.settings.set(SYNC_URL, serverURL);
    this.settings.set(SYNC_SITE_NAME, username);
    this.settings.set(SYNC_SITE_PASSWORD_HASH, passwordHash);
    this.settings.set(SYNC_SERVER_ID, responseJson.ServerID);
    this.settings.set(SYNC_SITE_ID, responseJson.SiteID);
    this.settings.set(THIS_STORE_ID, responseJson.StoreID);
    this.settings.set(THIS_STORE_NAME_ID, responseJson.NameID);
    this.settings.set(SUPPLYING_STORE_ID, responseJson.SupplyingStoreID);
    this.settings.set(SUPPLYING_STORE_NAME_ID, responseJson.SupplyingStoreNameID);
  }

  /**
   * Returns the basic base64 encoded authorization header value for this sync site.
   *
   * @return  {string}  Authorization header value.
   */
  getAuthHeader() {
    const username = this.settings.get(SYNC_SITE_NAME);
    const password = this.settings.get(SYNC_SITE_PASSWORD_HASH);
    return getAuthHeader(username, password);
  }
}

export default SyncAuthenticator;
