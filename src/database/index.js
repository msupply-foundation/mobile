/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Database from './BaseDatabase';
import { getUIDatabaseInstance, UIDatabasePropType } from './UIDatabase';

export { CHANGE_TYPES, generateUUID } from 'react-native-database';

export { createRecord, getNumberSequence, NUMBER_SEQUENCE_KEYS } from './utilities';
export { getUIDatabaseInstance, UIDatabasePropType };

export const UIDatabase = getUIDatabaseInstance(Database);
