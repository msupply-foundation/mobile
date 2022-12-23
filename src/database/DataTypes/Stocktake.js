/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';
import { complement } from 'set-manipulator';

import { addBatchToParent, createRecord, getTotal } from '../utilities';
import { generalStrings, modalStrings } from '../../localization';
import { UIDatabase } from '..';

/**
 * A stocktake.
 *
 * @property  {string}                id
 * @property  {string}                name
 * @property  {Date}                  createdDate    Includes time.
 * @property  {Date}                  stocktakeDate
 * @property  {string}                status
 * @property  {User}                  createdBy
 * @property  {User}                  finalisedBy
 * @property  {string}                comment
 * @property  {string}                serialNumber
 * @property  {List.<StocktakeItem>}  items
 * @property  {Transaction}           additions
 * @property  {Transaction}           reductions
 */
export class Stocktake extends Realm.Object {
  /**
   * Delete unfinalised stocktake. Throw error if stocktake is finalised.
   *
   * @param  {Realm}  database
   */
  destructor(database) {
    if (this.isFinalised) {
      throw new Error('Cannot delete a finalised Stocktake');
    }

    database.delete('StocktakeItem', this.items);
  }

  /**
   * Add a new stocktake batch and incorporate into a matching stocktake item.
   *
   * @param  {Realm}           database
   * @param  {StocktakeBatch}  stocktakeBatch
   */
  addBatchIfUnique(database, stocktakeBatch) {
    // TODO: rename method to addBatch.
    const { itemBatch } = stocktakeBatch ?? {};
    const { item } = itemBatch ?? {};
    if (item) {
      addBatchToParent(stocktakeBatch, this, () =>
        createRecord(database, 'StocktakeItem', this, item)
      );
    }
  }

  /**
   * Sets the stocktake items attached to this stocktake based on item id.
   * Only items which are passed in `itemIds` are set to the stocktake. Any
   * items currently in the stocktake which are not passed are removed, and
   * any extras are added.
   *
   * @param   {Realm}           database
   * @param   {Array.<string>}  itemIds
   */
  setItemsByID(database, itemIds) {
    if (this.isFinalised) {
      throw new Error('Cannot add items to a finalised stocktake');
    }

    // Delete any stocktake items not in |itemIds|.
    const itemsToRemove = complement(
      this.items,
      itemIds.map(itemId => ({ itemId })),
      stocktakeItem => stocktakeItem.itemId
    );
    if (itemsToRemove && itemsToRemove.length > 0) {
      database.delete('StocktakeItem', itemsToRemove);
    }

    // Add a new stocktake item for each new item id not currently in the stocktake.
    const itemIdsToAdd = complement(
      itemIds,
      this.items.map(stocktakeItem => stocktakeItem.itemId)
    );

    const items = database.objects('Item');
    itemIdsToAdd.forEach(itemId => {
      // Find the matching database item and use it to create a stocktake item.
      const item = items.filtered('id == $0', itemId)[0];
      const stocktakeItem = createRecord(database, 'StocktakeItem', this, item);

      // Add all item batches currently in stock to the stocktake item as stocktake batches.
      if (item.batchesWithStock.length > 0) {
        item.batchesWithStock.forEach(itemBatch => {
          createRecord(database, 'StocktakeBatch', stocktakeItem, itemBatch);
        });
      } else {
        stocktakeItem.createNewBatch(database);
      }
    });
  }

  /**
   * Returns if this stocktakes snapshot quantities are outdated.
   *
   * @return {Bool} Indicator if this stocktake is outdated.
   */
  get isOutdated() {
    return this.itemsOutdated.length > 0 && !this.isFinalised;
  }

  /**
   * Returns an Array of item objects that are currently in the stocktae.
   *
   * @return {Array} Realm.Item objects current in the stocktake.
   */
  get itemsInStocktake() {
    return this.items.reduce((acc, stocktakeItem) => {
      const { item } = stocktakeItem;
      if (item) return [...acc, item];
      return acc;
    }, []);
  }

  /**
   * Get if stocktake is confirmed.
   *
   * @return  {boolean}
   */
  get isConfirmed() {
    return this.status === 'confirmed';
  }

  /**
   * Get if stocktake is finalised.
   *
   * @return  {boolean}
   */
  get isFinalised() {
    return this.status === 'finalised';
  }

  /**
   * Get if stocktake is associated with a program,
   */
  get hasProgram() {
    return !!this.program;
  }

  /*
   * Get name of stocktake program.
   *
   * @return  {string}
   */
  get programName() {
    return this.hasProgram ? this.program.name : generalStrings.not_available;
  }

  /**
   * Get any stocktake items that have a batch that would cause a reduction larger than
   * the amount of available stock in inventory if it were finalised.
   *
   * @return  {Array.<StocktakeItem>}  All stocktake items that have been reduced below
   *                                   minimum level.
   */
  get itemsBelowMinimum() {
    return this.items.filter(stocktakeItem => stocktakeItem.isReducedBelowMinimum);
  }

  /**
   * Get all stocktake items where snapshot does not match stock on hand or the corresponding
   * item has any batch with stock with no corresponding stocktake batch.
   *
   * @return  {Array.<StocktakeItem>}
   */
  get itemsOutdated() {
    return this.items.filter(stocktakeItem => stocktakeItem.isOutdated);
  }

  /**
   * Get if stocktake has any items with counted batches.
   *
   * @return  {boolean}
   */
  get hasSomeCountedItems() {
    return this.items.some(item => item.hasBeenCounted);
  }

  /**
   * Get number of batches associated with this stocktake.
   *
   * @return  {number}
   */
  get numberOfBatches() {
    return getTotal(this.items, 'numberOfBatches');
  }

  /**
   * Get if stocktake has any item without reason set
   *
   * @return {boolean}
   */
  get hasReasonNotSet() {
    return this.items.some(item => item.hasReasonSet === true);
  }

  /**
   * Check wether Reason i.e. Option is activated in mSupply desktop
   * Return True if all positive and negative reasons are activated
   *
   * @return {boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  get isReasonActive() {
    return (
      UIDatabase.objects('NegativeAdjustmentReason').length > 0 &&
      UIDatabase.objects('PositiveAdjustmentReason').length > 0
    );
  }

  /**
   * Resets a list of stocktake items.
   *
   * @param  {Realm}                  database
   * @param  {Array.<StocktakeItem>}  stocktakeItems  Items to reset.
   */
  resetStocktake(database) {
    database.write(() => {
      this.itemsOutdated.forEach(outdatedItem => {
        outdatedItem.reset(database);
      });
    });
  }

  /**
   * Get or create reducing invoice for this stocktake.
   *
   * @param   {Realm}  database
   */
  getReductions(database) {
    if (!this.reductions) {
      this.reductions = createRecord(
        database,
        'InventoryAdjustment',
        this.finalisedBy,
        this.stocktakeDate,
        false
      );
    }
    return this.reductions;
  }

  /**
   * Get or create increasing invoice for this stocktake.
   *
   * @param   {Realm}  database
   */
  getAdditions(database) {
    if (!this.additions) {
      this.additions = createRecord(
        database,
        'InventoryAdjustment',
        this.finalisedBy,
        this.stocktakeDate,
        true
      );
    }
    return this.additions;
  }

  get canFinalise() {
    const finaliseStatus = { success: true, message: modalStrings.finalise_stocktake };
    if (!this.hasSomeCountedItems) {
      finaliseStatus.success = false;
      finaliseStatus.message = modalStrings.stocktake_no_counted_items;
    }

    if (this.isReasonActive && finaliseStatus.success) {
      if (this.hasReasonNotSet) {
        finaliseStatus.success = false;
        finaliseStatus.message = modalStrings.reason_must_set_before_finalizing_stocktake;
      }
    }

    return finaliseStatus;
  }

  /**
   * Finalises this stocktake and creates transactions to apply the stock changes to inventory.
   *
   * @param {Realm}  database
   * @param {User}   user
   */
  finalise(database, user) {
    if (this.isFinalised) {
      throw Error('Cannot finalise as stocktake already finalised');
    }
    if (this.itemsBelowMinimum.length > 0) {
      // Last check before ledger problems.
      throw Error('Attempt to finalise stocktake with adjustments that make item stock negative');
    }

    // Adjust stocktake inventory.
    this.adjustInventory(database, user);

    // Set the stocktake finalise details.
    this.status = 'finalised';
    this.finalisedBy = user;
    this.stocktakeDate = new Date();

    database.save('Stocktake', this);
  }

  /**
   * Applies differences in snapshot and counted quantities to the appropriate inventory
   * adjustment transactions.
   *
   * @param  {Realm}  database
   * @param  {User}   user
   */
  adjustInventory(database) {
    // Prune any stocktake item that has not had a quantity change.
    database.delete(
      'StocktakeItem',
      this.items.filter(stocktakeItem => !stocktakeItem.hasBeenCounted)
    );

    // Get every batch associated with this stocktake.
    const stocktakeBatches = database
      .objects('StocktakeBatch')
      .filtered('stocktake.id = $0', this.id);

    // Delete each new stocktake batch that has been created by stocktake but has not been changed.
    database.delete(
      'StocktakeBatch',
      stocktakeBatches.filter(
        stocktakeBatch =>
          stocktakeBatch.snapshotTotalQuantity === 0 && stocktakeBatch.difference === 0
      )
    );

    // |stocktakeBatch.finalise()| handles optimisation based on what fields were entered
    // (i.e. count/batch/expiry).
    stocktakeBatches.forEach(stocktakeBatch => stocktakeBatch.finalise(database));
  }

  /**
   * Adds all items associated to this stocktakes program.
   * @param {Realm} database
   */
  addItemsFromProgram(database) {
    if (!this.program) return false;
    this.setItemsByID(
      database,
      this.program.items.map(masterListItem => masterListItem.item.id)
    );
    return true;
  }
}

Stocktake.schema = {
  name: 'Stocktake',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'placeholderName' },
    createdDate: { type: 'date', default: new Date() },
    stocktakeDate: { type: 'date', optional: true },
    status: { type: 'string', default: 'new' },
    createdBy: { type: 'User', optional: true },
    finalisedBy: { type: 'User', optional: true },
    comment: { type: 'string', optional: true },
    serialNumber: { type: 'string', default: 'placeholderSerialNumber' },
    items: { type: 'list', objectType: 'StocktakeItem' },
    additions: { type: 'Transaction', optional: true },
    reductions: { type: 'Transaction', optional: true },
    program: { type: 'MasterList', optional: true },
  },
};

export default Stocktake;
