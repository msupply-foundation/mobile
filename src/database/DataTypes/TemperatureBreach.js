/**
 * Sustainable Solutions (NZ) Ltd. 2020
 * mSupply Mobile
 */

import Realm from 'realm';
import moment from 'moment';

export class TemperatureBreach extends Realm.Object {
  get maximumTemperature() {
    return this.temperatureLogs.max('temperature');
  }

  get minimumTemperature() {
    return this.temperatureLogs.min('temperature');
  }

  get temperatureExposure() {
    const { maximumTemperature, minimumTemperature } = this;

    return { maximumTemperature, minimumTemperature };
  }

  get locationString() {
    return this.location?.description;
  }

  get temperature() {
    return (this.temperatureLogs.sum('temperature') ?? 0) / this.temperatureLogs.length || 1;
  }

  get timestamp() {
    return this.startTimestamp;
  }

  get duration() {
    return moment.duration(
      moment(this.endTimestamp ?? new Date()).diff(moment(this.startTimestamp))
    );
  }

  affectedBatches(database) {
    return this.location?.batchesDuringTime(database, this.startTimestamp, this.endTimestamp) ?? [];
  }

  numberOfAffectedBatches(database) {
    return this.affectedBatches(database)?.length ?? 0;
  }

  affectedQuantity(database) {
    const affectedBatches = this.affectedBatches(database);

    if (!affectedBatches?.length) return 0;

    const itemBatchQuery = affectedBatches.map(({ id }) => `itemBatch.id == "${id}"`).join(' OR ');
    const transactionBatches = database.objects('TransactionBatch').filtered(itemBatchQuery);

    const incomingStock = transactionBatches.filtered(
      'transaction.confirmDate < $0 && (transaction.type == $1 || transaction.type == $2)',
      this.endTimestamp ?? new Date(),
      'supplier_invoice',
      'customer_credit'
    );

    const outgoingStock = transactionBatches.filtered(
      'transaction.confirmDate < $0 && (transaction.type == $1 || transaction.type == $2)',
      this.endTimestamp ?? new Date(),
      'customer_invoice',
      'supplier_credit'
    );

    return incomingStock.sum('numberOfPacks') ?? 0 - outgoingStock.sum('numberOfPacks') ?? 0;
  }

  toJSON() {
    return {
      id: this.id,
      startTimestamp: this.startTimestamp.getTime(),
      endTimestamp: this.endTimestamp?.getTime(),
      locationID: this.location.id,
      thresholdMaxTemperature: this.thresholdMaxTemperature,
      thresholdMinTemperature: this.thresholdMinTemperature,
      thresholdDuration: this.thresholdDuration,
      acknowledged: this.acknowledged,
      type: this.type,
      sensorID: this.sensor.id,
    };
  }
}

TemperatureBreach.schema = {
  name: 'TemperatureBreach',
  primaryKey: 'id',
  properties: {
    id: 'string',
    temperatureLogs: { type: 'linkingObjects', objectType: 'TemperatureLog', property: 'breach' },
    startTimestamp: { type: 'date', optional: true },
    endTimestamp: { type: 'date', optional: true },
    location: { type: 'Location' },
    thresholdMaxTemperature: { type: 'double', optional: true },
    thresholdMinTemperature: { type: 'double', optional: true },
    thresholdDuration: { type: 'double', optional: true },
    acknowledged: { type: 'bool', default: false },
    type: { type: 'string', default: 'placeholderType' },
    sensor: { type: 'Sensor' },
  },
};

export default TemperatureBreach;
