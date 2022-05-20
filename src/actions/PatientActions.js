/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { batch } from 'react-redux';

import { createRecord, UIDatabase } from '../database';
import { selectCurrentUser } from '../selectors/user';

import { createPatientVisibility } from '../sync/lookupApiUtils';
import { DispensaryActions } from './DispensaryActions';

export const PATIENT_ACTIONS = {
  PATIENT_EDIT: 'Patient/patientEdit',
  PATIENT_CREATION: 'Patient/patientCreation',
  VIEW_HISTORY: 'Patient/viewHistory',
  CLOSE_HISTORY: 'Patient/closeHistory',
  SORT_HISTORY: 'Patient/sortHistory',
  COMPLETE: 'Patient/complete',
  NEW_ADR: 'Patient/newADR',
  SAVE_ADR: 'Patient/saveADR',
  CANCEL_ADR: 'Patient/cancelADR',
  REFRESH: 'Patient/refresh',
};

const closeModal = () => ({ type: PATIENT_ACTIONS.COMPLETE });
const createPatient = patient => ({ type: PATIENT_ACTIONS.PATIENT_CREATION, payload: { patient } });
const editPatient = patient => ({ type: PATIENT_ACTIONS.PATIENT_EDIT, payload: { patient } });
const refresh = () => ({ type: PATIENT_ACTIONS.REFRESH });

const makePatientVisibility = async name => {
  const response = await createPatientVisibility(name);
  return response;
};

const patientUpdate = patientDetails => async (dispatch, getState) => {
  const { patient } = getState();
  const { currentPatient } = patient;

  const {
    id: currentPatientId,
    code: currentCode,
    barcode: currentBarcode,
    name: currentName,
    firstName: currentFirstName,
    middleName: currentMiddleName,
    lastName: currentLastName,
    dateOfBirth: currentDateOfBirth,
    emailAddress: currentEmailAddress,
    phoneNumber: currentPhoneNumber,
    billingAddress: currentBillingAddress,
    country: currentCountry,
    supplyingStoreId: currentSupplyingStoreId,
    isActive: currentIsActive,
    isDeceased: currentIsDeceased,
    female: currentFemale,
    ethnicity: currentEthnicity,
    nationality: currentNationality,
    createdDate,
  } = currentPatient ?? {};

  const {
    id: currentBillAddressId,
    line1: currentLine1,
    line2: currentLine2,
    zipCode: currentZipCode,
  } = currentBillingAddress ?? {};

  const {
    id: patientId,
    code: patientCode,
    barcode: patientBarcode,
    firstName: patientFirstName,
    middleName: patientMiddleName,
    lastName: patientLastName,
    dateOfBirth: patientDateOfBirth,
    emailAddress: patientEmailAddress,
    phoneNumber: patientPhoneNumber,
    addressOne: patientLine1,
    addressTwo: patientLine2,
    billPostalZipCode: patientPostalZipCode,
    country: patientCountry,
    supplyingStoreId: patientSupplyingStoreId,
    female: patientFemale,
    isDeceased: patientIsDeceased,
    ethnicity: patientEthnicity,
    nationality: patientNationality,
  } = patientDetails ?? {};

  const id = patientId ?? currentPatientId;
  const code = patientCode ?? currentCode;
  const barcode = patientBarcode ?? currentBarcode;
  const firstName = patientFirstName ?? currentFirstName;
  const middleName = patientMiddleName ?? currentMiddleName;
  const lastName = patientLastName ?? currentLastName;
  const name = `${lastName}, ${firstName}` || currentName;
  const dateOfBirth = patientDateOfBirth ?? currentDateOfBirth;
  const emailAddress = patientEmailAddress ?? currentEmailAddress;
  const phoneNumber = patientPhoneNumber ?? currentPhoneNumber;
  const billAddressId = currentBillAddressId;
  const addressOne = patientLine1 ?? currentLine1;
  const addressTwo = patientLine2 ?? currentLine2;
  const billPostalZipCode = patientPostalZipCode ?? currentZipCode;
  const country = patientCountry ?? currentCountry;
  const female = patientFemale ?? currentFemale;
  const isDeceased = patientIsDeceased ?? currentIsDeceased;
  const supplyingStoreId = patientSupplyingStoreId ?? currentSupplyingStoreId;
  const isActive = currentIsActive;
  const ethnicity = patientEthnicity ?? currentEthnicity;
  const nationality = patientNationality ?? currentNationality;

  const patientRecord = {
    id,
    code,
    barcode,
    firstName,
    middleName,
    lastName,
    name,
    dateOfBirth,
    emailAddress,
    phoneNumber,
    billAddressId,
    addressOne,
    addressTwo,
    billPostalZipCode,
    country,
    female,
    isDeceased,
    supplyingStoreId,
    isActive,
    ethnicity,
    nationality,
    createdDate,
  };

  UIDatabase.write(() => createRecord(UIDatabase, 'Patient', patientRecord));

  batch(() => {
    dispatch(closeModal());
    dispatch(DispensaryActions.closeLookupModal());
    dispatch(DispensaryActions.refresh());
    dispatch(PatientActions.refresh());
  });
};

const sortPatientHistory = sortKey => ({
  type: PATIENT_ACTIONS.SORT_HISTORY,
  payload: { sortKey },
});

const viewPatientHistory = patient => ({
  type: PATIENT_ACTIONS.VIEW_HISTORY,
  payload: { patient },
});

const closePatientHistory = () => ({ type: PATIENT_ACTIONS.CLOSE_HISTORY });

const openADRModal = patientID => {
  const patient = UIDatabase.get('Name', patientID);
  return { type: PATIENT_ACTIONS.NEW_ADR, payload: { patient } };
};

const closeADRModal = () => ({ type: PATIENT_ACTIONS.CANCEL_ADR });

const saveADR = (patient, formData) => (dispatch, getState) => {
  const user = selectCurrentUser(getState());

  UIDatabase.write(() => {
    createRecord(UIDatabase, 'AdverseDrugReaction', patient, formData, user);
  });

  dispatch({ type: PATIENT_ACTIONS.SAVE_ADR });
};

export const PatientActions = {
  saveADR,
  openADRModal,
  closeADRModal,
  createPatient,
  patientUpdate,
  editPatient,
  closeModal,
  sortPatientHistory,
  viewPatientHistory,
  closePatientHistory,
  makePatientVisibility,
  refresh,
};
