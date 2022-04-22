/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import { UIDatabase } from '../database/index';

const PATIENT_SURVEY_TYPE = 'PatientSurvey';
const VACCINE_SUPPLEMENTAL_DATA = 'VaccineSupplementalData';
const VACCINATION_EVENT = 'VaccinationEvent';

export const selectSurveySchemas = () => selectFormSchema(`type=='${PATIENT_SURVEY_TYPE}'`);

export const selectSupplementalDataSchemas = () =>
  selectFormSchema(`type=='${VACCINE_SUPPLEMENTAL_DATA}'`);

export const selectVaccinationEventSchemas = () => selectFormSchema(`type=='${VACCINATION_EVENT}'`);

const selectFormSchema = filter =>
  UIDatabase.objects('FormSchema').filtered(filter).sorted('version', true);
