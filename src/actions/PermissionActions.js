/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { batch } from 'react-redux';
import { BluetoothStatus } from 'react-native-bluetooth-status';
import SystemSetting from 'react-native-system-setting';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';

import { ToastAndroid } from 'react-native';
import { PermissionSelectors } from '../selectors/permission';
import { syncStrings } from '../localization/index';

export const PERMISSION_ACTIONS = {
  SET_LOCATION: 'permissionActions/setLocation',
  SET_LOCATION_SERVICE: 'permissionActions/setLocationService',
  SET_WRITE_STORAGE: 'permissionActions/setWriteStorage',
  SET_BLUETOOTH: 'permissionActions/setBluetooth',
};

const setBluetooth = status => ({ type: PERMISSION_ACTIONS.SET_BLUETOOTH, payload: { status } });
const setLocation = status => ({ type: PERMISSION_ACTIONS.SET_LOCATION, payload: { status } });
const setLocationService = status => ({
  type: PERMISSION_ACTIONS.SET_LOCATION_SERVICE,
  payload: { status },
});
const setWriteStorage = status => ({
  type: PERMISSION_ACTIONS.SET_WRITE_STORAGE,
  payload: { status },
});

const requestBluetooth = () => async dispatch => {
  const isEmulator = await DeviceInfo.isEmulator();
  BluetoothStatus.enable();

  const result = isEmulator ? true : await BluetoothStatus.state();

  dispatch(setBluetooth(result));

  return result;
};

const requestLocationService = () => async dispatch => {
  const isEmulator = await DeviceInfo.isEmulator();
  await SystemSetting.switchLocation();

  const result = isEmulator ? true : await SystemSetting.isLocationEnabled();

  dispatch(setLocationService(result));

  return result;
};

const requestWriteStorage = () => async (dispatch, getState) => {
  const writeStoragePermission = PermissionSelectors.writeStorage(getState());

  if (!writeStoragePermission) {
    const result = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    const success = result === RESULTS.GRANTED;
    dispatch(setWriteStorage(result === RESULTS.GRANTED));
    return success;
  }

  return writeStoragePermission;
};

const requestLocation = () => async (dispatch, getState) => {
  const locationPermission = PermissionSelectors.location(getState());

  const result = !locationPermission
    ? (await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)) === RESULTS.GRANTED
    : true;

  dispatch(setLocation(result));

  return result;
};

const checkPermissions = () => async dispatch => {
  const promises = [
    check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION),
    check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE),
    BluetoothStatus.state(),
    SystemSetting.isLocationEnabled(),
  ];

  const [
    locationPermission,
    writeStoragePermission,
    bluetoothState,
    locationState,
  ] = await Promise.all(promises);

  batch(() => {
    dispatch(setLocation(locationPermission === RESULTS.GRANTED));
    dispatch(setWriteStorage(writeStoragePermission === RESULTS.GRANTED));
    dispatch(setBluetooth(bluetoothState));
    dispatch(setLocationService(locationState));
  });
};

/**
 * Helper wrapper which will check permissions for
 * bluetooth & location services before calling the supplied function
 * @param {Func} dispatch
 * @param {Func} getState
 * @param {Func} action method to dispatch if permissions are enabled
 */
const withLocationAndBluetooth = async (dispatch, getState, action) => {
  try {
    const state = getState();
    const bluetoothEnabled = PermissionSelectors.bluetooth(state);
    const locationPermission = PermissionSelectors.location(state);

    // Ensure the correct permissions before initiating a new sync process.
    if (!bluetoothEnabled) await dispatch(PermissionActions.requestBluetooth());
    if (!locationPermission) await dispatch(PermissionActions.requestLocation());

    if (!bluetoothEnabled) {
      const result = await dispatch(PermissionActions.requestBluetooth());
      if (!result) {
        ToastAndroid.show(syncStrings.bluetooth_disabled, ToastAndroid.LONG);
        return null;
      }
    }

    if (!locationPermission) {
      const result = await dispatch(PermissionActions.requestLocation());
      if (!result) {
        ToastAndroid.show(syncStrings.location_permission, ToastAndroid.LONG);
        return null;
      }
    }

    return dispatch(action);
  } catch (e) {
    return null;
  }
};

export const PermissionActions = {
  requestLocation,
  requestLocationService,
  requestWriteStorage,
  requestBluetooth,
  setLocation,
  setWriteStorage,
  checkPermissions,
  withLocationAndBluetooth,
};
