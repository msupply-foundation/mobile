/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';
import { UIDatabase } from '../index';
import { PREFERENCE_KEYS } from '../utilities/preferenceConstants';

/**
 * A name.
 *
 * @property  {string}              id
 * @property  {string}              name
 * @property  {string}              barcode
 * @property  {string}              code
 * @property  {string}              phoneNumber
 * @property  {Address}             billingAddress
 * @property  {string}              emailAddress
 * @property  {string}              type
 * @property  {boolean}             isCustomer
 * @property  {boolean}             isSupplier
 * @property  {boolean}             isManufacturer
 * @property  {List.<MasterList>}   masterLists
 * @property  {List.<Transaction>}  transactions
 * @property  {boolean}             isVisible
 * @property  {string}              supplyingStoreId
 */
export class Name extends Realm.Object {
  /**
   * Delete any name to store joins referencing removed name.
   *
   * @param  {Realm}  database
   */
  destructor(database) {
    // Clean up name store joins referencing deleted name.
    const nameStoreJoins = database.objects('NameStoreJoin').filtered('nameId == $0', this.id);
    database.delete('NameStoreJoin', nameStoreJoins);
  }

  /**
   * Get first line of billing address.
   */
  get addressOne() {
    return this.billingAddress?.line1 ?? '';
  }

  /**
   * Get second line of billing address.
   */
  get addressTwo() {
    return this.billingAddress?.line2 ?? '';
  }

  /**
   * The credit sources for this name are the literal customer credit type transactions, as well
   * as any customer invoices which are cancellations. These cancelled customer invoices are
   * inverted customer invoices, which are equivallent to a customer credit.
   */
  get creditSources() {
    const queryString = 'type == $0 || (type == $1 && isCancellation == $2) && outstanding != 0';
    return this.transactions.filtered(queryString, 'customer_credit', 'customer_invoice', true);
  }

  /**
   * Debit sources are customer invoices which are not cancellations - all outgoings.
   */
  get debitSources() {
    const queryString = 'type == $0 && isCancellation == $1 && outstanding != 0';
    return this.transactions.filtered(queryString, 'customer_invoice', false);
  }

  /**
   * Returns the available credit for this Name.
   */
  get availableCredit() {
    const sumOfCredits = this.creditSources.sum('outstanding');
    const sumOfDebits = this.debitSources.sum('outstanding');

    return Math.abs(sumOfCredits + sumOfDebits);
  }

  /**
   * Get if name represents an external supplier.
   *
   * @return  {boolean}
   */
  get isExternalSupplier() {
    return this.type === 'facility' && this.isSupplier;
  }

  /**
   * Get if name represents an internal supplier.
   *
   * @return  {boolean}
   */
  get isInternalSupplier() {
    return this.type === 'store' && this.isSupplier;
  }

  /**
   * Get if this name record can be edited.
   *
   * @return  {boolean}
   */
  get isEditable() {
    return (
      UIDatabase.getPreference(PREFERENCE_KEYS.CAN_EDIT_PATIENTS_FROM_ANY_STORE) ||
      this.thisStoresPatient
    );
  }

  get nameTags() {
    return this.nameTagJoins.map(({ nameTag }) => nameTag.description);
  }

  get mostRecentPCD() {
    return (
      this.nameNotes.filtered("patientEvent.code == 'PCD'").sorted('entryDate', true)[0] ?? null
    );
  }

  /**
   * Add master list to name, if it has not already been added.
   *
   * @param  {MasterList}  masterList
   */
  addMasterListIfUnique(masterList) {
    if (this.masterLists.filtered('id == $0', masterList.id).length > 0) return;
    this.masterLists.push(masterList);
  }

  /**
   * Get string representation of name.
   */
  toString() {
    return this.name;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      barcode: this.barcode,
      code: this.code,
      dateOfBirth: this.dateOfBirth?.getTime(),
      phoneNumber: this.phoneNumber,
      country: this.country,
      billingAddress: this.billingAddress?.toJSON(),
      addressOne: this.addressOne,
      addressTwo: this.addressTwo,
      emailAddress: this.emailAddress,
      type: this.type,
      masterLists: this.masterLists,
      isVisible: this.isVisible,
      supplyingStoreId: this.supplyingStoreId,
      firstName: this.firstName,
      middleName: this.middleName,
      lastName: this.lastName,
      isActive: this.isActive,
      isDeceased: this.isDeceased,
      isCustomer: this.isCustomer,
      isSupplier: this.isSupplier,
      isManufacturer: this.isManufacturer,
      isPatient: this.isPatient,
      female: this.female,
      thisStoresPatient: this.thisStoresPatient,
      nationality: this.nationality?.toJSON(),
      ethnicity: this.ethnicity?.toJSON(),
      nameNotes: this.nameNotes?.map(nameNote => nameNote.toObject()),
      isEditable: this.isEditable,
      createdDate: this.createdDate?.getTime(),
    };
  }
}

Name.schema = {
  name: 'Name',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'placeholderName' },
    barcode: { type: 'string', default: 'placeholderBarcode' },
    code: { type: 'string', default: 'placeholderCode' },
    dateOfBirth: { type: 'date', optional: true },
    phoneNumber: { type: 'string', optional: true },
    country: { type: 'string', optional: true },
    billingAddress: { type: 'Address', optional: true },
    emailAddress: { type: 'string', optional: true },
    type: { type: 'string', default: 'placeholderType' },
    masterLists: { type: 'list', objectType: 'MasterList' },
    transactions: { type: 'linkingObjects', objectType: 'Transaction', property: 'otherParty' },
    isVisible: { type: 'bool', default: false },
    supplyingStoreId: { type: 'string', optional: true },
    firstName: { type: 'string', optional: true },
    middleName: { type: 'string', optional: true },
    lastName: { type: 'string', optional: true },
    isActive: { type: 'bool', optional: true },
    isDeceased: { type: 'bool', optional: true },
    isDeleted: { type: 'bool', optional: true },
    isCustomer: { type: 'bool', default: false },
    isSupplier: { type: 'bool', default: false },
    isManufacturer: { type: 'bool', default: false },
    isPatient: { type: 'bool', default: false },
    policies: { type: 'linkingObjects', objectType: 'InsurancePolicy', property: 'patient' },
    female: { type: 'bool', default: false },
    thisStoresPatient: { type: 'bool', default: false },
    nameTagJoins: { type: 'linkingObjects', objectType: 'NameTagJoin', property: 'name' },
    nationality: { type: 'Nationality', optional: true },
    occupation: { type: 'Occupation', optional: true },
    ethnicity: { type: 'Ethnicity', optional: true },
    nameNotes: { type: 'linkingObjects', objectType: 'NameNote', property: 'name' },
    createdDate: { type: 'date', optional: true },
  },
};

export default Name;
