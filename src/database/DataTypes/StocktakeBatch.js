import Realm from 'realm';

import currency from '../../localization/currency';
import { createRecord } from '../utilities';

/**
 * A stocktake batch.
 *
 * @property  {string}     id
 * @property  {Stocktake}  stocktake
 * @property  {ItemBatch}  itemBatch
 * @property  {number}     snapshotNumberOfPacks
 * @property  {number}     packSize
 * @property  {Date}       expiryDate
 * @property  {string}     batch
 * @property  {number}     costPrice
 * @property  {number}     sellPrice
 * @property  {number}     countedNumberOfPacks
 * @property  {number}     sortIndex
 */
export class StocktakeBatch extends Realm.Object {
  /**
   * Delete stocktake batch and associated item batch.
   *
   * @param  {Realm}  database
   */
  destructor(database) {
    if (this.snapshotNumberOfPacks === 0 && this.itemBatch.numberOfPacks === 0) {
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

  get otherPartyName() {
    return this.supplier?.name ?? '';
  }

  /**
   * Get snapshot of total quantity in batch.
   *
   * @return  {number}
   */
  get snapshotTotalQuantity() {
    return this.snapshotNumberOfPacks * this.packSize;
  }

  /**
   * Get the total countedQuantity for this batch. If nothing has been
   * counted, return 0.
   *
   * @return  {number}
   */
  get countedTotalQuantity() {
    if (this.countedNumberOfPacks === null) return 0;
    return this.countedNumberOfPacks * this.packSize;
  }

  /**
   * Get if stocktake will reduce stock on hand of item below zero.
   *
   * Stock on hand should never be negative. This can occur when stock has been issued
   * in a customer invoice for this batch before the parent stocktake was finalised.
   *
   * @return  {boolean}
   */
  get isReducedBelowMinimum() {
    if (!this.itemBatch) return false;
    const { totalQuantity: stockOnHand } = this.itemBatch;

    // Return true if |stockOnHand + stocktakebatch.difference| is negative.
    return stockOnHand + this.difference < 0;
  }

  /**
   * Get if snapshot is out-of-date.
   *
   * Returns true if the |snapshotTotalQuantity| does not match the |totalQuantity| of the
   * item batch this stocktake batch is associated with. Will occur if inventory has changed
   * since this stocktake batch was created. If the net change on this batch is 0, then return
   * false.
   *
   * @return  {boolean}
   */
  get isSnapshotOutdated() {
    if (!this.itemBatch) return false;
    return this.snapshotTotalQuantity !== this.itemBatch.totalQuantity;
  }

  /**
   * Get if stocktake batch has been counted.
   *
   * @return  {boolean}
   */
  get hasBeenCounted() {
    return this.countedNumberOfPacks !== null;
  }

  /**
   * Get id of item associated with this stocktake batch.
   *
   * @return  {string}
   */
  get itemId() {
    if (!this.itemBatch) return '';
    return this.itemBatch.item ? this.itemBatch.item.id : '';
  }

  /**
   * Get id of item batch associated with this stocktake batch.
   *
   * @return  {string}
   */
  get itemBatchId() {
    return this.itemBatch ? this.itemBatch.id : '';
  }

  /**
   * Get difference between counted quantity and snapshop quantity.
   *
   * @return  {number}
   */
  get difference() {
    return this.countedTotalQuantity - this.snapshotTotalQuantity;
  }

  /**
   * Indicator that this batch has a positive difference in snapshot and
   * counted quantity.
   */
  get hasPositiveAdjustment() {
    return this.difference > 0;
  }

  /**
   * Indicator that this batch has a negative difference in snapshot and
   * counted quantity.
   */
  get hasNegativeAdjustment() {
    return this.difference < 0;
  }

  /**
   * Returns a string representing the units for this stocktake batch.
   * @return {string} the unit for this stocktake batch, or N/A if none has been assigned.
   */
  get unitString() {
    return this.itemBatch?.unitString;
  }

  /**
   * Returns an indicator that this batches reason/option state is valid.
   * Valid being: negative differences require a negativeInventoryAdjustment
   * option. Positive differences require a positiveInventoryAdjustment option
   * while no difference requires there to be no option applied.
   */
  get hasValidReason() {
    // Short circuits for simple cases
    if (!this.difference && !this.option) return true;
    if (this.difference && !this.option) return false;

    // Determine the validity of the reason state where there is a difference
    // and the batch already has a option.
    const { type } = this.option;

    const positiveAdjustmentReason = type === 'positiveInventoryAdjustment';
    const negativeAdjustmentReason =
      type === 'negativeInventoryAdjustment' || type === 'openVialWastage';

    const correctPositiveReason = positiveAdjustmentReason && this.hasPositiveAdjustment;
    const correctNegativeReason = negativeAdjustmentReason && this.hasNegativeAdjustment;

    return correctNegativeReason || correctPositiveReason;
  }

  /**
   * @return {String} this batches reason title, or an empty string.
   */
  get reasonTitle() {
    return (this.option && this.option.title) || '';
  }

  /**
   * Set counted total quantity.
   *
   * @param  {number}  quantity
   */
  set countedTotalQuantity(quantity) {
    // Handle packsize of 0.
    const countedNumberOfPacks = this.packSize ? quantity / this.packSize : 0;
    this.countedNumberOfPacks = countedNumberOfPacks;
  }

  get isVaccine() {
    return this.itemBatch?.isVaccine ?? false;
  }

  get dosesDifference() {
    return this.difference * this.dosesPerVial;
  }

  get snapshotDoses() {
    return this.snapshotTotalQuantity * this.dosesPerVial;
  }

  get doses() {
    return this.countedTotalQuantity * this.dosesPerVial;
  }

  get dosesPerVial() {
    return this.itemBatch?.dosesPerVial;
  }

  setDoses(database, newValue) {
    const newCountedTotalQuantity = Number(newValue / this.dosesPerVial);
    this.countedTotalQuantity = newCountedTotalQuantity;
    database.save('StocktakeBatch', this);
  }

  /**
   * Removes a reason from this batch if it already has a reason and difference.
   * @param {Realm} database App-wide database interface.
   */
  removeReason(database) {
    database.write(() => {
      this.option = null;
      database.save('StocktakeBatch', this);
    });
  }

  /**
   * Applies a reason to this batch after it has been validated as a valid reason
   *
   * @param {Realm} database App-wide database interface
   * @param {Option} newOption New option to apply
   */
  applyReason(database, newOption) {
    const { type: newOptionType } = newOption || {};

    const isPositiveAdjustmentReason = newOptionType === 'positiveInventoryAdjustment';
    const isNegativeAdjustmentReason =
      newOptionType === 'negativeInventoryAdjustment' || newOptionType === 'openVialWastage';

    // Valid adjustments are when this batch has a difference in snapshot quantity and
    // counted quantity and if the difference is positive, the reason must be a positive
    // reason also (and vice-versa for negatives)
    const isValidPositiveAdjustment =
      !!this.difference && this.hasPositiveAdjustment && isPositiveAdjustmentReason;
    const isValidNegativeAdjustment =
      !!this.difference && this.hasNegativeAdjustment && isNegativeAdjustmentReason;

    database.write(() => {
      database.update('StocktakeBatch', {
        id: this.id,
        option: isValidPositiveAdjustment || isValidNegativeAdjustment ? newOption : null,
      });
    });
  }

  /**
   * Finalise stocktake batch.
   *
   * Finalising will adjust inventory appropriately and will add a new transaction
   * batch in reducing or increasing transaction for this stocktake.
   *
   * @param  {Realm}  database
   */
  finalise(database) {
    // Update the item batch details.
    this.itemBatch.batch = this.batch;
    this.itemBatch.expiryDate = this.expiryDate;
    this.itemBatch.sellPrice = this.sellPrice;
    this.itemBatch.supplier = this.supplier;

    if (this.itemBatch.shouldApplyVvmStatus(this.vaccineVialMonitorStatus)) {
      this.itemBatch.applyVvmStatus(database, this.vaccineVialMonitorStatus);
    }

    if (this.itemBatch.shouldApplyLocation(this.location)) {
      this.itemBatch.applyLocation(database, this.location);
    }

    // Make inventory adjustments if there is a difference to apply.
    if (this.difference !== 0) {
      const isAddition = this.countedTotalQuantity > this.snapshotTotalQuantity;
      const inventoryAdjustment = isAddition
        ? this.stocktake.getAdditions(database)
        : this.stocktake.getReductions(database);

      // Create transaction item and transaction batch to store inventory adjustments in this
      // stocktake.
      const transactionItem = createRecord(
        database,
        'TransactionItem',
        inventoryAdjustment,
        this.itemBatch.item
      );
      const transactionBatch = createRecord(
        database,
        'TransactionBatch',
        transactionItem,
        this.itemBatch,
        isAddition
      );

      // Apply difference from stocktake to actual stock on hand levels. Whether stock is increased
      // or decreased is determined by the transaction, use the absolute value of difference
      // (i.e. always treat as positive).
      const snapshotDifference = Math.abs(this.difference);
      transactionBatch.setTotalQuantity(database, snapshotDifference);
      transactionBatch.option = this.option;
      database.save('TransactionBatch', transactionBatch);

      if (!this.itemBatch.totalQuantity) this.itemBatch.leaveLocation(database);
    }
    database.save('ItemBatch', this.itemBatch);
  }

  /**
   * Get string representation of stocktake batch.
   *
   * @return  {string}
   */
  toString() {
    return `Stocktake batch representing ${this.itemBatch}`;
  }

  get breaches() {
    return this.itemBatch?.breaches;
  }

  get itemName() {
    return this?.itemBatch?.itemName;
  }

  get costPriceString() {
    return currency(this.costPrice ?? 0).format();
  }

  get sellPriceString() {
    return currency(this.sellPrice ?? 0).format();
  }

  get hasVariance() {
    return this.countedNumberOfPacks !== this.snapshotNumberOfPacks && this.hasBeenCounted;
  }
}

StocktakeBatch.schema = {
  name: 'StocktakeBatch',
  primaryKey: 'id',
  properties: {
    id: 'string',
    stocktake: 'Stocktake',
    itemBatch: 'ItemBatch',
    snapshotNumberOfPacks: 'double',
    packSize: 'double',
    expiryDate: { type: 'date', optional: true },
    batch: 'string',
    costPrice: 'double',
    sellPrice: 'double',
    countedNumberOfPacks: { type: 'double', optional: true },
    sortIndex: { type: 'int', optional: true },
    option: { type: 'Options', optional: true },
    supplier: { type: 'Name', optional: true },
    location: { type: 'Location', optional: true },
    vaccineVialMonitorStatus: { type: 'VaccineVialMonitorStatus', optional: true },
  },
};

export default StocktakeBatch;
