import { getAuthHeader } from 'sussol-utilities';
import validUrl from 'valid-url';

export const AUTH_ERROR_CODES = {
  CONNECTION_FAILURE: 'Unable to connect',
  INVALID_URL: 'Invalid URL',
  INVALID_PASSWORD: 'Invalid username or password',
  MISSING_CREDENTIALS: 'Missing username and/or password',
  PARSING_ERROR: 'Unable to parse server response',
  LICENSE_ERROR: 'The server reported a license error',
};

/**
 * Check whether the username and password are valid given an authentication URL.
 * @param  {string}   authURL   The URL to authenticate against
 * @param  {string}   username  The username to test
 * @param  {string}   password  The password to test
 * @param  {object}   extraHeaders Extra headers to add to authentication request
 * @return {object}             JSON formatted response object
 */

interface AuthenticationResponse {
  NameID?: string;
  ServerID?: number;
  ServerVersion?: number;
  SiteID?: number;
  StoreID?: string;
  SupplyingStoreID?: string;
  SupplyingStoreNameID?: string;
  error?: string;
  lines?: any[];
  UserID?: string;
  isAdmin?: boolean;
}

export const authenticateAsync = async (
  authURL: string,
  username: string,
  password: string,
  extraHeaders: object = {}
): Promise<AuthenticationResponse> => {
  if (!validUrl.isWebUri(authURL)) throw new Error(AUTH_ERROR_CODES.INVALID_URL);
  if (username.length === 0 || password.length === 0) {
    // Missing username or password
    throw new Error(AUTH_ERROR_CODES.MISSING_CREDENTIALS);
  }

  let responseJson: AuthenticationResponse = {};
  let bodyText = '';
  try {
    const response = await fetch(authURL, {
      headers: {
        Authorization: getAuthHeader(username, password),
        ...extraHeaders,
      },
    });
    bodyText = await response.text();
    if (bodyText.includes("license number doesn't allow you to connect")) {
      responseJson.error = AUTH_ERROR_CODES.LICENSE_ERROR;
    }
  } catch {
    // (error) {
    // perhaps do something with (error as Error).message
    throw new Error(AUTH_ERROR_CODES.CONNECTION_FAILURE);
  }

  if (responseJson.error) {
    // Most often username/password invalid, but pass up server error
    throw new Error(responseJson.error);
  }

  try {
    responseJson = JSON.parse(bodyText);
  } catch (error) {
    throw new Error(AUTH_ERROR_CODES.PARSING_ERROR);
  }
  return responseJson;
};
