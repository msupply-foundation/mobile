import { UPDATE_ACTIONS } from '../../actions/Bluetooth/UpdateActions';

const initialState = () => ({
  setLogIntervalFor: '',
  sendingDisableButtonTo: '',
});

export const UpdateReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case UPDATE_ACTIONS.SET_LOG_INTERVAL_START: {
      const { payload } = action;
      const { macAddress } = payload;

      return { ...state, setLogIntervalFor: macAddress };
    }

    case UPDATE_ACTIONS.SET_LOG_INTERVAL_SUCCESS:
    case UPDATE_ACTIONS.SET_LOG_INTERVAL_ERROR: {
      return { ...state, setLogIntervalFor: '' };
    }

    case UPDATE_ACTIONS.DISABLE_BUTTON_START: {
      const { payload } = action;
      const { macAddress } = payload;

      return { ...state, sendingDisableButtonTo: macAddress };
    }

    case UPDATE_ACTIONS.DISABLE_BUTTON_STOP: {
      return { ...state, sendingDisableButtonTo: '' };
    }

    default:
      return state;
  }
};
