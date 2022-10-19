/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { hashPassword } from 'sussol-utilities';
import ValidUrl from 'valid-url';
import { Dimensions, Text, View, ToastAndroid, TouchableOpacity } from 'react-native';
import RNRestart from 'react-native-restart';
import { Button } from 'react-native-ui-components';

// eslint-disable-next-line import/no-unresolved
import { REACT_APP_ADMIN_PASSWORD_HASHED } from '@env';

import { importData, UIDatabase } from '../database';
import { SETTINGS_KEYS } from '../settings';
import AppSettings from '../settings/MobileAppSettings';
import { MODAL_KEYS } from '../utilities';
import {
  gotoEditSensorPage,
  gotoFridgeDetailPage,
  gotoNewSensorPage,
  gotoRealmExplorer,
} from '../navigation/actions';

import { ConfirmIcon } from '../widgets/icons';
import { DataTablePageView, PageInfo } from '../widgets';
import { DataTablePageModal } from '../widgets/modals';

import { generalStrings, buttonStrings } from '../localization';
import { selectCurrentUserPasswordHash } from '../selectors/user';
import { PermissionActions } from '../actions/PermissionActions';
import { useLoadingIndicator } from '../hooks/useLoadingIndicator';
import { createVaccineData } from '../database/utilities/dataGenerators';
import { Slider } from '../widgets/Slider';
import { FlexRow } from '../widgets/FlexRow';
import globalStyles, { APP_FONT_FAMILY, DARK_GREY, SUSSOL_ORANGE } from '../globalStyles';
import { FlexView } from '../widgets/FlexView';
import { MILLISECONDS } from '../utilities/constants';
import { SyncAuthenticator } from '../authentication/SyncAuthenticator';

const exportData = async () => {
  const syncSiteName = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_NAME);

  const { success, message } = await UIDatabase.exportData(syncSiteName);
  const toastMessage = success
    ? generalStrings.exported_data
    : `${generalStrings.couldnt_export_data}: ${message}`;

  ToastAndroid.show(toastMessage, ToastAndroid.SHORT);
};

const Settings = ({
  toRealmExplorer,
  currentUserPasswordHash,
  requestExportStorageWritePermission,
  requestImportStorageWritePermission,
}) => {
  const [state, setState] = useState({
    syncURL: UIDatabase.getSetting(SETTINGS_KEYS.SYNC_URL),
    siteName: UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_NAME),
    syncSiteID: UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_ID),
    modalKey: '',
    syncPassword: '',
    syncInterval:
      Number(UIDatabase.getSetting(SETTINGS_KEYS.SYNC_INTERVAL) / MILLISECONDS.ONE_MINUTE) ?? 10,
    idleLogoutInterval:
      Number(UIDatabase.getSetting(SETTINGS_KEYS.IDLE_LOGOUT_INTERVAL) / MILLISECONDS.ONE_MINUTE) ??
      3,
  });

  const withLoadingIndicator = useLoadingIndicator();

  const {
    modalKey,
    syncURL,
    syncPassword,
    syncInterval,
    idleLogoutInterval,
    syncSiteID,
    siteName,
  } = state;

  const closeModal = () => setState({ ...state, modalKey: '' });
  const openModal = newModalKey => setState({ ...state, modalKey: newModalKey });
  const onSave = () => openModal(MODAL_KEYS.CONFIRM_USER_PASSWORD);
  const onReset = () => openModal(MODAL_KEYS.CONFIRM_FACTORY_RESET);

  const editSyncURL = newSyncURL => {
    if (!ValidUrl.isWebUri(newSyncURL)) ToastAndroid.show('Not a valid URL', ToastAndroid.LONG);
    else setState({ ...state, modalKey: '', syncURL: newSyncURL });
  };

  const onCheckConnection = () => {
    //  Hash the password.
    const syncSitePassword = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_PASSWORD_HASH);
    const syncSiteName = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_NAME);
    const syncAuthenticator = new SyncAuthenticator(AppSettings);
    syncAuthenticator
      .authenticate(syncURL, syncSiteName, null, syncSitePassword)
      .then(() => {
        ToastAndroid.show(buttonStrings.connection_status, ToastAndroid.LONG);
      })
      .catch(error => {
        ToastAndroid.show(error.message, ToastAndroid.LONG);
      });
  };
  const editSyncPassword = newSyncPassword =>
    setState({ ...state, modalKey: '', syncPassword: newSyncPassword });

  const editSyncInterval = newSyncInterval => {
    setState(oldState => ({ ...oldState, syncInterval: newSyncInterval }));
  };

  const editIdleLogoutInterval = newIdleLogoutInterval => {
    setState(oldState => ({ ...oldState, idleLogoutInterval: newIdleLogoutInterval }));
  };

  const save = enteredPassword => {
    const passwordMatch = hashPassword(enteredPassword) === currentUserPasswordHash;
    console.log('hashPassword(enteredPassword) ', hashPassword(enteredPassword));
    console.log('REACT_APP_ADMIN_PASSWORD_HASHED ', REACT_APP_ADMIN_PASSWORD_HASHED);

    const toastMessage = passwordMatch
      ? generalStrings.new_details_saved
      : generalStrings.new_details_not_saved;

    if (passwordMatch) {
      UIDatabase.write(() => {
        UIDatabase.update('Setting', {
          key: SETTINGS_KEYS.SYNC_URL,
          // Quietly snip off trailing '/' characters before persisting as this causes invalid urls
          value: syncURL.replace(/\/$/, ''),
        });
        UIDatabase.update('Setting', {
          key: SETTINGS_KEYS.SYNC_SITE_PASSWORD_HASH,
          value: syncPassword ? hashPassword(syncPassword) : currentUserPasswordHash,
        });

        UIDatabase.update('Setting', {
          key: SETTINGS_KEYS.SYNC_INTERVAL,
          value: String(syncInterval * MILLISECONDS.ONE_MINUTE),
        });

        UIDatabase.update('Setting', {
          key: SETTINGS_KEYS.IDLE_LOGOUT_INTERVAL,
          value: String(idleLogoutInterval * MILLISECONDS.ONE_MINUTE),
        });
      });
    }

    ToastAndroid.show(toastMessage, ToastAndroid.LONG);
    closeModal();
  };

  const reset = enteredPassword => {
    const passwordMatch = hashPassword(enteredPassword) === currentUserPasswordHash;
    const toastMessage = passwordMatch
      ? generalStrings.new_details_saved
      : generalStrings.new_details_not_saved;

    if (passwordMatch) {
      UIDatabase.write(() => UIDatabase.deleteAll());
      RNRestart.Restart();
    } else {
      ToastAndroid.show(toastMessage, ToastAndroid.LONG);
    }
    closeModal();
  };

  const getModalSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.SYNC_URL_EDIT:
        return editSyncURL;
      case MODAL_KEYS.SYNC_PASSWORD_EDIT:
        return editSyncPassword;
      case MODAL_KEYS.CONFIRM_USER_PASSWORD:
        return save;
      case MODAL_KEYS.CONFIRM_FACTORY_RESET:
        return reset;
      default:
        return null;
    }
  };

  const { menuButton, menuButtonText } = globalStyles;
  const { row, column, marginRight, topRow } = styles;

  const MenuButton = useCallback(
    props => <Button style={menuButton} textStyle={menuButtonText} {...props} />,
    []
  );

  const VaccineButton = () => {
    // eslint-disable-next-line no-undef
    if (__DEV__) {
      return (
        <MenuButton
          text="Generate vaccine data"
          onPress={() => withLoadingIndicator(createVaccineData)}
        />
      );
    }

    return null;
  };

  const pageInfoColumns = useMemo(
    () => [
      [
        {
          title: 'Sync site id:',
          isEditingDisabled: 'true',
          info: syncSiteID,
        },
        {
          title: 'Sync site name:',
          isEditingDisabled: 'true',
          info: siteName,
        },
        {
          title: `${generalStrings.sync_url}:`,
          editableType: 'text',
          info: syncURL,
          onPress: () => openModal(MODAL_KEYS.SYNC_URL_EDIT),
        },
        {
          title: `${generalStrings.sync_password}:`,
          editableType: 'text',
          info: '',
          onPress: () => openModal(MODAL_KEYS.SYNC_PASSWORD_EDIT),
        },
      ],
    ],
    [syncSiteID, siteName, syncURL]
  );

  return (
    <DataTablePageView>
      <TouchableOpacity style={topRow} onPress={onSave}>
        <Text style={marginRight}>{buttonStrings.save_changes}</Text>
        <ConfirmIcon />
      </TouchableOpacity>

      <View style={row}>
        <View style={column}>
          <PageInfo columns={pageInfoColumns} />
          <FlexRow
            flex={1}
            justifyContent="center"
            alignItems="center"
            style={{ marginTop: 10, maxHeight: 50 }}
          >
            <Text style={styles.text}>{generalStrings.sync_interval_minutes}</Text>
            <FlexView flex={1}>
              <Slider
                minimumValue={1}
                maximumValue={10}
                fractionDigits={0}
                step={1}
                value={syncInterval}
                onEndEditing={editSyncInterval}
                textUnderlineColour={SUSSOL_ORANGE}
              />
            </FlexView>
          </FlexRow>
          <FlexRow
            flex={1}
            justifyContent="center"
            alignItems="center"
            style={{ marginTop: 10, maxHeight: 50 }}
          >
            <Text style={styles.text}>{generalStrings.idle_log_out_interval}</Text>
            <FlexView flex={1}>
              <Slider
                minimumValue={1}
                maximumValue={10}
                fractionDigits={0}
                step={1}
                value={idleLogoutInterval}
                onEndEditing={editIdleLogoutInterval}
                textUnderlineColour={SUSSOL_ORANGE}
              />
            </FlexView>
          </FlexRow>
        </View>
        <View>
          <MenuButton text={buttonStrings.realm_explorer} onPress={toRealmExplorer} />
          <MenuButton
            text={buttonStrings.export_data}
            onPress={requestExportStorageWritePermission}
          />
          <MenuButton
            text={buttonStrings.import_data}
            onPress={requestImportStorageWritePermission}
          />
          <MenuButton text={buttonStrings.factory_reset} onPress={onReset} />
          <MenuButton text={buttonStrings.check_connection} onPress={onCheckConnection} />
          <VaccineButton />
        </View>
      </View>

      <DataTablePageModal
        isOpen={!!modalKey}
        modalKey={modalKey}
        currentValue={modalKey === MODAL_KEYS.SYNC_URL_EDIT ? syncURL : ''}
        onClose={closeModal}
        onSelect={getModalSelect(modalKey)}
      />
    </DataTablePageView>
  );
};

const mapStateToDispatch = dispatch => ({
  toRealmExplorer: () => dispatch(gotoRealmExplorer()),
  toEditSensorPage: sensor => dispatch(gotoEditSensorPage(sensor)),
  toFridgeDetail: fridge => dispatch(gotoFridgeDetailPage(fridge)),
  toNewSensorPage: () => dispatch(gotoNewSensorPage()),
  requestExportStorageWritePermission: () =>
    dispatch(PermissionActions.requestWriteStorage()).then(exportData),
  requestImportStorageWritePermission: () =>
    dispatch(PermissionActions.requestWriteStorage()).then(importData),
});

const mapStateToProps = state => ({
  currentUserPasswordHash: selectCurrentUserPasswordHash(state),
});

const styles = {
  row: { flex: 1, flexDirection: 'row' },
  column: { flex: 1, flexDirection: 'column' },
  marginRight: { marginRight: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  text: {
    fontSize: Dimensions.get('window').width / 80,
    fontFamily: APP_FONT_FAMILY,
    color: DARK_GREY,
    width: 300,
  },
};

export const SettingsPage = connect(mapStateToProps, mapStateToDispatch)(Settings);

Settings.propTypes = {
  toRealmExplorer: PropTypes.func.isRequired,
  currentUserPasswordHash: PropTypes.string.isRequired,
  requestExportStorageWritePermission: PropTypes.func.isRequired,
  requestImportStorageWritePermission: PropTypes.func.isRequired,
};
