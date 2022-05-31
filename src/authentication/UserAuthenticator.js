/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import DeviceInfo from 'react-native-device-info';

import { hashPassword } from 'sussol-utilities';
import { AUTH_ERROR_CODES, authenticateAsync } from './Helpers';
import LoggerService from '../utilities/logging';

import { SETTINGS_KEYS } from '../settings';

const { SYNC_URL, THIS_STORE_ID } = SETTINGS_KEYS;

const { CONNECTION_FAILURE, INVALID_PASSWORD } = AUTH_ERROR_CODES;

const AUTH_ENDPOINT = '/sync/v3/user';

const CONNECTION_TIMEOUT_PERIOD = 10 * 1000; // 10 second timeout for authenticating connection.

const logger = LoggerService.createLogger('Authentication');

export class UserAuthenticator {
  constructor(database, settings) {
    this.database = database;
    this.settings = settings;
    this.activeUsername = '';
    this.activePassword = '';
    this.extraHeaders = { 'msupply-site-uuid': DeviceInfo.getUniqueId() };
  }

  /**
   * Check whether username and password are valid. If internet is available,
   * this is done on server-side. Otherwise, credentials are compared with those
   * cached in local storage.
   *
   * On successful authentication, save the details in the database.
   *
   * @param  {string}  username  Username to test.
   * @param  {string}  password  Password to test.
   */
  async authenticate(username, password) {
    if (username.length === 0) throw new Error('Enter a username');
    if (password.length === 0) throw new Error('Enter a password');

    this.activeUsername = username;
    this.activePassword = password;

    // Hash the password.
    const passwordHash = hashPassword(password);

    // Get the cached user from the database, if exists.
    let user = this.database.objects('User').filtered('username == $0', username)[0];

    // Get the HTTP endpoint to use for authentication.
    const serverURL = this.settings.get(SYNC_URL);
    if (serverURL.length === 0) {
      // No valid server URL configured, fail early.
      throw new Error('Server URL not configured');
    }
    const authURL = `${serverURL}${AUTH_ENDPOINT}?store=${this.settings.get(THIS_STORE_ID)}`;

    try {
      // Race condition promise, if connection is taking to long will be rejected
      // with CONNECTION_FAILURE error.
      const userJson = await Promise.race([
        authenticateAsync(authURL, username, passwordHash, { ...this.extraHeaders }),
        createConnectionTimeoutPromise(),
      ]);
      if (userJson && userJson.error) {
        throw new Error(userJson.error);
      }

      if (userJson === undefined) {
        throw new Error(`userJson is undefined.Server Url ${serverURL}`);
      }

      if (!userJson || !userJson.UserID) {
        throw new Error('Unexpected response from server');
      }

      // Success, save user to database.
      this.database.write(() => {
        user = this.database.update('User', {
          id: userJson.UserID,
          username,
          passwordHash,
          isAdmin: userJson.isAdmin || false,
        });
      });
    } catch (error) {
      logger.error(error);

      // If there was an error with connection, check against locally cached credentials.
      if (error.message === CONNECTION_FAILURE && user) {
        if (user.username === username && user.passwordHash === passwordHash) {
          // Entered credentials match cached credentials, allow offline login.
          return user;
        }
        throw new Error(INVALID_PASSWORD); // Did not match cached credentials, throw error.
      }
      // If anything other than connection failure, and currently cached password
      // was used, wipe that password from the cache (may now be invalid).
      if (user && user.passwordHash === passwordHash) {
        this.database.write(() => {
          user.passwordHash = '';
          this.database.save('User', user);
        });
      }
      throw error;
    }
    return user;
  }

  /**
   * Check that the user details are still valid.
   *
   * @param  {function}  onAuthentication  A callback function expecting a user
   *                                       parameter that will be either the successfully
   *                                       authenticated user, or null on failure.
   */
  async reauthenticate(onAuthentication) {
    if (!this.activeUsername || !this.activePassword) onAuthentication(false);
    try {
      const user = await this.authenticate(this.activeUsername, this.activePassword);
      onAuthentication(user);
    } catch (error) {
      onAuthentication(null);
    }
  }
}

// Promise will be called parallel to authenticating connection.
const createConnectionTimeoutPromise = () =>
  new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      logger.error('UserAuthenticator: connection timeout');
      reject(new Error(CONNECTION_FAILURE));
    }, CONNECTION_TIMEOUT_PERIOD);
  });

export default UserAuthenticator;
