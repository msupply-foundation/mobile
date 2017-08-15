/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { createReducer } from '../utilities';

import {
    INCREMENT_SYNC_PROGRESS,
    SET_SYNC_ERROR,
    SET_SYNC_PROGRESS,
    SET_SYNC_TOTAL,
    SET_SYNC_MESSAGE,
    SET_SYNC_COMPLETION_TIME,
    SET_SYNC_IS_SYNCING,
} from './constants';

const defaultState = {
  progressMessage: '',
  errorMessage: '',
  total: 0,
  progress: 0,
  isSyncing: false,
  lastSyncTime: 0,
};

const stateChanges = {
  [INCREMENT_SYNC_PROGRESS]: ({ increment }, { progress }) => ({
    progress: progress + increment,
  }),
  [SET_SYNC_MESSAGE]: ({ progressMessage }) => ({
    progressMessage,
    errorMessage: '',
  }),
  [SET_SYNC_PROGRESS]: ({ progress }) => ({
    progress,
    errorMessage: '',
  }),
  [SET_SYNC_ERROR]: ({ errorMessage }) => ({
    errorMessage,
    progressMessage: '',
  }),
  [SET_SYNC_TOTAL]: ({ total }) => ({
    total,
    errorMesssage: '',
  }),
  [SET_SYNC_IS_SYNCING]: ({ isSyncing }) => ({
    isSyncing,
  }),
  [SET_SYNC_COMPLETION_TIME]: ({ lastSyncTime }) => ({
    lastSyncTime,
  }),
};

export const reducer = createReducer(defaultState, stateChanges);
