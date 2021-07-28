/**
 * Sustainable Solutions (NZ) Ltd. 2021
 * mSupply Mobile
 */

import Realm from 'realm';

export class MedicineAdministrator extends Realm.Object {
  get displayString() {
    return `${this.code ?? ''} ${this.firstName ?? ''} ${this.lastName ?? ''}`.trim();
  }

  toJSON() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      code: this.code,
      isActive: this.isActive,
    };
  }
}

MedicineAdministrator.schema = {
  name: 'MedicineAdministrator',
  primaryKey: 'id',
  properties: {
    id: 'string',
    firstName: { type: 'string', optional: true },
    lastName: { type: 'string', optional: true },
    code: { type: 'string', optional: true },
    isActive: { type: 'bool', default: true },
    transactionBatches: {
      type: 'linkingObjects',
      objectType: 'TransactionBatch',
      property: 'medicineAdministrator',
    },
  },
};

export default MedicineAdministrator;
