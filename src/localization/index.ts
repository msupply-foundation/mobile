/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import LocalizedStrings, { GlobalStrings } from 'react-native-localization';

import authStringsJSON from './authStrings.json';
import buttonStringsJSON from './buttonStrings.json';
import demoUserModalStringsJSON from './demoUserModalStrings.json';
import generalStringsJSON from './generalStrings.json';
import modalStringsJSON from './modalStrings.json';
import navStringsJSON from './navStrings.json';
import pageInfoStringsJSON from './pageInfoStrings.json';
import programStringsJSON from './programStrings.json';
import syncStringsJSON from './syncStrings.json';
import tableStringsJSON from './tableStrings.json';
import validationStringsJSON from './validationStrings.json';
import formInputStringsJSON from './formInputStrings.json';
import dispensingStringsJSON from './dispensingStrings.json';
import vaccineStringsJSON from './vaccineStrings.json';
import reportStringsJSON from './reportStrings.json';

/**
 * The GlobalStrings type contains the translations for all supported languages.
 * However, some languages have missing translations which lets TS derive a type that is not very
 * useful, i.e. when using the translation string only strings that are present in all languages
 * are easily accessibly.
 *
 * This type is supposed to be used to cast the GlobalStrings input type to a type that only
 * contains the gb strings.
 */
type GlobalStringsGB<
  T extends GlobalStrings<S>,
  S extends Record<string, string> = Record<string, string>
> = { gb: T['gb'] };

export const authStrings = new LocalizedStrings(
  authStringsJSON as GlobalStringsGB<typeof authStringsJSON>
);
export const buttonStrings = new LocalizedStrings(
  buttonStringsJSON as GlobalStringsGB<typeof buttonStringsJSON>
);
export const demoUserModalStrings = new LocalizedStrings(
  demoUserModalStringsJSON as GlobalStringsGB<typeof demoUserModalStringsJSON>
);
export const generalStrings = new LocalizedStrings(
  generalStringsJSON as GlobalStringsGB<typeof generalStringsJSON>
);
export const modalStrings = new LocalizedStrings(
  modalStringsJSON as GlobalStringsGB<typeof modalStringsJSON>
);
export const navStrings = new LocalizedStrings(
  navStringsJSON as GlobalStringsGB<typeof navStringsJSON>
);
export const pageInfoStrings = new LocalizedStrings(
  pageInfoStringsJSON as GlobalStringsGB<typeof pageInfoStringsJSON>
);
export const programStrings = new LocalizedStrings(
  programStringsJSON as GlobalStringsGB<typeof programStringsJSON>
);
export const syncStrings = new LocalizedStrings(
  syncStringsJSON as GlobalStringsGB<typeof syncStringsJSON>
);
export const tableStrings = new LocalizedStrings(
  tableStringsJSON as GlobalStringsGB<typeof tableStringsJSON>
);
export const validationStrings = new LocalizedStrings(
  validationStringsJSON as GlobalStringsGB<typeof validationStringsJSON>
);
export const formInputStrings = new LocalizedStrings(
  formInputStringsJSON as GlobalStringsGB<typeof formInputStringsJSON>
);
export const dispensingStrings = new LocalizedStrings(
  dispensingStringsJSON as GlobalStringsGB<typeof dispensingStringsJSON>
);
export const vaccineStrings = new LocalizedStrings(
  vaccineStringsJSON as GlobalStringsGB<typeof vaccineStringsJSON>
);
export const reportStrings = new LocalizedStrings(
  reportStringsJSON as GlobalStringsGB<typeof reportStringsJSON>
);

export const LANGUAGE_CODES = {
  ENGLISH: 'gb',
  FRENCH: 'fr',
  KIRIBATI: 'gil',
  LAOS: 'la',
  MYANMAR: 'my',
  PORTUGUESE: 'pt',
  SPANISH: 'es',
  TETUM: 'tl',
  CHINESE: 'ch',
};

export const LANGUAGE_NAMES = {
  [LANGUAGE_CODES.ENGLISH]: 'English',
  [LANGUAGE_CODES.FRENCH]: 'Français',
  [LANGUAGE_CODES.KIRIBATI]: 'Te taetae ni Kiribati',
  [LANGUAGE_CODES.LAOS]: 'ພາສາລາວ',
  [LANGUAGE_CODES.MYANMAR]: 'မြန်မာဘာသာစကား',
  [LANGUAGE_CODES.PORTUGUESE]: 'Português',
  [LANGUAGE_CODES.SPANISH]: 'Spanish',
  [LANGUAGE_CODES.TETUM]: 'Tetum',
  [LANGUAGE_CODES.CHINESE]: 'Chinese',
};

export const LANGUAGE_CHOICE = [
  { code: LANGUAGE_CODES.ENGLISH, name: LANGUAGE_NAMES[LANGUAGE_CODES.ENGLISH] },
  { code: LANGUAGE_CODES.FRENCH, name: LANGUAGE_NAMES[LANGUAGE_CODES.FRENCH] },
  { code: LANGUAGE_CODES.KIRIBATI, name: LANGUAGE_NAMES[LANGUAGE_CODES.KIRIBATI] },
  { code: LANGUAGE_CODES.LAOS, name: LANGUAGE_NAMES[LANGUAGE_CODES.LAOS] },
  { code: LANGUAGE_CODES.MYANMAR, name: LANGUAGE_NAMES[LANGUAGE_CODES.MYANMAR] },
  { code: LANGUAGE_CODES.PORTUGUESE, name: LANGUAGE_NAMES[LANGUAGE_CODES.PORTUGUESE] },
  { code: LANGUAGE_CODES.SPANISH, name: LANGUAGE_NAMES[LANGUAGE_CODES.SPANISH] },
  { code: LANGUAGE_CODES.TETUM, name: LANGUAGE_NAMES[LANGUAGE_CODES.TETUM] },
  { code: LANGUAGE_CODES.CHINESE, name: LANGUAGE_NAMES[LANGUAGE_CODES.CHINESE] },
];

export const DEFAULT_LANGUAGE = LANGUAGE_CODES.ENGLISH;
