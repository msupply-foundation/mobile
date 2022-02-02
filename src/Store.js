/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */
import Bugsnag from '@bugsnag/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer } from 'redux-persist';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

import { navigationMiddleware } from './navigation';
import reducers from './reducers';

const persistConfig = {
  keyPrefix: '',
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['bluetooth', 'sync'],
};

const persistedReducer = persistReducer(persistConfig, reducers);

const bugsnagMiddleware = () => next => action => {
  const { type = 'No action type!' } = action;
  Bugsnag.leaveBreadcrumb(type);

  next(action);
};

const logMiddleware = () => next => action => {
  console.log(action.type);

  next(action);
};

const store = createStore(
  persistedReducer,
  {},
  applyMiddleware(thunk, navigationMiddleware, bugsnagMiddleware, logMiddleware)
);

const persistedStore = persistStore(store);

export { store, persistedStore };
