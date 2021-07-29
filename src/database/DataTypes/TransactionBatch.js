import Realm from 'realm';

import currency from '../../localization/currency';
import { generalStrings } from '../../localization';

/**
 * A transaction batch.
 *
 * @property  {string}       id
 * @property  {string}       itemId
 * @property  {string}       itemName
 * @property  {ItemBatch}    itemBatch
 * @property  {string}       batch
 * @property  {Date}         expiryDate
 * @property  {number}       packSize
 * @property  {number}       numberOfPacks
 * @property  {number}       numberOfPacksSent  For supplier invoices.
 * @property  {Transaction}  transaction
 * @property  {string}       note
 * @property  {number}       costPrice
 * @property  {number}       sellPrice
 * @property  {Name}         donor
 * @property  {number}       sortIndex
 */
export class TransactionBatch extends Realm.Object {
  /**
   * Delete transaction batch and associated item batch if can be safely removed.
   *
   * @param  {Realm}  database
   */
  destructor(database) {
    this.setTotalQuantity(database, 0); // Ensure reverting of any stock changes to item batches.

    // Can safely remove associated item batch if transaction batch was created by an external
    // supplier invoice.
    if (this.transaction.isExternalSupplierInvoice) {
      database.delete('ItemBatch', this.itemBatch);
    }
  }

  get currentLocationName() {
    return this.location?.description ?? '';
  }

  get currentVvmStatusName() {
    return this.vaccineVialMonitorStatus?.description ?? '';
  }

  get hasBreached() {
    return !!this.itemBatch?.hasBreached;
  }

  /**
   * Returns either the prescriber name who prescribed the medicine
   * to a patient, or an N/A.
   * @return {String}
   */
  get prescriber() {
    const { prescriber } = this.transaction;
    const { firstName = '', lastName = '' } = prescriber ?? {};
    if (!firstName && !lastName) return generalStrings.not_available;
    return `${firstName} ${lastName}`.trim();
  }

  /**
   * Returns either the prescriber name or the vaccinator
   * @return {String}
   */
  get prescriberOrVaccinator() {
    return this.vaccinator || this.prescriber;
  }

  /**
   * Get total quantity of this batch.
   *
   * @return  {number}
   */
  get totalQuantity() {
    return this.numberOfPacks * this.packSize;
  }

  /**
   * Get item code associated with this transaction batch.
   *
   * @return  {string}
   */
  get itemCode() {
    return this.itemBatch?.item?.code || '';
  }

  /**
   * Get id of associated item batch.
   *
   * @return  {string}
   */
  get itemBatchId() {
    return this.itemBatch?.id || '';
  }

  get confirmDate() {
    return this.transaction?.confirmDate ?? null;
  }

  /**
   * Set total quantity of this transaction batch.
   *
   * @param  {Realm}   database
   * @param  {number}  quantity
   */
  setTotalQuantity(database, quantity) {
    // When transactions are confirmed, they can be edited, but also effect stock levels.
    // Calculate the difference from the previous total quantity, and the new quantity to use
    // for adjusting the underlying item batches quantity for confirmed transactions.
    const difference = quantity - this.totalQuantity;
    this.numberOfPacks = this.packSize ? quantity / this.packSize : 0;

    // Recalculate a save the total price field of this batch
    this.total = this.totalPrice;

    // When transactions are confirmed (Customer invoices are always AT LEAST confirmed) adjustments
    // to quantities effect stock levels. Adjust the underlying item batch with the difference.
    if (this.transaction.isConfirmed) {
      // Incoming transactions increase stock levels, while outgoing decrease.
      const inventoryDifference = this.transaction.isIncoming ? difference : -difference;
      this.itemBatch.totalQuantity += inventoryDifference;
      database.save('ItemBatch', this.itemBatch);
    }

    database.save('TransactionBatch', this);
  }

  get isVaccine() {
    return this.itemBatch?.isVaccine ?? false;
  }

  get doses() {
    return this.totalQuantity * this.dosesPerVial;
  }

  get dosesPerVial() {
    return this.itemBatch?.dosesPerVial;
  }

  /**
   * Get total quantity of this transaction batch.
   *
   * @return  {number}
   */
  get totalQuantitySent() {
    // Calculate quantity as product of number of packs sent and pack size.
    return this.numberOfPacksSent * this.packSize;
  }

  /**
   * Get total price of this transaction batch.
   *
   * @return  {number}
   */
  get totalPrice() {
    if (!this.numberOfPacks) return 0;
    if (this.transaction.type === 'customer_invoice') {
      if (!this.sellPrice) return 0;
      return this.sellPrice * this.numberOfPacks;
    }
    // Must be a supplier invoice.
    if (!this.costPrice) return 0;
    if (this.transaction?.type === 'supplier_credit') return -this.costPrice * this.numberOfPacks;
    return this.costPrice * this.numberOfPacks;
  }

  /**
   * Get the maximum amount of the given quantity that can be allocated to this batch.
   *
   * @param   {number}  quantity  Quantity to allocate (can be positive or negative).
   * @return  {number}
   */
  getAmountToAllocate(quantity) {
    // Max that can be removed is the total quantity currently in the transaction batch.
    if (quantity < 0) return Math.max(quantity, -this.totalQuantity);
    // For outgoing transactions, max that can be added is amount in item batch.
    if (this.transaction.isOutgoing) {
      return Math.min(quantity, this.itemBatch.totalQuantity);
    }
    // For supplier invoice, there is no maximum amount that can be added.
    return quantity;
  }

  /**
   * Get string representation of transaction batch.
   *
   * @return  {string}
   */
  toString() {
    return `${this?.itemBatch} in a ${this.transaction.type}`;
  }

  get breaches() {
    return this.itemBatch?.breaches;
  }

  get otherPartyName() {
    return this.transaction?.otherParty?.name || '';
  }

  get costPriceString() {
    return currency(this.costPrice ?? 0).format();
  }

  get sellPriceString() {
    return currency(this.sellPrice ?? 0).format();
  }

  get vaccinator() {
    const vaccinator = this.medicineAdministrator ?? {};
    const { firstName = '', lastName = '' } = vaccinator;

    if (!lastName) return firstName;
    if (!firstName) return lastName;

    return `${lastName}, ${firstName}`;
  }
}

TransactionBatch.schema = {
  name: 'TransactionBatch',
  primaryKey: 'id',
  properties: {
    id: 'string',
    itemId: { type: 'string', optional: true },
    itemName: 'string?',
    itemBatch: 'ItemBatch?',
    batch: 'string?',
    expiryDate: { type: 'date', optional: true },
    packSize: 'double?',
    numberOfPacks: 'double?',
    numberOfPacksSent: { type: 'double', optional: true },
    transaction: 'Transaction',
    note: { type: 'string', optional: true },
    costPrice: 'double?',
    sellPrice: 'double?',
    donor: { type: 'Name', optional: true },
    sortIndex: { type: 'int', optional: true },
    total: { type: 'double', optional: true },
    type: { type: 'string', optional: true },
    linkedTransaction: { type: 'Transaction', optional: true },
    location: { type: 'Location', optional: true },
    vaccineVialMonitorStatus: { type: 'VaccineVialMonitorStatus', optional: true },
    sentPackSize: { type: 'double', default: 0 },
    medicineAdministrator: { type: 'MedicineAdministrator', optional: true },
    option: { type: 'Options', optional: true },
  },
};

export default TransactionBatch;
