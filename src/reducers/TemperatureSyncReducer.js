/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { TEMPERATURE_SYNC_ACTIONS } from '../actions/TemperatureSyncActions';
import { REHYDRATE } from '../utilities';

export const TEMPERATURE_SYNC_STATES = {
  SCANNING: 'SCANNING',
  SCAN_ERROR: 'SCAN_ERROR',
  DOWNLOADING_LOGS: 'DOWNLOADING_LOGS',
  DOWNLOADING_LOGS_ERROR: 'DOWNLOADING_LOGS_ERROR',
  RESETTING_ADVERTISEMENT_FREQUENCY: 'RESETTING_ADVERTISEMENT_FREQUENCY',
  RESETTING_LOG_FREQUENCY: 'RESETTING_LOG_FREQUENCY',
  ERROR_RESETTING_ADVERTISEMENT_FREQUENCY: 'ERROR_RESETTING_ADVERTISEMENT_FREQUENCY',
  ERROR_RESETTING_LOG_FREQUENCY: 'ERROR_RESETTING_LOG_FREQUENCY',
  SAVING_LOGS: 'SAVING_LOGS',
  NO_SENSORS: 'NO_SENSORS',
  SYNCING: 'SYNCING',
};

const initialState = () => ({
  progress: 0,
  total: 0,
  syncState: null,
  isSyncing: false,
  modalIsOpen: false,
  lastTemperatureSync: null,
  lastSyncError: null,
  currentSensorName: null,
});

export const TemperatureSyncReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case REHYDRATE: {
      const { payload: previousState } = action;
      const { temperatureSync: previousTemperatureSyncState } = previousState ?? {};
      const { lastTemperatureSync = null } = previousTemperatureSyncState ?? {};

      return { ...initialState(), lastTemperatureSync };
    }

    case TEMPERATURE_SYNC_ACTIONS.UPDATE_SENSOR_PROGRESS: {
      const { payload } = action;
      const { sensor } = payload;
      const { name: currentSensorName } = sensor;

      return { ...state, currentSensorName };
    }

    case TEMPERATURE_SYNC_ACTIONS.OPEN_MODAL: {
      return { ...state, modalIsOpen: true };
    }
    case TEMPERATURE_SYNC_ACTIONS.CLOSE_MODAL: {
      return { ...state, modalIsOpen: false };
    }

    case TEMPERATURE_SYNC_ACTIONS.SCAN_START: {
      return { ...state, syncState: TEMPERATURE_SYNC_STATES.SCANNING, isSyncing: true };
    }
    case TEMPERATURE_SYNC_ACTIONS.SCAN_COMPLETE: {
      return { ...state, syncState: null, isSyncing: false };
    }
    case TEMPERATURE_SYNC_ACTIONS.SCAN_ERROR: {
      return {
        ...state,
        syncState: '',
        syncError: TEMPERATURE_SYNC_STATES.SCAN_ERROR,
        isSyncing: false,
      };
    }
    case TEMPERATURE_SYNC_ACTIONS.DOWNLOAD_LOGS_START: {
      return { ...state, syncState: TEMPERATURE_SYNC_STATES.DOWNLOADING_LOGS, progress: 1 };
    }
    case TEMPERATURE_SYNC_ACTIONS.DOWNLOAD_LOGS_ERROR: {
      return {
        ...state,
        syncState: '',
        isSyncing: false,
        syncError: TEMPERATURE_SYNC_STATES.DOWNLOADING_LOGS_ERROR,
      };
    }
    case TEMPERATURE_SYNC_ACTIONS.DOWNLOAD_LOGS_COMPLETE: {
      return { ...state, syncState: null };
    }

    case TEMPERATURE_SYNC_ACTIONS.START_RESETTING_LOG_FREQUENCY: {
      return { ...state, syncState: TEMPERATURE_SYNC_STATES.RESETTING_LOG_FREQUENCY, progress: 2 };
    }
    case TEMPERATURE_SYNC_ACTIONS.COMPLETE_RESETTING_LOG_FREQUENCY: {
      return { ...state, syncState: null };
    }
    case TEMPERATURE_SYNC_ACTIONS.ERROR_RESETTING_LOG_FREQUENCY: {
      return {
        ...state,
        syncState: TEMPERATURE_SYNC_STATES.ERROR_RESETTING_LOG_FREQUENCY,
        isSyncing: false,
      };
    }

    case TEMPERATURE_SYNC_ACTIONS.START_RESETTING_ADVERTISEMENT_FREQUENCY: {
      return {
        ...state,
        syncState: TEMPERATURE_SYNC_STATES.RESETTING_ADVERTISEMENT_FREQUENCY,
        progress: 3,
      };
    }
    case TEMPERATURE_SYNC_ACTIONS.COMPLETE_RESETTING_ADVERTISEMENT_FREQUENCY: {
      return { ...state, syncState: null };
    }
    case TEMPERATURE_SYNC_ACTIONS.ERROR_RESETTING_ADVERTISEMENT_FREQUENCY: {
      return { ...state, syncError: TEMPERATURE_SYNC_STATES.ERROR_RESETTING_LOG_FREQUENCY };
    }

    case TEMPERATURE_SYNC_ACTIONS.START_SAVING_TEMPERATURE_LOGS: {
      return { ...state, syncState: TEMPERATURE_SYNC_STATES.SAVING_LOGS, progress: 4 };
    }
    case TEMPERATURE_SYNC_ACTIONS.COMPLETE_SAVING_TEMPERATURE_LOGS: {
      return { ...state, syncState: null };
    }

    case TEMPERATURE_SYNC_ACTIONS.ERROR_NO_SENSORS: {
      return {
        ...state,
        syncError: TEMPERATURE_SYNC_STATES.NO_SENSORS,
        syncState: null,
        isSyncing: false,
      };
    }

    case TEMPERATURE_SYNC_ACTIONS.START_SYNC: {
      return { ...state, syncState: TEMPERATURE_SYNC_STATES.SYNCING, isSyncing: true, total: 5 };
    }
    case TEMPERATURE_SYNC_ACTIONS.COMPLETE_SYNC: {
      const { syncError, lastTemperatureSync } = state;
      return {
        ...state,
        syncState: null,
        isSyncing: false,
        lastTemperatureSync: syncError ? lastTemperatureSync : new Date(),
        progress: 5,
        currentSensorName: null,
      };
    }
    default:
      return state;
  }
};