/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';
import { complement } from 'set-manipulator';

import { NUMBER_OF_DAYS_IN_A_MONTH, createRecord, getTotal } from '../utilities';
import { UIDatabase } from '..';
import { programDailyUsage } from '../../utilities/dailyUsage';
import { generalStrings, modalStrings } from '../../localization';
import { SETTINGS_KEYS } from '../../settings';
import { PREFERENCE_KEYS } from '../utilities/preferenceConstants';

/**
 * A requisition.
 *
 * @property  {string}                  id
 * @property  {string}                  status
 * @property  {Name}                    otherStoreName
 * @property  {string}                  type                Type of requisition, valid values
 *                                                          are 'imprest', 'forecast', 'request',
 *                                                          'response'.
 * @property  {Date}                    entryDate
 * @property  {number}                  daysToSupply
 * @property  {string}                  serialNumber
 * @property  {string}                  requesterReference
 * @property  {string}                  comment
 * @property  {User}                    enteredBy
 * @property  {List.<RequisitionItem>}  items
 * @property  {Transaction}             linkedTransaction
 * @property  {MasterList}              program
 * @property  {Period}                  period
 * @property  {String}                  orderType
 */
export class Requisition extends Realm.Object {
  /**
   * Create a new requisition.
   */
  constructor() {
    super();
    this.removeItemsById = this.removeItemsById.bind(this);
    this.addItemsFromMasterList = this.addItemsFromMasterList.bind(this);
    this.addItem = this.addItem.bind(this);
    this.setRequestedToSuggested = this.setRequestedToSuggested.bind(this);
  }

  /**
   * Delete requisition and associated requisition items/period.
   *
   * @param {Realm} database
   */
  destructor(database) {
    database.delete('RequisitionItem', this.items);

    if (this.linkedTransaction) {
      database.delete('Transaction', this.linkedTransaction);
    }
  }

  /**
   * Get if requisition is confirmed.
   *
   * @return  {boolean}
   */
  get isConfirmed() {
    return this.status === 'confirmed';
  }

  /**
   * Get if requisition is finalised.
   *
   * @return  {boolean}
   */
  get isFinalised() {
    return this.status === 'finalised';
  }

  /**
   * Get if requisition is a request.
   *
   * @return  {boolean}
   */
  get isRequest() {
    return this.type === 'request';
  }

  /**
   * Get if requisition is a response.
   *
   * @return  {boolean}
   */
  get isResponse() {
    return this.type === 'response';
  }

  /**
   * Get if is program requisition.
   */
  get hasProgram() {
    return !!this.program;
  }

  /**
   * Get name of user who entered requisition.
   *
   * @return  {string}
   */
  get enteredByName() {
    return this.enteredBy ? this.enteredBy.username : '';
  }

  /*
   * Get name of requisition program.
   *
   * @return  {string}
   */
  get programName() {
    return this.hasProgram ? this.program.name : generalStrings.not_available;
  }

  /**
   * Get id of user who entered requisition.
   *
   * @return  {string}
   */
  get enteredById() {
    return this.enteredBy ? this.enteredBy.id : '';
  }

  /**
   * Get months to supply of requisition.
   *
   * @return  {number}
   */
  get monthsToSupply() {
    return Math.floor(this.daysToSupply / NUMBER_OF_DAYS_IN_A_MONTH);
  }

  /**
   * Get the sum of required quantities for all items associated with requisition.
   *
   * @return  {number}
   */
  get totalRequiredQuantity() {
    return getTotal(this.items, 'requiredQuantity');
  }

  get numberOfOrderedItems() {
    const hasBeenCounted = requisitionItem => (requisitionItem.requiredQuantity !== 0 ? 1 : 0);
    return this.items.reduce((acc, item) => acc + hasBeenCounted(item), 0);
  }

  get numberOfSuppliedItems() {
    const hasBeenCounted = requisitionItem => (requisitionItem.suppliedQuantity !== 0 ? 1 : 0);
    return this.items.reduce((acc, item) => acc + hasBeenCounted(item), 0);
  }

  /**
   * Get number of items associated with requisition.
   *
   * @return  {number}
   */
  get numberOfItems() {
    return this.items.length;
  }

  get parsedCustomData() {
    return this.customData && JSON.parse(this.customData);
  }

  /**
   * Gets the other party (supplier or customer) name.
   * @return {String}
   */
  get otherPartyName() {
    return (this.otherStoreName && this.otherStoreName.name) || '';
  }

  /**
   * Get all indicators associated with this requisition.
   * @returns {Array.<ProgramIndicator>}
   */
  get indicators() {
    if (this.isRequest) return this.program?.activeIndicators;
    if (this.isResponse) {
      const periodIndicators = this.period?.indicators;
      const programIndicators = this.program?.indicators;
      const indicators =
        periodIndicators?.reduce((acc, indicator) => {
          const isValidIndicator = !!programIndicators.find(({ id }) => id === indicator.id);
          return isValidIndicator ? [...acc, indicator] : acc;
        }, []) ?? [];
      return indicators;
    }
    return null;
  }

  /**
   * Set the days to supply of this requisition in months.
   *
   * @param  {number}  months
   */
  set monthsToSupply(months) {
    this.daysToSupply = months * NUMBER_OF_DAYS_IN_A_MONTH;
  }

  // Saves a new customData string. Call inside a write/transaction
  // @data object matching shape of customData, it better be inclusive of EVERYTHING!
  saveCustomData(data) {
    this.customData = data && JSON.stringify({ ...data });
  }

  /**
   * Check whether requisition requests a given item.
   *
   * @param   {RequisitionItem}  item
   * @return  {boolean}
   */
  hasItem(item) {
    const itemId = item.realItem.id;
    return this.items.filtered('item.id == $0', itemId).length > 0;
  }

  /**
   * Add an item to requisition.
   *
   * @param  {RequisitionItem}  requisitionItem
   */
  addItem(requisitionItem) {
    this.items.push(requisitionItem);
  }

  /**
   * Add an item to requisition if it has not already been added.
   *
   * @param  {RequisitionItem}  requisitionItem
   */
  addItemIfUnique(requisitionItem) {
    if (this.items.filtered('id == $0', requisitionItem.id).length > 0) return;
    this.addItem(requisitionItem);
  }

  /**
   * Generate a customer invoice from this requisition.
   *
   * @param  {Realm}  database
   * @param  {User}   user
   */
  createCustomerInvoice(database, user) {
    if (this.isRequest || this.isFinalised) {
      throw new Error('Cannot create invoice from Finalised or Request Requisition ');
    }

    if (
      database.objects('Transaction').filtered('linkedRequisition.id == $0', this.id).length > 0
    ) {
      return;
    }

    const transaction = createRecord(database, 'CustomerInvoice', this.otherStoreName, user);
    this.items.forEach(requisitionItem =>
      createRecord(database, 'TransactionItem', transaction, requisitionItem.item)
    );
    transaction.linkedRequisition = this;
    this.linkedTransaction = transaction;
    transaction.comment = `From customer requisition ${this.serialNumber}`;
    database.save('Transaction', transaction);
  }

  /**
   * Add all items from the mobile store master list to this requisition.
   *
   * @param  {Realm}            database
   * @param  {Array.<string>}   selected masterlists from multiselect
   * @param  {Name}             thisStore
   */
  addItemsFromMasterList({ database, thisStore, selected }) {
    if (this.isFinalised) {
      throw new Error('Cannot add items to a finalised requisition');
    }

    // Filter through masterList ids that are on multiselect list
    const filteredMasterLists = selected
      ? thisStore.masterLists.filter(item => selected.indexOf(item.id) !== -1)
      : thisStore.masterLists;

    filteredMasterLists.forEach(masterList => {
      const itemsToAdd = complement(masterList.items, this.items, item => item.itemId);
      itemsToAdd.forEach(masterListItem => {
        if (!masterListItem.item.crossReferenceItem) {
          // Do not add cross reference items as causes unwanted duplicates.
          createRecord(database, 'RequisitionItem', this, masterListItem.item);
        }
      });
    });
  }

  /**
   * Add all items for the associated program.
   * @param {Realm} database
   */
  addItemsFromProgram(database) {
    if (this.isFinalized) {
      throw new Error('Cannot add items to a finalised requisition');
    }

    this.program.items.forEach(({ item }) => {
      // Cannot determine the usage of a response requisition until consumption is manually entered.
      const usage = this.isRequest ? programDailyUsage(item, this.period) : 0;

      // Defer calculating stock on hand for response requisitions to the `createRecord` call.
      const stockOnHand = this.isRequest ? item.geTotalQuantityOnDate(this.period.endDate) : 0;
      createRecord(database, 'RequisitionItem', this, item, usage, stockOnHand);
    });
  }

  /**
   * Add all items from the mobile store master list that require more stock.
   *
   * @param  {Realm}  database
   * @param  {Name}   thisStore
   */
  createAutomaticOrder(database, thisStore) {
    if (this.isFinalised) {
      throw new Error('Cannot add items to a finalised requisition');
    }

    this.addItemsFromMasterList({ database, thisStore });
    this.setRequestedToSuggested(database);
    this.pruneRedundantItems(database);
  }

  /**
   * Remove items from requisition by id.
   *
   * @param  {Realm}           database
   * @param  {Array.<string>}  itemIds
   */
  removeItemsById(database, itemIds) {
    const itemsToDelete = [];
    for (let i = 0; i < itemIds.length; i += 1) {
      const requisitionItem = this.items.find(item => item.id === itemIds[i]);
      if (requisitionItem.isValid()) {
        itemsToDelete.push(requisitionItem);
      }
    }
    database.delete('RequisitionItem', itemsToDelete);
  }

  /**
   * Sets all requisition items requested quantities related to this requisition
   * to their suggested quantity.
   */
  setRequestedToSuggested(database) {
    if (!this.isRequest) {
      throw new Error('Cannot set the requested quantity of a response requisition');
    }

    this.items.forEach(requisitionItem => {
      requisitionItem.requiredQuantity = requisitionItem.suggestedQuantity;
      database.save('RequisitionItem', requisitionItem);
    });
  }

  /**
   * Sets all requisition items related to this requisition to their suggested quantity.
   *
   * RequisitionItem Throws an error if this requisition is finalised or is a request.
   */
  setSuppliedToSuggested() {
    this.items.forEach(requisitionItem => {
      const { suggestedQuantity } = requisitionItem;
      requisitionItem.setSuppliedQuantity(UIDatabase, suggestedQuantity);
    });
  }

  /**
   * Sets all requisition items supplied quantity, related to this requisition
   * to their requested/required quantity.
   *
   * RequisitionItem Throws an error if this requisition is finalised or is a request.
   */
  setSuppliedToRequested() {
    this.items.forEach(requisitionItem => {
      const { requiredQuantity } = requisitionItem;
      requisitionItem.setSuppliedQuantity(UIDatabase, requiredQuantity);
    });
  }

  /**
   * Delete any items associated with this requisition with a quantity of zero.
   *
   * @param  {Realm}  database
   */
  pruneRedundantItems(database) {
    if (this.isRemoteOrder) {
      const itemsToPrune = this.items.filter(
        requisitionItem => requisitionItem.requiredQuantity === 0
      );
      database.delete('RequisitionItem', itemsToPrune);
    }
  }

  get canFinaliseRequest() {
    const finaliseStatus = { success: true, message: modalStrings.finalise_supplier_requisition };

    if (!this.numberOfOrderedItems) {
      finaliseStatus.success = false;
      finaliseStatus.message = modalStrings.add_at_least_one_item_before_finalising;
    }
    if (!this.totalRequiredQuantity) {
      finaliseStatus.success = false;
      finaliseStatus.message = modalStrings.record_stock_required_before_finalising;
    }

    const thisStoresTags = UIDatabase.getSetting(SETTINGS_KEYS.THIS_STORE_TAGS);
    const maxLinesForOrder = this.program?.getMaxLines?.(this.orderType, thisStoresTags);

    if (this.numberOfOrderedItems > maxLinesForOrder) {
      finaliseStatus.success = false;
      finaliseStatus.message = `${modalStrings.emergency_orders_can_only_have} ${maxLinesForOrder} ${modalStrings.items_remove_some}`;
    }

    return finaliseStatus;
  }

  get canFinaliseResponse() {
    const finaliseStatus = { success: true, message: modalStrings.finalise_customer_requisition };

    const closingStocksAreValid = this.items.every(
      ({ closingStockIsValid }) => closingStockIsValid
    );

    if (!closingStocksAreValid) {
      return { success: false, message: modalStrings.requisition_invalid_closing_stock };
    }

    // If all of the supplied quantity field has 0 quantity,
    // then the requisition is not ready to be finalised
    const suppliedQuantitiesAreValid = this.items.some(
      ({ hasSuppliedQuantity }) => hasSuppliedQuantity
    );

    if (!suppliedQuantitiesAreValid) {
      return { success: false, message: modalStrings.requisition_no_supplied_quantity };
    }

    const daysOutOfStockAreValid = this.items.every(
      ({ daysOutOfStockIsValid }) => daysOutOfStockIsValid
    );

    if (!daysOutOfStockAreValid) {
      return { success: false, message: modalStrings.requisition_days_out_of_stock };
    }

    const customersTags = this.otherStoreName.nameTags.join(',');
    const maxLinesForOrder = this.program?.getMaxLines?.(this.orderType, customersTags);

    if (this.numberOfSuppliedItems > maxLinesForOrder) {
      finaliseStatus.success = false;
      finaliseStatus.message = `${modalStrings.emergency_orders_can_only_have} ${maxLinesForOrder} ${modalStrings.items_remove_some}`;
    }

    return finaliseStatus;
  }

  get canFinalise() {
    return this.isRequest ? this.canFinaliseRequest : this.canFinaliseResponse;
  }

  /**
   * Finalise this requisition.
   *
   * @param  {Realm}  database
   */
  finalise(database) {
    const requisitionWithZeroQuantity = UIDatabase.getPreference(
      PREFERENCE_KEYS.KEEP_REQUISITION_WITH_ZERO_REQUESTED_QUANTITY
    );

    if (!this.isRequest && !requisitionWithZeroQuantity) {
      this.pruneRedundantItems(database);
    }

    this.status = 'finalised';
    database.save('Requisition', this);

    if (this.linkedTransaction) this.linkedTransaction.finalise(database);
  }

  get numberOfDaysInPeriod() {
    return this.period?.numberOfDays ?? 0;
  }

  get isManuallyCreatedProgramRequisition() {
    return this.program && this.type === 'response';
  }
}

Requisition.schema = {
  name: 'Requisition',
  primaryKey: 'id',
  properties: {
    id: 'string',
    status: { type: 'string', default: 'new' },
    orderType: { type: 'string', optional: true },
    thresholdMOS: { type: 'double', optional: true },
    type: { type: 'string', default: 'request' },
    entryDate: { type: 'date', default: new Date() },
    daysToSupply: { type: 'double', default: NUMBER_OF_DAYS_IN_A_MONTH },
    serialNumber: { type: 'string', default: '0' },
    requesterReference: { type: 'string', default: '' },
    comment: { type: 'string', optional: true },
    enteredBy: { type: 'User', optional: true },
    items: { type: 'list', objectType: 'RequisitionItem' },
    linkedTransaction: { type: 'Transaction', optional: true },
    program: { type: 'MasterList', optional: true },
    period: { type: 'Period', optional: true },
    otherStoreName: { type: 'Name', optional: true },
    customData: { type: 'string', optional: true },
    createdDate: { type: 'date', default: new Date() },
    isRemoteOrder: { type: 'bool', default: true },
  },
};

export default Requisition;
