/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

/**
 * An abstract object which contains metadata describing an indicator row or column.
 *
 * @property  {string}              id
 * @property  {string}              storeId
 * @property  {Period}              period
 * @property  {IndicatorAttribute}  column
 * @property  {IndicatorAttribute}  row
 * @property  {string}              value
 */
export class IndicatorValue extends Realm.Object {
  get indicator() {
    return this.row.indicator ?? this.column.indicator;
  }
}

export default IndicatorValue;

IndicatorValue.schema = {
  name: 'IndicatorValue',
  primaryKey: 'id',
  properties: {
    id: 'string',
    storeId: 'string',
    period: 'Period',
    column: 'IndicatorAttribute',
    row: 'IndicatorAttribute',
    value: 'string',
  },
};
