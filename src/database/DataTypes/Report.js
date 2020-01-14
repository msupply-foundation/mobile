/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import checkIsObject from '../utilities';
/**
 * A Report.
 *
 * @property  {string}            id
 * @property  {string}            type
 * @property  {string}            title
 * @property  {string}            _data
 */

export class Report extends Realm.Object {
  /**
   * Get data.
   *
   * @return  {Object}
   */
  get data() {
    // eslint-disable-next-line no-underscore-dangle
    return JSON.parse(this._data);
  }

  /**
   * Set data.
   *
   * @param  {dataObject}  dataObject
   */
  set data(dataObject) {
    // eslint-disable-next-line no-underscore-dangle
    this._data = checkIsObject(dataObject) ? JSON.stringify(dataObject) : JSON.stringify({});
  }
}

Report.schema = {
  name: 'Report',
  primaryKey: 'id',
  properties: {
    id: 'string',
    type: 'string',
    title: 'string',
    _data: 'string',
  },
};

export default Report;
