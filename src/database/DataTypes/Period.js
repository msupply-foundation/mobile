/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';
import moment from 'moment';
import { getIndicatorValuesByPeriod, getIndicatorsByValues } from '../utilities/getIndicatorData';

/**
 * A period is a simple start and end date. Grouped by periodSchedules
 * which are related to a MasterList and store. Used for applying
 * settings from for a certain orderType.
 *
 * EG: A program - "HIV", a store "CHR" and the order type "Normal"
 * may have a maxOrdersPerPeriod of 1.
 * @property  {string} id
 * @property  {string} name           A generic name field
 * @property  {string} startDate      The starting date for the period
 * @property  {string} endDate        The end date for this period
 * @property  {string} periodSchedule The related schedule
 * @property  {string} requisitions   related requisitions
 */
export class Period extends Realm.Object {
  get indicators() {
    const indicatorValues = getIndicatorValuesByPeriod(this);
    return getIndicatorsByValues(indicatorValues);
  }

  numberOfRequisitions() {
    return this.requisitions.length;
  }

  numberOfSupplierRequisitionsForOrderType(program, orderType) {
    return this.requisitions.filtered(
      'program.id = $0 && orderType = $1 && type == "request"',
      program.id,
      orderType.name
    ).length;
  }

  numberOfCustomerRequisitionsForOrderType(program, orderType, name) {
    return this.requisitions.filtered(
      'program.id = $0 && orderType = $1 && otherStoreName = $2',
      program.id,
      orderType.name,
      name
    ).length;
  }

  addRequisitionIfUnique(requisition) {
    if (this.requisitions.filtered('id == $0', requisition.id).length > 0) return;
    this.requisitions.push(requisition);
  }

  toInfoString() {
    return `${this.name} (${this})`;
  }

  toString() {
    const startDate = moment(this.startDate).format('DD/MM/YY');
    const endDate = moment(this.endDate).format('DD/MM/YY');
    return `${startDate} - ${endDate}`;
  }

  get numberOfDays() {
    return (
      moment(this.endDate).startOf('day').diff(moment(this.startDate).startOf('day'), 'days') + 1
    );
  }
}

export default Period;

Period.schema = {
  name: 'Period',
  primaryKey: 'id',
  properties: {
    id: 'string',
    startDate: { type: 'date', default: new Date() },
    endDate: { type: 'date', default: new Date() },
    name: { type: 'string', default: 'Placeholder Name' },
    periodSchedule: { type: 'PeriodSchedule', optional: true },
    requisitions: { type: 'list', objectType: 'Requisition' },
  },
};
