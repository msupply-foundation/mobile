/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import moment from 'moment';
import french from 'moment/locale/fr';
import english from 'moment/locale/en-nz';
import spanish from 'moment/locale/es';

import {
  authStrings,
  buttonStrings,
  generalStrings,
  modalStrings,
  navStrings,
  pageInfoStrings,
  programStrings,
  syncStrings,
  tableStrings,
  LANGUAGE_CODES,
  formInputStrings,
  dispensingStrings,
  vaccineStrings,
} from './index';

const DATE_CONFIGS = {
  DEFAULT: english,
  [LANGUAGE_CODES.FRENCH]: french,
  [LANGUAGE_CODES.SPANISH]: spanish,
};

const SUPPORTED_DATE_LOCALES = {
  DEFAULT: 'en-nz',
  [LANGUAGE_CODES.ENGLISH]: 'en-nz',
  [LANGUAGE_CODES.FRENCH]: 'fr',
  [LANGUAGE_CODES.SPANISH]: 'es',
};

export const setDateLocale = languageCode =>
  moment.updateLocale(
    SUPPORTED_DATE_LOCALES[languageCode] ?? SUPPORTED_DATE_LOCALES.DEFAULT,
    DATE_CONFIGS[languageCode] ?? DATE_CONFIGS.DEFAULT
  );

export function setCurrentLanguage(language) {
  authStrings.setLanguage(language);
  buttonStrings.setLanguage(language);
  generalStrings.setLanguage(language);
  modalStrings.setLanguage(language);
  navStrings.setLanguage(language);
  pageInfoStrings.setLanguage(language);
  tableStrings.setLanguage(language);
  syncStrings.setLanguage(language);
  programStrings.setLanguage(language);
  formInputStrings.setLanguage(language);
  dispensingStrings.setLanguage(language);
  vaccineStrings.setLanguage(language);
}

export default setCurrentLanguage;
