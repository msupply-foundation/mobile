/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import RNFS from 'react-native-fs';

import { SETTINGS_KEYS } from '../settings';
import { formatDate, requestPermission, backupValidation } from '../utilities';

const { THIS_STORE_NAME_ID } = SETTINGS_KEYS;

const translateToCoreDatabaseType = type => {
  switch (type) {
    case 'CustomerInvoice':
    case 'SupplierInvoice':
      return 'Transaction';
    case 'Customer':
    case 'Supplier':
    case 'InternalSupplier':
    case 'ExternalSupplier':
      return 'Name';
    case 'RequestRequisition':
    case 'ResponseRequisition':
      return 'Requisition';
    default:
      return type;
  }
};

export class UIDatabase {
  constructor(database) {
    this.database = database;
  }

  ERRORS = {
    ERROR_IN_TRANSACTION: { code: 'ERROR_IN_TRANSACTION', message: 'Database is in a transaction' },
    ERROR_NO_PERMISSION: { code: 'ERROR_NO_PERMISSION', message: 'Storage permission not granted' },
    ERROR_UNKNOWN: { code: 'ERROR_UNKNOWN', message: 'Unkown error occurred' },
  };

  /**
   * Exports the realm file to '/Download/mSupplyMobile\ data' on device file system.
   * Ensures there is enough space, the realm exists and requests storage permission,
   * if required.
   */

  async exportData(filename = 'msupply-mobile-data') {
    const { realm } = this.database;
    const { path: realmPath } = realm;
    const exportFolder = `${RNFS.ExternalStorageDirectoryPath}/Download/mSupplyMobile_data`;
    // Replace all invalid characters in the android file system with an empty string.
    const copyFileName = `${filename}${formatDate(new Date(), 'dashes')}`.replace(
      /[~\\\\/|?*<:>"+]/g,
      ''
    );

    const permissionParameters = {
      permissionType: 'WRITE_EXTERNAL_STORAGE',
      message: 'Export database',
    };

    // Before requesting permissions, ensure there is enough space and the realm
    // file exists.
    const exportValidation = await backupValidation(realmPath);
    const { success } = exportValidation;
    if (!success) return exportValidation;
    // Request permissions for external storage before trying to backup the realm file.
    const { success: permissionSuccess } = await requestPermission(permissionParameters);
    // If permission was granted, ensure the realm is not in a transaction and backup
    // the realm file.
    if (!permissionSuccess) return { success: false, ...this.ERRORS.ERROR_NO_PERMISSION };
    if (realm.isInTransaction) return { success: false, ...this.ERRORS.ERROR_IN_TRANSACTION };

    // Finally try to create the backup/exported realm
    try {
      await RNFS.mkdir(exportFolder);
      await RNFS.copyFile(realmPath, `${exportFolder}/${copyFileName}.realm`);
    } catch (error) {
      return { success: false, ...this.ERRORS.ERROR_UNKNOWN, error };
    }

    return { success: true };
  }

  objects(type) {
    const results = this.database.objects(translateToCoreDatabaseType(type));
    const thisStoreNameIdSetting = this.database
      .objects('Setting')
      .filtered('key == $0', THIS_STORE_NAME_ID)[0];
    // |ownStoreIdSetting| will not exist if not initialised.
    const thisStoreNameId = thisStoreNameIdSetting && thisStoreNameIdSetting.value;

    switch (type) {
      case 'CustomerInvoice':
        // Only show invoices generated from requisitions once finalised.
        return results.filtered(
          'type == "customer_invoice" AND (linkedRequisition == null OR status == "finalised")'
        );
      case 'SupplierInvoice':
        return results.filtered(
          'type == "supplier_invoice" AND otherParty.type != "inventory_adjustment"'
        );
      case 'Customer':
        return results.filtered(
          'isVisible == true AND isCustomer == true AND id != $0',
          thisStoreNameId
        );
      case 'Supplier':
        return results.filtered(
          'isVisible == true AND isSupplier == true AND id != $0',
          thisStoreNameId
        );
      case 'InternalSupplier':
        return results.filtered(
          'isVisible == true AND isSupplier == true AND type == "store" AND id != $0',
          thisStoreNameId
        );
      case 'ExternalSupplier':
        return results.filtered('isVisible == true AND isSupplier == true AND type == "facility"');
      case 'Item':
        return results.filtered('isVisible == true');
      case 'RequestRequisition':
        return results.filtered('type == "request"');
      case 'ResponseRequisition':
        return results.filtered('serialNumber != "-1" AND type == "response"');
      default:
        return results;
    }
  }

  addListener(...args) {
    return this.database.addListener(...args);
  }

  removeListener(...args) {
    return this.database.removeListener(...args);
  }

  alertListeners(...args) {
    return this.database.alertListeners(...args);
  }

  create(...args) {
    return this.database.create(...args);
  }

  getOrCreate(...args) {
    return this.database.getOrCreate(...args);
  }

  delete(...args) {
    return this.database.delete(...args);
  }

  deleteAll(...args) {
    return this.database.deleteAll(...args);
  }

  save(...args) {
    return this.database.save(...args);
  }

  update(...args) {
    return this.database.update(...args);
  }

  write(...args) {
    return this.database.write(...args);
  }
}

export default UIDatabase;
