/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import moment from 'moment';

import { UIDatabase } from '../database';
import { NUMBER_OF_DAYS_IN_A_MONTH, PREFERENCE_KEYS } from '../database/utilities/constants';

const DEFAULT_LOOKBACK_PERIOD = 3;

/**
 * Returns either a customized lookback period, or 90 days in milliseconds.
 */
const getAMCLookbackPeriod = () => {
  const amcLookback = UIDatabase.getPreference(PREFERENCE_KEYS.CONSUMPTION_LOOKBACK_PERIOD);
  return amcLookback > 0 ? amcLookback : DEFAULT_LOOKBACK_PERIOD;
};

/**
 * Returns if this store is customized such that usage should force a lookback period,
 * rather than using an items added date.
 */
const getAMCEnforcementLookback = () =>
  UIDatabase.getPreference(PREFERENCE_KEYS.CONSUMPTION_ENFORCE_LOOKBACK);

/**
 * Calculates usage for a provided item.
 * Default behaviour is to calculate all usage (total quantity of all customer invoice
 * transaction batches) over the last 90 days, and divide by tbe minimum of 90 days or
 * the number of days the item has been in stock.
 * Customized behaviour is to enforce only using the lookback period, rather than when
 * the item was added. Each store can also have it's lookback period customized.
 * @param {Item} item
 */
export const dailyUsage = item => {
  const { batches, addedDate, id: itemId } = item;

  if (!batches.length) return 0;

  const amcLookback = getAMCLookbackPeriod();
  const amcEnforceLookback = getAMCEnforcementLookback();

  const itemAddedDate = moment(addedDate);
  const dateNow = moment();
  const lookbackDate = moment(dateNow).subtract(amcLookback * NUMBER_OF_DAYS_IN_A_MONTH, 'days');
  const useLookbackDate = amcEnforceLookback || itemAddedDate.isBefore(lookbackDate);
  const startDate = useLookbackDate ? lookbackDate : itemAddedDate;

  const numberOfUsageDays = Math.max(moment.duration(dateNow.diff(startDate)).asDays(), 1);

  const usage = UIDatabase.objects('TransactionBatch')
    .filtered('itemBatch.item.id == $0', itemId)
    .filtered('transaction.type == $0', 'customer_invoice')
    .filtered(
      'transaction.confirmDate >= $0 && transaction.confirmDate <= $1',
      startDate.toDate(),
      dateNow.toDate()
    )
    .reduce((sum, { totalQuantity }) => sum + totalQuantity, 0);

  return usage / numberOfUsageDays;
};

/**
 * Calculates usage for a provided item.
 * This algorithm differs such that the usage period is from the provided Realm<Period>
 * object endDate, adding 1 and subtracting X, where X defaults to 3, or can be provided
 * and customized to be any number of months.
 *
 * @param {Item}   item
 * @param {Period} period
 */
export const programDailyUsage = (item, period) => {
  if (!item || !item.batches) return 0;
  if (!period || !period.endDate) return 0;

  const { batches, id: itemId } = item;
  const { endDate: periodEndDate } = period;

  if (!batches.length) return 0;

  const amcLookback = getAMCLookbackPeriod();

  const periodEnd = moment(periodEndDate);
  const usageStartDate = moment(periodEndDate).add(1, 'days').subtract(amcLookback, 'months');

  const numberOfUsageDays = NUMBER_OF_DAYS_IN_A_MONTH * amcLookback;

  const usage = UIDatabase.objects('TransactionBatch')
    .filtered('transaction.type == $0', 'customer_invoice')
    .filtered('itemBatch.item.id == $0', itemId)
    .filtered(
      'transaction.confirmDate >= $0 && transaction.confirmDate <= $1',
      usageStartDate.toDate(),
      periodEnd.toDate()
    )
    .reduce((sum, { totalQuantity }) => sum + totalQuantity, 0);

  return usage / (numberOfUsageDays || 1);
};

/**
 * Calculates the daily usage for a requisition item, which accounts for a user-enterable
 * consumption as well as accounting for a user-enterable days out of stock.
 *
 * @param {RequisitionItem} requisitionItem
 */
export const customerRequisitionProgramDailyUsage = requisitionItem => {
  const { outgoingStock, daysOutOfStock, numberOfDaysInPeriod } = requisitionItem;
  const numberOfDays = Math.max((numberOfDaysInPeriod ?? 0) - (daysOutOfStock ?? 0), 1);
  return Math.max(outgoingStock / numberOfDays, 0);
};
