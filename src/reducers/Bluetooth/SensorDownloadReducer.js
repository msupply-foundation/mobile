import { REHYDRATE } from 'redux-persist';
import { DOWNLOAD_ACTIONS } from '../../actions/Bluetooth/SensorDownloadActions';
import { LAST_DOWNLOAD_STATUS } from '../../utilities/modules/vaccines/constants';

const initialState = () => ({
  isSyncingTemps: false,
  isPassivelyDownloadingTemps: false,
  downloadingLogsFrom: '',
  lastDownloadStatus: {},
  lastDownloadTime: {},
  error: null,
});

export const SensorDownloadReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case REHYDRATE: {
      const { payload } = action;
      const { bluetooth } = payload || {};
      const { download: persistedState } = bluetooth || {};
      const { error, lastDownloadTime, lastDownloadStatus } = persistedState || initialState();

      const defaultState = initialState();
      const mergedState = { ...defaultState, error, lastDownloadTime, lastDownloadStatus };

      return mergedState;
    }

    case DOWNLOAD_ACTIONS.SENSOR_DOWNLOAD_START: {
      const { payload } = action;
      const { sensor } = payload;
      const { macAddress } = sensor;

      return { ...state, downloadingLogsFrom: macAddress };
    }

    case DOWNLOAD_ACTIONS.SENSOR_DOWNLOAD_SUCCESS: {
      const { lastDownloadStatus, lastDownloadTime } = state;
      const { payload } = action;
      const { sensor } = payload;
      const { macAddress } = sensor;

      const newLastDownloadStatus = {
        ...lastDownloadStatus,
        [macAddress]: LAST_DOWNLOAD_STATUS.OK,
      };

      const newLastDownloadTime = {
        ...lastDownloadTime,
        [macAddress]: new Date().getTime(),
      };

      return {
        ...state,
        lastDownloadStatus: newLastDownloadStatus,
        lastDownloadTime: newLastDownloadTime,
        downloadingLogsFrom: '',
      };
    }

    case DOWNLOAD_ACTIONS.SENSOR_DOWNLOAD_ERROR: {
      const { lastDownloadStatus, lastDownloadTime } = state;
      const { payload } = action;
      const { sensor, error } = payload;
      const { macAddress } = sensor;

      const newLastDownloadStatus = {
        ...lastDownloadStatus,
        [macAddress]: error,
      };

      const newLastDownloadTime = {
        ...lastDownloadTime,
        [macAddress]: new Date().getTime(),
      };

      return {
        ...state,
        lastDownloadStatus: newLastDownloadStatus,
        lastDownloadTime: newLastDownloadTime,
        downloadingLogsFrom: '',
      };
    }

    case DOWNLOAD_ACTIONS.PASSIVE_DOWNLOAD_START: {
      return { ...state, isPassivelyDownloadingTemps: true };
    }

    case DOWNLOAD_ACTIONS.PASSIVE_DOWNLOAD_STOP: {
      return { ...state, isPassivelyDownloadingTemps: false };
    }

    case DOWNLOAD_ACTIONS.DOWNLOAD_LOGS_START: {
      return { ...state, isSyncingTemps: true, error: null };
    }

    case DOWNLOAD_ACTIONS.DOWNLOAD_LOGS_ERROR: {
      const { payload } = action;
      const { error } = payload;
      return { ...state, isSyncingTemps: false, error };
    }

    case DOWNLOAD_ACTIONS.DOWNLOAD_LOGS_COMPLETE: {
      return { ...state, isSyncingTemps: false, error: null };
    }

    default:
      return state;
  }
};
