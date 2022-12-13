/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-undef */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';
import { BluetoothStatus } from 'react-native-bluetooth-status';
import { AppState, View } from 'react-native';
import { Scheduler } from 'sussol-utilities';
import { BleManager, DevBleManager } from '@openmsupply/msupply-ble-service';

import Settings from './settings/MobileAppSettings';
import Database from './database/BaseDatabase';
import { UIDatabase } from './database';
import { SETTINGS_KEYS } from './settings';

import { MainStackNavigator, Pages } from './navigation/Navigator';
import { ROUTES } from './navigation';
import { Synchroniser, PostSyncProcessor, SyncModal } from './sync';
import { migrateDataToVersion } from './dataMigration';
import { SyncAuthenticator, UserAuthenticator } from './authentication';

import { LoadingIndicatorContext } from './context/LoadingIndicatorContext';
import { selectTitle } from './selectors/supplierCredit';
import { selectCurrentUser } from './selectors/user';
import { selectUsingVaccines } from './selectors/modules';
import { version as appVersion } from '../package.json';

import { syncCompleteTransaction, setSyncError, openSyncModal } from './actions/SyncActions';
import { FinaliseActions } from './actions/FinaliseActions';
import { UserActions } from './actions';
import { SupplierCreditActions } from './actions/SupplierCreditActions';

import { Spinner } from './widgets';
import { ModalContainer, FinaliseModal, LoginModal } from './widgets/modals';
import { FirstUsePage } from './pages';
import { SupplierCredit } from './widgets/modalChildren/SupplierCredit';

import globalStyles, { SUSSOL_ORANGE } from './globalStyles';
import { BreachDisplay } from './widgets/modalChildren/BreachDisplay';
import { selectIsBreachModalOpen, selectBreachModalTitle } from './selectors/breach';
import { BreachActions } from './actions/BreachActions';
import { RowDetail } from './widgets/RowDetail';
import { PermissionActions } from './actions/PermissionActions';
import BleService from './bluetooth/BleService';
import TemperatureLogManager from './bluetooth/TemperatureLogManager';
import SensorManager from './bluetooth/SensorManager';
import { VaccineDataAccess } from './bluetooth/VaccineDataAccess';
import { UtilService } from './database/utilities/utilService';
import { SensorDownloadActions } from './actions/Bluetooth/SensorDownloadActions';
import BreachManager from './bluetooth/BreachManager';
import { selectIsPassivelyDownloadingTemps } from './selectors/Bluetooth/sensorDownload';
import LoggerService from './utilities/logging';

const BLUETOOTH_SYNC_INTERVAL = 60 * 1000; // 1 minute in milliseconds.
const AUTHENTICATION_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds.

SensorManager(new VaccineDataAccess(UIDatabase), new UtilService());
TemperatureLogManager(new VaccineDataAccess(UIDatabase), new UtilService());
BreachManager(new VaccineDataAccess(UIDatabase), new UtilService());

(async () => {
  const isEmulator = await DeviceInfo.isEmulator();
  if (isEmulator) {
    // eslint-disable-next-line no-console
    console.log('Emulator detected - Init Dev BleManager');
    BleService(new DevBleManager());
  } else {
    BleService(new BleManager(), LoggerService.createLogger('BleService'));
  }
})();

class MSupplyMobileAppContainer extends React.Component {
  constructor(props, ...otherArgs) {
    super(props, ...otherArgs);

    migrateDataToVersion(UIDatabase, Settings);
    this.databaseVersion = Settings.get(SETTINGS_KEYS.APP_VERSION);
    this.userAuthenticator = new UserAuthenticator(UIDatabase, Settings);
    this.syncAuthenticator = new SyncAuthenticator(Settings);
    this.synchroniser = new Synchroniser(
      Database,
      this.syncAuthenticator,
      Settings,
      props.dispatch
    );

    this.postSyncProcessor = new PostSyncProcessor(UIDatabase, Settings);
    this.scheduler = new Scheduler();
    const isInitialised = this.synchroniser.isInitialised();
    this.scheduler.schedule(this.synchronise, this.synchroniser.syncInterval());
    this.scheduler.schedule(() => {
      const { currentUser } = this.props;
      if (currentUser !== null) {
        // Only re-authenticate if currently logged in.
        this.userAuthenticator.reauthenticate(this.onAuthentication);
      }
    }, AUTHENTICATION_INTERVAL);

    this.state = {
      isInitialised,
      isLoading: false,
      appState: null,
    };
  }

  componentDidUpdate() {
    const { dispatch, requestBluetooth } = this.props;

    this.startTemperatureDownload();

    BluetoothStatus.addListener(requestBluetooth);
    dispatch(PermissionActions.checkPermissions());
  }

  componentDidMount = () => {
    this.startTemperatureDownload();
    AppState.addEventListener('change', this.onAppStateChange);
  };

  componentWillUnmount = () => {
    const { usingVaccines, dispatch } = this.props;

    dispatch(SensorDownloadActions.stopPassiveDownloadJob());

    if (usingVaccines) BluetoothStatus.removeListener();
    AppState.removeEventListener('change', this.onAppStateChange);

    this.scheduler.clearAll();
  };

  onAppStateChange = nextAppState => {
    const { appState } = this.state;
    const { dispatch } = this.props;
    if (nextAppState?.match(/inactive|background/)) dispatch(UserActions.setTime());
    if (appState?.match(/inactive|background/) && nextAppState === 'active') {
      dispatch(PermissionActions.checkPermissions());
      dispatch(UserActions.active());
    }

    this.setState({ appState: nextAppState });
  };

  onAuthentication = user => {
    const { dispatch } = this.props;
    dispatch(UserActions.login(user));
    this.postSyncProcessor.setUser(user);
  };

  onInitialised = () => {
    this.setState({ isInitialised: true });
    this.postSyncProcessor.processAnyUnprocessedRecords();
  };

  runWithLoadingIndicator = async functionToRun => {
    // We here set up an asynchronous promise that will be resolved after a timeout
    // of 1 millisecond. This allows a fraction of a delay for the javascript thread
    // to unblock and allow the spinner animation to start up. The |functionToRun| should
    // not be run inside a |setTimeout| as that relegates to a lower priority, resulting
    // in very slow performance.
    await new Promise(resolve => {
      this.setState({ isLoading: true }, () => setTimeout(resolve, 1));
    });

    await functionToRun();
    this.setState({ isLoading: false });
  };

  synchronise = async () => {
    const { dispatch } = this.props;
    const { isInitialised } = this.state;

    if (!isInitialised) return;

    try {
      const syncUrl = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_URL);
      const syncSiteName = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_NAME);
      const syncSitePasswordHash = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_PASSWORD_HASH);

      await this.syncAuthenticator.authenticate(syncUrl, syncSiteName, null, syncSitePasswordHash);

      // True if most recent call to |this.synchroniser.synchronise()| failed.
      const lastSyncFailed = this.synchroniser.lastSyncFailed();
      const lastPostSyncProcessingFailed = this.postSyncProcessor.lastPostSyncProcessingFailed();
      await this.synchroniser.synchronise();
      if (lastSyncFailed || lastPostSyncProcessingFailed) {
        // If last sync was interrupted, it did not enter this block. If the app was closed, it did
        // not store any records left in the sync queue, so tables should be checked for unprocessed
        // records. If the last processing of the record queue was interrupted by app crash then all
        // records need to be checked.
        this.postSyncProcessor.processAnyUnprocessedRecords();
      } else {
        dispatch(UserActions.clearNumberSequences());
        this.postSyncProcessor.processRecordQueue();
      }
      dispatch(syncCompleteTransaction());
    } catch (error) {
      dispatch(setSyncError(error.message));
    }
  };

  startTemperatureDownload() {
    const { dispatch, usingVaccines, syncTemperatures } = this.props;

    if (usingVaccines) {
      const { isPassivelyDownloadingTemps } = this.props;

      if (!isPassivelyDownloadingTemps) {
        this.scheduler.schedule(syncTemperatures, BLUETOOTH_SYNC_INTERVAL);
        dispatch(SensorDownloadActions.startPassiveDownloadJob());
      }
    }
  }

  renderLoadingIndicator = () => {
    const { isLoading } = this.state;

    return (
      <View style={globalStyles.loadingIndicatorContainer}>
        <Spinner isSpinning={isLoading} color={SUSSOL_ORANGE} />
      </View>
    );
  };

  render() {
    const {
      currentUser,
      closeSupplierCreditModal,
      supplierCreditModalOpen,
      creditTitle,
      isBreachModalOpen,
      closeBreachModal,
      breachModalTitle,
    } = this.props;
    const { isInitialised, isLoading } = this.state;

    if (!isInitialised) {
      return <FirstUsePage synchroniser={this.synchroniser} onInitialised={this.onInitialised} />;
    }

    // If this database hasn't got any version setup then update with the current app's version.
    if (this.databaseVersion.length === 0) {
      Settings.set(SETTINGS_KEYS.APP_VERSION, appVersion);
    }

    return (
      <LoadingIndicatorContext.Provider value={this.runWithLoadingIndicator}>
        <View style={globalStyles.appBackground}>
          <MainStackNavigator.Navigator initialRouteName={ROUTES.MENU}>
            {Pages}
          </MainStackNavigator.Navigator>

          <FinaliseModal />
          <SyncModal onPressManualSync={this.synchronise} />
          <LoginModal
            authenticator={this.userAuthenticator}
            settings={Settings}
            isAuthenticated={!!currentUser}
            onAuthentication={this.onAuthentication}
          />
          {isLoading && this.renderLoadingIndicator()}

          <ModalContainer
            isVisible={supplierCreditModalOpen}
            onClose={closeSupplierCreditModal}
            title={creditTitle}
          >
            <SupplierCredit />
          </ModalContainer>

          <ModalContainer
            isVisible={isBreachModalOpen}
            onClose={closeBreachModal}
            title={breachModalTitle}
          >
            <BreachDisplay />
          </ModalContainer>
          <RowDetail />
        </View>
      </LoadingIndicatorContext.Provider>
    );
  }
}

const mapDispatchToProps = dispatch => {
  const openFinaliseModal = () => dispatch(FinaliseActions.openModal());
  const closeFinaliseModal = () => dispatch(FinaliseActions.closeModal());
  const closeSupplierCreditModal = () => dispatch(SupplierCreditActions.close());
  const onOpenSyncModal = () => dispatch(openSyncModal());
  const closeBreachModal = () => dispatch(BreachActions.close());
  const syncTemperatures = () => dispatch(SensorDownloadActions.startDownloadAll());
  const requestBluetooth = newStatus => dispatch(PermissionActions.requestBluetooth(newStatus));

  return {
    requestBluetooth,
    syncTemperatures,
    dispatch,
    onOpenSyncModal,
    openFinaliseModal,
    closeFinaliseModal,
    closeSupplierCreditModal,
    closeBreachModal,
  };
};

const mapStateToProps = state => {
  const { finalise, supplierCredit } = state;
  const { open: supplierCreditModalOpen } = supplierCredit;
  const { finaliseModalOpen } = finalise;

  const usingVaccines = selectUsingVaccines(state);
  const isBreachModalOpen = selectIsBreachModalOpen(state);
  const currentUser = selectCurrentUser(state);

  const isPassivelyDownloadingTemps = selectIsPassivelyDownloadingTemps(state);
  const breachModalTitle = selectBreachModalTitle(state);
  return {
    usingVaccines,
    isPassivelyDownloadingTemps,
    currentUser,
    finaliseModalOpen,
    supplierCreditModalOpen,
    isBreachModalOpen,
    breachModalTitle,
    creditTitle: selectTitle(state),
  };
};

MSupplyMobileAppContainer.defaultProps = {
  currentUser: null,
  creditTitle: '',
};

MSupplyMobileAppContainer.propTypes = {
  usingVaccines: PropTypes.bool.isRequired,
  requestBluetooth: PropTypes.func.isRequired,
  syncTemperatures: PropTypes.func.isRequired,
  isPassivelyDownloadingTemps: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  closeSupplierCreditModal: PropTypes.func.isRequired,
  supplierCreditModalOpen: PropTypes.bool.isRequired,
  creditTitle: PropTypes.string,
  isBreachModalOpen: PropTypes.bool.isRequired,
  closeBreachModal: PropTypes.func.isRequired,
  breachModalTitle: PropTypes.string.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(MSupplyMobileAppContainer);
