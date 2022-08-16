/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */

import moment from 'moment';
import querystring from 'querystring';
import Bugsnag from '@bugsnag/react-native';
import { getAuthHeader, AUTH_ERROR_CODES } from 'sussol-utilities';
import LoggerService from '../utilities/logging';

import { UIDatabase } from '../database';
import { createRecord, parseBoolean, parseDate, parseNumber } from '../database/utilities';
import { sortDataBy } from '../utilities';
import { SETTINGS_KEYS } from '../settings/index';
import { generalStrings } from '../localization/index';

const ERROR_CODES = {
  ...AUTH_ERROR_CODES,
  EMPTY_RESPONSE: 'No records found',
};

const RESOURCES = {
  PATIENT: '/api/v4/patient',
  PATIENT_HISTORY: '/api/v4/patient_history',
  PRESCRIBER: '/api/v4/prescriber',
  NAME_STORE_JOIN: '/api/v4/name_store_join',
};

const TYPES = {
  STRING: 'string',
  DATE: 'date',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
};

const PARAMETERS = {
  firstName: { key: 'first_name', type: TYPES.STRING },
  lastName: { key: 'last_name', type: TYPES.STRING },
  dateOfBirth: { key: 'dob', type: TYPES.DATE },
  policyNumber: { key: 'policy_number', type: TYPES.STRING },
  barcode: { key: 'barcode', type: TYPES.STRING },
  registrationCode: { key: 'code', type: TYPES.STRING },
  limit: { key: 'limit', type: TYPES.NUMBER },
  offset: { key: 'offset', type: TYPES.NUMBER },
  isDeleted: { key: 'is_deleted', type: TYPES.BOOLEAN },
};

class BugsnagError extends Error {
  constructor(message, data, ...args) {
    super(message, ...args);
    Bugsnag.notify(this, report => {
      report.errorMessage = message;
      report.metadata = data;
    });
  }
}

const logger = LoggerService.createLogger('Authentication');

export const getServerURL = () => UIDatabase.getSetting(SETTINGS_KEYS.SYNC_URL);

export const getAuthorizationHeader = () => {
  const username = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_NAME);
  const password = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_PASSWORD_HASH);
  return getAuthHeader(username, password);
};

export const createPatientRecord = patient => {
  patient?.policies?.forEach(createPolicyRecord);
};

export const createPolicyRecord = policy => {
  const { nameId, enteredById, insuranceProviderId } = policy;
  const enteredBy = UIDatabase.getOrCreate('User', enteredById);
  const patient = UIDatabase.getOrCreate('Name', nameId);
  const insuranceProvider = UIDatabase.getOrCreate('InsuranceProvider', insuranceProviderId);
  const policyRecord = { ...policy, enteredBy, patient, insuranceProvider };
  UIDatabase.write(() => createRecord(UIDatabase, 'InsurancePolicy', policyRecord));
};

const getQueryString = params => {
  const query = params.reduce((queryObject, param) => {
    const [[key, value], [, type]] = Object.entries(param);

    // We still want to allow false to pass through
    if (value === '' || value === null || value === undefined) return queryObject;

    const formatter = {
      [TYPES.STRING]: string => `@${string}@`,
      [TYPES.DATE]: date => moment(date).format('DDMMYYYY'),
      [TYPES.NUMBER]: number => Number(number),
      [TYPES.BOOLEAN]: boolean => Boolean(boolean),
    };

    return { ...queryObject, [key]: formatter[type](value) };
  }, {});
  return `?${querystring.stringify(query)}`;
};

const getPrescriberQueryString = ({ firstName = '', lastName = '', registrationCode = '' }) => {
  const queryParams = [
    { [PARAMETERS.firstName.key]: firstName, type: PARAMETERS.firstName.type },
    { [PARAMETERS.lastName.key]: lastName, type: PARAMETERS.lastName.type },
    { [PARAMETERS.registrationCode.key]: registrationCode, type: PARAMETERS.registrationCode.type },
  ];
  return getQueryString(queryParams);
};

const getPatientQueryString = ({
  firstName = '',
  lastName = '',
  barcode = '',
  dateOfBirth = '',
  policyNumber = '',
  isDeleted = false,
  limit = null,
  offset = null,
} = {}) => {
  const queryParams = [
    { [PARAMETERS.firstName.key]: firstName, type: PARAMETERS.firstName.type },
    { [PARAMETERS.lastName.key]: lastName, type: PARAMETERS.lastName.type },
    { [PARAMETERS.barcode.key]: barcode, type: PARAMETERS.barcode.type },
    { [PARAMETERS.isDeleted.key]: isDeleted, type: PARAMETERS.isDeleted.type },
    { [PARAMETERS.dateOfBirth.key]: dateOfBirth, type: PARAMETERS.dateOfBirth.type },
    { [PARAMETERS.policyNumber.key]: policyNumber, type: PARAMETERS.policyNumber.type },
    { [PARAMETERS.offset.key]: offset, type: PARAMETERS.offset.type },
    { [PARAMETERS.limit.key]: limit, type: PARAMETERS.limit.type },
  ];

  return getQueryString(queryParams);
};

export const getPatientRequestUrl = params => {
  const endpoint = RESOURCES.PATIENT;
  const queryString = getPatientQueryString(params);
  return endpoint + queryString;
};

export const getPatientHistoryRequestUrl = id => {
  const endpoint = RESOURCES.PATIENT_HISTORY;
  const queryString = `?id=${id}`;
  return `${endpoint}${queryString}`;
};

export const getPrescriberRequestUrl = params => {
  const endpoint = RESOURCES.PRESCRIBER;
  const queryString = getPrescriberQueryString(params);
  return endpoint + queryString;
};

const processNameNoteResponse = response =>
  response.map(
    ({
      ID: id,
      data,
      patient_event_ID: patientEventID,
      name_ID: nameID,
      entry_date: entryDate,
      is_deleted: isDeleted,
    }) => ({
      id,
      data,
      patientEventID,
      nameID,
      entryDate: moment(entryDate).isValid() ? moment(entryDate).toDate() : moment().toDate(),
      isDeleted,
    })
  );

const processInsuranceResponse = response =>
  response.map(
    ({
      ID: id,
      insuranceProviderID: insuranceProviderId,
      nameID: nameId,
      policyNumberFamily,
      policyNumberPerson,
      discountRate,
      expiryDate,
      isActive,
      enteredByID: enteredById,
      type,
    }) => ({
      id,
      insuranceProviderId,
      nameId,
      policyNumberFamily,
      policyNumberPerson,
      discountRate: parseNumber(discountRate),
      expiryDate: parseDate(expiryDate),
      isActive: parseBoolean(isActive),
      enteredById,
      type,
    })
  );

const processResponse = response => {
  const { ok, status, url, headers, json } = response;
  if (ok) {
    const { error: responseError } = json;
    if (responseError) throw new BugsnagError(responseError, { url, headers });
    if (!json.length) throw new Error(ERROR_CODES.EMPTY_RESPONSE);
    return json;
  }
  switch (status) {
    case 400:
    default:
      logger.error('lookupApiUtils::processResponse returned an error');
      throw new Error(ERROR_CODES.CONNECTION_FAILURE);
    case 401:
      throw new BugsnagError(ERROR_CODES.INVALID_PASSWORD, { url, headers });
  }
};

export const getPatientHistoryResponseProcessor = ({
  isVaccineDispensingModal,
  sortKey,
  isAscending = true,
}) => response => {
  const result = processResponse(response);
  const patientHistory = [];
  result.forEach(({ clinician, confirm_date, transLines }) =>
    transLines.forEach(
      ({
        ID: id,
        quantity: totalQuantity,
        item_name: itemName,
        itemLine,
        medicineAdministrator,
      }) => {
        const receivedItemLine = itemLine || { item: { doses: 0, code: 'N/A' } };
        const { item } = receivedItemLine;
        const { code: itemCode, doses } = item;
        const prescriber = clinician
          ? `${clinician.first_name} ${clinician.last_name}`.trim()
          : generalStrings.not_available;
        const vaccinator = medicineAdministrator
          ? `${medicineAdministrator.first_name} ${medicineAdministrator.last_name}`.trim()
          : generalStrings.not_available;

        if (isVaccineDispensingModal && !item?.is_vaccine) return;
        const confirmDate = parseDate(confirm_date);

        patientHistory.push({
          id,
          confirmDate,
          prescriptionDate: confirmDate,
          doses: totalQuantity * doses,
          itemCode,
          itemName,
          prescriber,
          totalQuantity: item.is_vaccine ? totalQuantity * doses : totalQuantity,
          vaccinator,
          prescriberOrVaccinator: medicineAdministrator ? vaccinator : prescriber,
        });
      }
    )
  );

  return patientHistory ? sortDataBy(patientHistory.slice(), sortKey, isAscending) : patientHistory;
};

export const processPatientResponse = response => {
  const result = processResponse(response);
  return result.map(
    ({
      ID: id,
      name,
      code,
      barcode,
      phone: phoneNumber,
      bill_address1: addressOne,
      bill_address2: addressTwo,
      bill_postal_zip_code: billPostalZipCode,
      email: emailAddress,
      supplying_store_id: supplyingStoreId,
      first: firstName,
      middle: middleName,
      last: lastName,
      date_of_birth,
      nameInsuranceJoin,
      nameNotes,
      female,
      nationality_ID,
      ethnicity_ID,
    }) => ({
      id,
      name,
      barcode,
      code,
      phoneNumber,
      addressOne,
      addressTwo,
      billPostalZipCode,
      emailAddress,
      supplyingStoreId,
      firstName,
      middleName,
      lastName,
      nationality: UIDatabase.get('Nationality', nationality_ID),
      ethnicity: UIDatabase.get('Ethnicity', ethnicity_ID),
      dateOfBirth: parseDate(date_of_birth),
      policies: processInsuranceResponse(nameInsuranceJoin),
      nameNotes: processNameNoteResponse(nameNotes),
      female,
    })
  );
};

export const processPrescriberResponse = response =>
  processResponse(response).map(
    ({
      ID,
      first_name,
      last_name,
      registration_code,
      address1,
      address2,
      phone,
      mobile,
      email,
      store_ID,
    }) => ({
      id: ID,
      firstName: first_name,
      lastName: last_name,
      registrationCode: registration_code,
      addressOne: address1,
      addressTwo: address2,
      phoneNumber: phone,
      mobileNumber: mobile,
      emailAddress: email,
      storeId: store_ID,
    })
  );

export const createPatientVisibility = async name => {
  const thisStoreID = UIDatabase.getSetting(SETTINGS_KEYS.THIS_STORE_ID);
  const { id: nameID } = name;

  const nameExists = UIDatabase.get('Name', nameID);

  if (nameExists) return true;

  const body = { store_ID: thisStoreID, name_ID: nameID };

  try {
    const response = await fetch(`${getServerURL()}${RESOURCES.NAME_STORE_JOIN}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        authorization: getAuthorizationHeader(),
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return response.status === 200;
  } catch {
    // If there was an error, just return false
    return false;
  }
};
