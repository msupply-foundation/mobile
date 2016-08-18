import { CustomerPage } from './CustomerPage';
import { CustomersPage } from './CustomersPage';
import { CustomerInvoicePage,
         checkForFinaliseError as checkForCustomerInvoiceFinaliseError,
       } from './CustomerInvoicePage';
import { CustomerInvoicesPage } from './CustomerInvoicesPage';
import { FirstUsePage } from './FirstUsePage';
import { MenuPage } from './MenuPage';
import { RequisitionsPage } from './RequisitionsPage';
import { RequisitionPage,
         checkForFinaliseError as checkForRequisitionFinaliseError,
       } from './RequisitionPage';
import { StockPage } from './StockPage';
import { StocktakeEditPage,
         checkForFinaliseError as checkForStocktakeFinaliseError,
       } from './StocktakeEditPage';
import { StocktakeManagePage } from './StocktakeManagePage';
import { StocktakesPage } from './StocktakesPage';
import { SupplierInvoicePage } from './SupplierInvoicePage';
import { SupplierInvoicesPage } from './SupplierInvoicesPage';
import { RealmExplorer } from './RealmExplorer';

import { modalStrings } from '../localization';

export const PAGES = {
  customer: CustomerPage,
  customerInvoice: CustomerInvoicePage,
  customerInvoices: CustomerInvoicesPage,
  customers: CustomersPage,
  firstUse: FirstUsePage,
  menu: MenuPage,
  realmExplorer: RealmExplorer,
  root: MenuPage,
  stock: StockPage,
  requisitions: RequisitionsPage,
  requisition: RequisitionPage,
  stocktakeEditor: StocktakeEditPage,
  stocktakeManager: StocktakeManagePage,
  stocktakes: StocktakesPage,
  supplierInvoice: SupplierInvoicePage,
  supplierInvoices: SupplierInvoicesPage,
};

export const FINALISABLE_PAGES = {
  supplierInvoice: {
    recordType: 'Transaction',
    recordToFinaliseKey: 'transaction',
    finaliseText: modalStrings.finalise_supplier_invoice,
  },
  customerInvoice: {
    checkForError: checkForCustomerInvoiceFinaliseError,
    recordType: 'Transaction',
    recordToFinaliseKey: 'transaction',
    finaliseText: modalStrings.finalise_customer_invoice,
  },
  requisition: {
    checkForError: checkForRequisitionFinaliseError,
    recordType: 'Requisition',
    recordToFinaliseKey: 'requisition',
    finaliseText: modalStrings.finalise_requisition,
  },
  stocktakeEditor: {
    checkForError: checkForStocktakeFinaliseError,
    recordType: 'Stocktake',
    recordToFinaliseKey: 'stocktake',
    finaliseText: modalStrings.finalise_stocktake,
  },
};
