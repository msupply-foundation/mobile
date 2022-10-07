/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { BackHandler } from 'react-native';
import { batch } from 'react-redux';
import { CommonActions, StackActions } from '@react-navigation/native';

import { UIDatabase } from '../database';
import { createRecord } from '../database/utilities';
import { navStrings } from '../localization';
import { ROUTES } from './constants';
import { RootNavigator } from './RootNavigator';
import { PrescriptionActions, FinaliseActions } from '../actions/index';
import { PREFERENCE_KEYS } from '../database/utilities/constants';
import { SensorActions } from '../actions/Entities/SensorActions';
import { TemperatureBreachConfigActions } from '../actions/Entities/TemperatureBreachConfigActions';
import { LocationActions, VaccinePrescriptionActions } from '../actions/Entities/index';

/**
 * Navigation Action Creators.
 *
 * This file contains actions related to navigation which can be dispatched
 * to the redux store.
 *
 * Actions should return either a plain object or a thunk for side effects.
 *
 * CommonActions are consists of action creators supplied by react-navigation.
 *
 * CommonActions.navigate() - accepts an object as the payload, which should
 * have the fields:
 *
 * - `name` (See: pages/index - PAGES - keys are names)
 * - `params` (See: Pages/pageContainer and pages/index FINALISABLE_PAGES for requirements)
 *
 */

export const createCustomerRequisition = ({
  currentUser,
  ...requisitionParameters
}) => dispatch => {
  // Create the requisition. If a program was supplied, add items from that
  // program, otherwise just navigate to it.
  let requisition;
  UIDatabase.write(() => {
    requisition = createRecord(
      UIDatabase,
      'CustomerRequisition',
      currentUser,
      requisitionParameters
    );

    if (requisition.program) {
      requisition.addItemsFromProgram(UIDatabase);
      requisition.createCustomerInvoice(UIDatabase, currentUser);
    }
  });

  dispatch(gotoCustomerRequisition(requisition));
};

/**
 * Action creator for handling back navigation.
 *
 * Triggers back navigation and cleans up current state.
 */
export const goBack = () => dispatch => {
  if (!RootNavigator.canGoBack()) BackHandler.exitApp();
  else {
    UIDatabase.write(() => {
      const prescriptions = UIDatabase.objects('Prescription').filtered('status != "finalised"');
      UIDatabase.delete('Transaction', prescriptions);

      const prevRouteName = RootNavigator.getPrevRouteName();

      const navigateBack = () =>
        dispatch({
          ...CommonActions.goBack(),
          payload: { prevRouteName },
        });

      const cleanUp = () => {
        dispatch(PrescriptionActions.deletePrescription());
        dispatch(SensorActions.reset());
        dispatch(TemperatureBreachConfigActions.reset());
        dispatch(LocationActions.reset());
      };

      batch(() => {
        navigateBack();
        cleanUp();
      });
    });
  }
};

/**
 * Action creator which first creates a prescription, and then navigates to it
 * for editing.
 *
 * @param {Object} patient     The other party of the invoice (Customer)
 * @param {Object} currentUser    The currently logged in user.
 */
export const createPrescription = patientID => (dispatch, getState) => {
  const { user } = getState();
  const { currentUser } = user;

  const patient = UIDatabase.get('Name', patientID);

  let newPrescription;
  UIDatabase.write(() => {
    newPrescription = createRecord(
      UIDatabase,
      'CustomerInvoice',
      patient,
      currentUser,
      'dispensary'
    );
  });

  dispatch(gotoPrescription(newPrescription));
};

export const goToVaccines = () =>
  CommonActions.navigate({
    name: ROUTES.VACCINES,
    params: { title: navStrings.vaccines },
  });

export const goToCashRegister = () =>
  CommonActions.navigate({
    name: ROUTES.CASH_REGISTER,
    params: { title: navStrings.cash_register },
  });

export const gotoPrescription = prescription =>
  CommonActions.navigate({
    name: ROUTES.PRESCRIPTION,
    params: {
      title: `${navStrings.prescription} ${prescription.serialNumber}`,
      transaction: prescription,
      patient: prescription.otherParty,
      pageObject: prescription,
    },
  });

export const gotoPrescriptions = () =>
  CommonActions.navigate({
    name: ROUTES.PRESCRIPTIONS,
    params: { title: 'Prescriptions' },
  });

export const gotoDispensingPage = () => dispatch => {
  UIDatabase.write(() => {
    UIDatabase.delete(
      'Transaction',
      UIDatabase.objects('Prescription').filtered('status != $0', 'finalised')
    );
  });

  dispatch(
    CommonActions.navigate({
      name: ROUTES.DISPENSARY,
      params: { title: navStrings.dispensary },
    })
  );
};

/**
 * Pushes the Settings page route onto the main navigation stack.
 */
export const gotoDashboard = () =>
  CommonActions.navigate({
    name: ROUTES.DASHBOARD,
    params: { title: navStrings.dashboard },
  });

/**
 * Pushes the Settings page route onto the main navigation stack.
 */
export const gotoSettings = () =>
  CommonActions.navigate({
    name: ROUTES.SETTINGS,
    params: {
      title: navStrings.settings,
    },
  });

console.log('gotoSettings ', gotoSettings);

/**
 * Pushes the Realm explorer route onto the main navigation stack.
 */
export const gotoRealmExplorer = () =>
  CommonActions.navigate({
    name: ROUTES.REALM_EXPLORER,
    params: {
      title: navStrings.database_contents,
    },
  });

/**
 * Pushes the Customer Invoices route onto the main navigation stack.
 */
export const gotoCustomerInvoices = () => dispatch => {
  UIDatabase.write(() => {
    UIDatabase.delete(
      'Transaction',
      UIDatabase.objects('Prescription').filtered('status != $0', 'finalised')
    );
  });

  dispatch(
    CommonActions.navigate({
      name: ROUTES.CUSTOMER_INVOICES,
      params: { title: navStrings.customer_invoices },
    })
  );
};

/**
 * Pushes the Customer Requisitions route onto the main navigation stack.
 */
export const gotoCustomerRequisitions = () =>
  CommonActions.navigate({
    name: ROUTES.CUSTOMER_REQUISITIONS,
    params: {
      title: navStrings.customer_requisitions,
    },
  });

/**
 * Pushes the Supplier Invoices route onto the main navigation stack.
 */
export const gotoSupplierInvoices = () =>
  CommonActions.navigate({
    name: ROUTES.SUPPLIER_INVOICES,
    params: {
      title: navStrings.supplier_invoices,
    },
  });

/**
 * Pushes the Supplier Requisitions route onto the main navigation stack.
 */
export const gotoSupplierRequisitions = () =>
  CommonActions.navigate({
    name: ROUTES.SUPPLIER_REQUISITIONS,
    params: {
      title: navStrings.supplier_requisitions,
    },
  });

/**
 * Pushes the Stocktakes route onto the main navigation stack.
 */
export const gotoStocktakes = () =>
  CommonActions.navigate({
    name: ROUTES.STOCKTAKES,
    params: {
      title: navStrings.stocktakes,
    },
  });

/**
 * Pushes the Stock route onto the main navigation stack.
 */
export const gotoStock = () =>
  CommonActions.navigate({
    name: ROUTES.STOCK,
    params: {
      title: navStrings.current_stock,
    },
  });

/**
 * Action creator for navigating to the Stocktake Manage screen.
 *
 * @param {String} stocktakeName The name of the stocktake to pass to the next screen.
 * @param {Object} stocktake The stocktake to pass to the next screen.
 */
export const gotoStocktakeManagePage = (stocktakeName, stocktake) => dispatch => {
  const currentRouteName = RootNavigator.getCurrentRouteName();

  const name = ROUTES.STOCKTAKE_MANAGER;
  const params = {
    stocktakeName,
    stocktake,
    pageObject: stocktake,
  };

  if (currentRouteName === ROUTES.STOCKTAKES) {
    batch(() => {
      dispatch(CommonActions.navigate({ name, params }));
      dispatch(FinaliseActions.setFinaliseItem(null));
    });
  } else {
    batch(() => {
      dispatch(StackActions.replace(name, params));
      dispatch(FinaliseActions.setFinaliseItem(null));
    });
  }
};

/**
 * Navigate to the StocktakeEditPage.
 *
 * @param {Object} stocktake  The requisition to navigate to.
 */
export const gotoStocktakeEditPage = stocktake => dispatch => {
  const currentName = RootNavigator.getCurrentRouteName();
  const name = ROUTES.STOCKTAKE_EDITOR;
  const params = { title: navStrings.stocktake, stocktake, pageObject: stocktake };

  // If navigating from the stocktakesPage, go straight to the StocktakeEditPage. Otherwise,
  // replace the current page as the user is coming from StocktakeManagePage.
  if (currentName === ROUTES.STOCKTAKES) {
    batch(() => {
      dispatch(CommonActions.navigate({ name, params }));
      dispatch(FinaliseActions.setFinaliseItem(stocktake));
    });
  } else {
    batch(() => {
      dispatch(StackActions.replace(name, params));
      dispatch(FinaliseActions.setFinaliseItem(stocktake));
    });
  }
};

/**
 * Action creator for navigating to a customer invoice. Ensures the CI is at least
 * confirmed before navigating as if this is not enforced, it is possible for
 * a particular item being issued across multiple invoices in larger quantities
 * than are available.
 *
 * @param {Object} transaction The CI to navigate to.
 * @param {Object} dispatch    Redux dispatch method.
 */
export const gotoCustomerInvoice = transaction => dispatch => {
  const { isCredit, isConfirmed, isFinalised } = transaction;

  // Customer invoices are generally created with the status confirmed. This handles unexpected
  // cases of an incoming sycned invoice with status 'nw' or 'sg'.
  if (!isConfirmed && !isFinalised) {
    UIDatabase.write(() => {
      transaction.confirm(UIDatabase);
      UIDatabase.save('Transaction', transaction);
    });
  }

  const navigationAction = CommonActions.navigate({
    name: ROUTES.CUSTOMER_INVOICE,
    params: {
      title: `${isCredit ? navStrings.credit : navStrings.invoice} ${transaction.serialNumber}`,
      transaction,
      pageObject: transaction,
    },
  });

  batch(() => {
    dispatch(navigationAction);
    dispatch(FinaliseActions.setFinaliseItem(transaction));
  });
};

/**
 * Action creator for navigating to a SupplierInvoice. Ensures the SI is finalised, if
 * confirmed before navigating. This should not occur, but if this is not enforced, a
 * user can reduce the amount of stock in a SI which has been used in a CI, which causes
 * inventory adjustments instantly.
 *
 * @param {Object} transaction The SI to navigate to.
 * @param {Object} dispatch    Redux dispatch method.
 */
export const gotoSupplierInvoice = transaction => dispatch => {
  const { isSupplierInvoice, isConfirmed } = transaction;

  // Supplier invoices are `new` or `finalised`. Ensure any `confirmed` invoices are
  // `finalised` before navigating.
  if (isConfirmed) {
    UIDatabase.write(() => {
      transaction.finalise(UIDatabase);
      UIDatabase.save('Transaction', transaction);
    });
  }

  const invoiceTitle = `${navStrings.invoice} ${transaction.serialNumber}`;
  const creditTitle = `${navStrings.supplier_credit} ${transaction.serialNumber}`;

  const navigationAction = CommonActions.navigate({
    name: ROUTES.SUPPLIER_INVOICE,
    params: {
      title: isSupplierInvoice ? invoiceTitle : creditTitle,
      transaction,
      pageObject: transaction,
    },
  });

  batch(() => {
    dispatch(navigationAction);
    dispatch(FinaliseActions.setFinaliseItem(transaction));
  });
};

/**
 * Navigate to the SupplierRequisitionPage.
 *
 * @param {Object} requisition  SupplierRequisition to navigate to.
 */
export const gotoSupplierRequisition = requisition => dispatch => {
  batch(() => {
    dispatch(
      CommonActions.navigate({
        name: ROUTES.SUPPLIER_REQUISITION,
        params: {
          title: `${navStrings.requisition} ${requisition.serialNumber}`,
          requisition,
          pageObject: requisition,
        },
      })
    );
    dispatch(FinaliseActions.setFinaliseItem(requisition));
  });
};

/**
 * Navigate to the CustomerRequisitionPage.
 *
 * @param {Object} requisition  Customer requisition to navigate to.
 */
export const gotoCustomerRequisition = requisition => dispatch => {
  batch(() => {
    dispatch(
      CommonActions.navigate({
        name: ROUTES.CUSTOMER_REQUISITION,
        params: {
          title: `${navStrings.requisition} ${requisition.serialNumber}`,
          requisition,
          pageObject: requisition,
        },
      })
    );
    dispatch(FinaliseActions.setFinaliseItem(requisition));
  });
};

/**
 * Action creator for creating, and navigating to a Supplier Requsition.
 * Requisition is created by a thunk initially.
 *
 * @param {String} CurrentUser The currently logged in user.
 * @param {Object} requisitionParameters Parameters for the to-be-created object.
 * RequisitionParameters can be any fields in Requisition.js to pass to createRecord.
 */
export const createSupplierRequisition = ({
  currentUser,
  ...requisitionParameters
}) => dispatch => {
  // Months lead time has an effect on daysToSupply for a requisition.
  const monthsLeadTime = UIDatabase.getPreference(PREFERENCE_KEYS.MONTHS_LEAD_TIME) ?? 0;

  // Create the requisition. If a program was supplied, add items from that
  // program, otherwise just navigate to it.
  let requisition;
  UIDatabase.write(() => {
    requisition = createRecord(UIDatabase, 'Requisition', currentUser, {
      ...requisitionParameters,
      monthsLeadTime,
    });

    if (requisition.program) requisition.addItemsFromProgram(UIDatabase);
  });

  dispatch(gotoSupplierRequisition(requisition));
};

/**
 * Creates a stocktake and replaces the current route in the StackNavigator which
 * would be a StocktakeManagePage, with a StocktakeEditPage, with the newly
 * created Stocktake.
 *
 * @param {Object} StocktakeParameters  Parameters for the stocktake to create.
 */
export const createStocktake = ({ currentUser, stocktakeName, program, itemIds }) => dispatch => {
  let stocktake;

  UIDatabase.write(() => {
    stocktake = createRecord(UIDatabase, 'Stocktake', currentUser, stocktakeName, program);
    if (program) stocktake.addItemsFromProgram(UIDatabase);
    else if (itemIds) stocktake.setItemsByID(UIDatabase, itemIds);
  });

  // If creating a Stocktake with a program or with a list of itemIds, navigate to
  // the StocktakeEditPage. Otherwise, navigate to the StocktakeManagePage.
  return program || itemIds
    ? dispatch(gotoStocktakeEditPage(stocktake))
    : dispatch(gotoStocktakeManagePage(stocktakeName, stocktake));
};

/**
 * Action creator which first creates a customer invoice, and then navigates to it
 * for editing.
 *
 * @param {Object} otherParty     The other party of the invoice (Customer)
 * @param {Object} currentUser    The currently logged in user.
 */
export const createCustomerInvoice = (otherParty, currentUser) => dispatch => {
  let newCustomerInvoice;
  UIDatabase.write(() => {
    newCustomerInvoice = createRecord(UIDatabase, 'CustomerInvoice', otherParty, currentUser);
  });

  dispatch(gotoCustomerInvoice(newCustomerInvoice));
};

/**
 * Action creator which first creates a supplier invoice, and then navigates to it
 * for editing.
 *
 * @param {Object} otherParty     The other party of the invoice (Supplier)
 * @param {Object} currentUser    The currently logged in user.
 */
export const createSupplierInvoice = (otherParty, currentUser) => dispatch => {
  let newCustomerInvoice;
  UIDatabase.write(() => {
    newCustomerInvoice = createRecord(UIDatabase, 'SupplierInvoice', otherParty, currentUser);
  });

  dispatch(gotoSupplierInvoice(newCustomerInvoice));
};

/**
 * Updates a Stocktake with the passed array of itemIDs and navigates to a
 * StocktakeEditPage.
 *
 * @param {Object} stocktake realm Stocktake object
 * @param {Array}  itemIds   Array of item id strings that should be the new
 *                           Items in the stocktake.
 * @param {String} name   Name of the stocktake for updating. Cannot update to remove completely.
 */
export const updateStocktake = (stocktake, itemIds, name = '') => dispatch => {
  UIDatabase.write(() => {
    if (name) stocktake.name = name;

    stocktake.setItemsByID(UIDatabase, itemIds);
    UIDatabase.save('Stocktake', stocktake);
  });

  dispatch(gotoStocktakeEditPage(stocktake));
};

export const gotoFridgeDetailPage = locationID => async dispatch => {
  dispatch(CommonActions.navigate({ name: ROUTES.FRIDGE_DETAIL, params: { locationID } }));
};

export const gotoNewSensorPage = () => CommonActions.navigate({ name: ROUTES.SENSOR_NEW });

export const gotoEditSensorPage = sensor =>
  CommonActions.navigate({ name: ROUTES.SENSOR_EDIT, params: { sensor } });

export const gotoVaccineDispensingPage = () => async dispatch => {
  batch(() => {
    dispatch(VaccinePrescriptionActions.create());
    dispatch(CommonActions.navigate({ name: ROUTES.VACCINE_PRESCRIPTION }));
  });
};
