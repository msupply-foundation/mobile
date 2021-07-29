/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import { UIDatabase } from '../database/index';

const PATIENT_SURVEY_TYPE = 'PatientSurvey';
const VACCINE_SUPPLEMENTAL_DATA = 'VaccineSupplementalData';

export const selectSurveySchemas = () => selectFormSchema(`type=='${PATIENT_SURVEY_TYPE}'`);

export const selectSupplementalDataSchemas = () =>
  selectFormSchema(`type=='${VACCINE_SUPPLEMENTAL_DATA}'`);

const selectFormSchema = filter =>
  UIDatabase.objects('FormSchema').filtered(filter).sorted('version', true);
