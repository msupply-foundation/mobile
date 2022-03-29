/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import moment from 'moment';

import { USER_ACTION_TYPES } from '../actions/UserActions';

const initialState = () => ({
  currentUser: null,
  currentLanguage: 'gb',
  time: null,
});

export const UserReducer = (state = initialState(), action) => {
  const { type } = action;
  switch (type) {
    case USER_ACTION_TYPES.LOG_IN: {
      const { payload } = action;
      const { user } = payload;

      return { ...state, currentUser: user };
    }
    case USER_ACTION_TYPES.LOG_OUT: {
      return { ...state, currentUser: null, time: null };
    }

    case USER_ACTION_TYPES.SET_TIME: {
      return { ...state, time: moment() };
    }

    case USER_ACTION_TYPES.SET_LANGUAGE: {
      const { payload } = action;
      return { ...state, currentLanguage: payload.code };
    }

    default:
      return state;
  }
};
