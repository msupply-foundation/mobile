/* eslint-disable no-unused-expressions */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, ToastAndroid } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { Button } from 'react-native-ui-components';
import {
  ModulesImage,
  CustomerImage,
  IconButton,
  SupplierImage,
  StockImage,
  InfoBadge,
} from '../widgets';

import {
  PowerIcon,
  CogIcon,
  SyringeIcon,
  SnowflakeIcon,
  LineChartIcon,
  DollarIcon,
} from '../widgets/icons';
import { ROUTES } from '../navigation/constants';
import { buttonStrings, vaccineStrings, navStrings, generalStrings } from '../localization';

import { SETTINGS_KEYS } from '../settings';
import { UIDatabase } from '../database';

import {
  gotoCustomerInvoices,
  gotoCustomerRequisitions,
  gotoSupplierInvoices,
  gotoSupplierRequisitions,
  gotoStock,
  gotoStocktakes,
  gotoRealmExplorer,
  goToCashRegister,
  gotoDispensingPage,
  gotoSettings,
  gotoDashboard,
  goToVaccines,
  gotoVaccineDispensingPage,
} from '../navigation/actions';

import globalStyles, { SHADOW_BORDER } from '../globalStyles';
import { UserActions } from '../actions/index';
import { selectCurrentUserIsAdmin } from '../selectors/user';
import {
  selectHasVaccines,
  selectHaveVaccineStock,
} from '../selectors/Entities/vaccinePrescription';
import { SUSSOL_ORANGE } from '../globalStyles/colors';

const exportData = async () => {
  const syncSiteName = UIDatabase.getSetting(SETTINGS_KEYS.SYNC_SITE_NAME);
  const { success, message } = await UIDatabase.exportData(syncSiteName);
  const toastMessage = success
    ? generalStrings.exported_data
    : `${generalStrings.couldnt_export_data}: ${message}`;
  ToastAndroid.show(toastMessage, ToastAndroid.SHORT);
};

const Menu = ({
  isInAdminMode, // isInAdminMode kept for backwards compatibility with Desktop < v4.07
  logout,
  toVaccines,
  toCustomerInvoices,
  toCustomerRequisitions,
  toStock,
  toStocktakes,
  toSupplierInvoices,
  toSupplierRequisitions,
  toRealmExplorer,
  toDispensary,
  toSettings,
  toDashboard,
  toCashRegister,
  usingDashboard,
  usingDispensary,
  usingCashRegister,
  usingModules,
  usingVaccines,
  isAdmin,
  hasVaccines,
  toVaccineDispensingPage,
}) => {
  const { menuButton, menuButtonText: buttonText, appBackground } = globalStyles;
  const { image, originalContainer, moduleContainer, container, moduleRow } = styles;
  const labelButtonText = {
    ...buttonText,
    width: 175,
    textAlign: 'center',
  };
  const containerStyle = {
    ...container,
    ...(usingModules || hasVaccines ? moduleContainer : originalContainer),
  };

  const isFocused = useIsFocused();

  const MenuButton = useCallback(
    props => <Button style={menuButton} textStyle={buttonText} {...props} />,
    [usingDashboard, usingDispensary, usingCashRegister, usingModules, hasVaccines]
  );

  const IconMenuButton = useCallback(
    props => (
      <IconButton
        containerStyle={menuButton}
        labelStyle={labelButtonText}
        underlayColor="#B5B5B5"
        {...props}
      />
    ),
    [usingDashboard, usingDispensary, usingCashRegister, usingModules, hasVaccines]
  );

  const CustomerSection = useCallback(
    () => (
      <View style={containerStyle}>
        <CustomerImage style={image} />
        <View>
          <InfoBadge routeName={ROUTES.CUSTOMER_INVOICES}>
            <MenuButton text={navStrings.customer_invoices} onPress={toCustomerInvoices} />
          </InfoBadge>
          <InfoBadge routeName={ROUTES.CUSTOMER_REQUISITIONS}>
            <MenuButton text={navStrings.customer_requisitions} onPress={toCustomerRequisitions} />
          </InfoBadge>
          {!!usingDispensary && <MenuButton text={navStrings.dispensary} onPress={toDispensary} />}
        </View>
      </View>
    ),
    [usingDashboard, usingDispensary, usingCashRegister, usingModules]
  );

  const SupplierSection = useCallback(
    () => (
      <View style={containerStyle}>
        <SupplierImage style={image} />
        <View>
          <InfoBadge routeName={ROUTES.SUPPLIER_INVOICES}>
            <MenuButton text={navStrings.supplier_invoices} onPress={toSupplierInvoices} />
          </InfoBadge>
          <InfoBadge routeName={ROUTES.SUPPLIER_REQUISITIONS}>
            <MenuButton text={navStrings.supplier_requisitions} onPress={toSupplierRequisitions} />
          </InfoBadge>
        </View>
      </View>
    ),
    [usingDashboard, usingDispensary, usingCashRegister, usingModules]
  );

  const StockSection = useCallback(
    () => (
      <View style={containerStyle}>
        <StockImage style={image} />
        <View>
          <MenuButton text={navStrings.current_stock} onPress={toStock} />
          <InfoBadge routeName={ROUTES.STOCKTAKES}>
            <MenuButton text={navStrings.stocktake} onPress={toStocktakes} />
          </InfoBadge>
        </View>
      </View>
    ),
    [usingDashboard, usingDispensary, usingCashRegister, usingModules]
  );

  const ModulesSection = useCallback(
    () => (
      <View style={containerStyle}>
        <ModulesImage style={image} />

        <View>
          {!!usingVaccines && (
            <InfoBadge routeName={ROUTES.VACCINES}>
              <IconMenuButton
                label={navStrings.vaccines}
                onPress={toVaccines}
                Icon={<SnowflakeIcon />}
              />
            </InfoBadge>
          )}
          {!!hasVaccines && !!usingDispensary && (
            <IconMenuButton
              label={navStrings.vaccine_dispensary}
              onPress={
                () =>
                  selectHaveVaccineStock()
                    ? toVaccineDispensingPage()
                    : ToastAndroid.show(vaccineStrings.no_vaccine_stock, ToastAndroid.SHORT)
                // eslint-disable-next-line react/jsx-curly-newline
              }
              Icon={<SyringeIcon />}
            />
          )}
          {!!usingDashboard && (
            <IconMenuButton
              label={navStrings.dashboard}
              onPress={toDashboard}
              Icon={<LineChartIcon color={SUSSOL_ORANGE} />}
            />
          )}
          {!!usingCashRegister && (
            <IconMenuButton
              label={navStrings.cash_register}
              onPress={toCashRegister}
              Icon={<DollarIcon />}
            />
          )}
        </View>
      </View>
    ),
    [usingDashboard, usingDispensary, usingCashRegister, usingModules, hasVaccines]
  );

  const AdminRow = useCallback(
    () => (
      <View style={styles.bottomRow}>
        <IconButton Icon={<PowerIcon />} label={navStrings.log_out} onPress={logout} />
        {!!isInAdminMode && <MenuButton text="Realm Explorer" onPress={toRealmExplorer} />}
        {!!isInAdminMode && <MenuButton text="Export Data" onPress={exportData} />}
        {!!isAdmin && (
          <IconButton Icon={<CogIcon />} label={buttonStrings.settings} onPress={toSettings} />
        )}
      </View>
    ),
    [isInAdminMode, isAdmin]
  );

  const ModuleLayout = useCallback(
    () => (
      <View style={styles.moduleTopRow}>
        <View style={moduleRow}>
          <CustomerSection />
          <SupplierSection />
        </View>
        <View style={moduleRow}>
          <StockSection />
          <ModulesSection />
        </View>
      </View>
    ),
    [usingModules, usingDashboard, usingDispensary, usingCashRegister, hasVaccines]
  );

  const OriginalLayout = useCallback(
    () => (
      <View style={styles.originalTopRow}>
        <CustomerSection />
        <SupplierSection />
        <StockSection />
      </View>
    ),
    [usingModules]
  );

  if (!isFocused) return null;

  return (
    <View style={{ ...appBackground }}>
      {usingModules || hasVaccines ? <ModuleLayout /> : <OriginalLayout />}
      <AdminRow />
    </View>
  );
};

const styles = {
  moduleTopRow: { flex: 19 },
  originalTopRow: { flex: 19, flexDirection: 'row' },
  moduleRow: { flex: 1, flexDirection: 'row' },
  image: { height: 150, width: 150, marginBottom: 30 },
  bottomRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  container: {
    alignItems: 'center',
    borderColor: SHADOW_BORDER,
    backgroundColor: 'white',
    marginBottom: 5,
    flex: 1,
    borderWidth: 1,
  },
  moduleContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: 5,
  },
  originalContainer: {
    justifyContent: 'flex-start',
    paddingTop: 50,
    marginHorizontal: 30,
  },
};

const mapDispatchToProps = dispatch => ({
  toVaccines: () => dispatch(goToVaccines()),
  toVaccineDispensingPage: () => dispatch(gotoVaccineDispensingPage()),
  toCustomerInvoices: () => dispatch(gotoCustomerInvoices()),
  toCustomerRequisitions: () => dispatch(gotoCustomerRequisitions()),
  toStock: () => dispatch(gotoStock()),
  toStocktakes: () => dispatch(gotoStocktakes()),
  toSupplierInvoices: () => dispatch(gotoSupplierInvoices()),
  toSupplierRequisitions: () => dispatch(gotoSupplierRequisitions()),
  toRealmExplorer: () => dispatch(gotoRealmExplorer()),
  toSettings: () => dispatch(gotoSettings()),
  toDispensary: () => dispatch(gotoDispensingPage()),
  toDashboard: () => dispatch(gotoDashboard()),
  toCashRegister: () => dispatch(goToCashRegister()),
  logout: () => dispatch(UserActions.logout()),
});

const mapStateToProps = state => {
  const { modules } = state;

  const {
    usingDashboard,
    usingDispensary,
    usingVaccines,
    usingCashRegister,
    usingModules,
  } = modules;

  const isAdmin = selectCurrentUserIsAdmin(state);
  const hasVaccines = selectHasVaccines(state);

  return {
    usingDashboard,
    usingDispensary,
    usingVaccines,
    usingCashRegister,
    usingModules,
    hasVaccines,
    isAdmin,
  };
};

export const MenuPage = connect(mapStateToProps, mapDispatchToProps)(Menu);

Menu.defaultProps = {
  isInAdminMode: false, // isInAdminMode kept for backwards compatibility with Desktop < v4.07
  isAdmin: false,
};

Menu.propTypes = {
  hasVaccines: PropTypes.bool.isRequired,
  isInAdminMode: PropTypes.bool,
  logout: PropTypes.func.isRequired,
  toVaccines: PropTypes.func.isRequired,
  toVaccineDispensingPage: PropTypes.func.isRequired,
  toCustomerInvoices: PropTypes.func.isRequired,
  toCustomerRequisitions: PropTypes.func.isRequired,
  toStock: PropTypes.func.isRequired,
  toStocktakes: PropTypes.func.isRequired,
  toSupplierInvoices: PropTypes.func.isRequired,
  toSupplierRequisitions: PropTypes.func.isRequired,
  toRealmExplorer: PropTypes.func.isRequired,
  toDispensary: PropTypes.func.isRequired,
  toSettings: PropTypes.func.isRequired,
  toDashboard: PropTypes.func.isRequired,
  toCashRegister: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool,
  usingDispensary: PropTypes.bool.isRequired,
  usingDashboard: PropTypes.bool.isRequired,
  usingCashRegister: PropTypes.bool.isRequired,
  usingModules: PropTypes.bool.isRequired,
  usingVaccines: PropTypes.bool.isRequired,
};
