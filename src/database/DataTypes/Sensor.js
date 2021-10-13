/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import Realm from 'realm';
import { generalStrings } from '../../localization';

export class Sensor extends Realm.Object {
  get hasBreached() {
    return this.location?.hasBreached ?? false;
  }

  get mostRecentTemperatureBreach() {
    return this.location?.mostRecentTemperatureBreach;
  }

  get batteryLevelString() {
    return `${this.batteryLevel ?? generalStrings.not_available}%`;
  }

  get currentLocationName() {
    return this.location?.description ?? '';
  }

  get mostRecentLog() {
    return this.logs.sorted('timestamp', true)[0];
  }

  get lastSyncDate() {
    const { timestamp = new Date(0) } = this.mostRecentLog ?? {};

    return timestamp;
  }

  get maxTemperature() {
    return this.logs.max('temperature');
  }

  get minTemperature() {
    return this.logs.min('temperature');
  }

  get numberOfBreaches() {
    return this.breaches.length;
  }

  get breachConfigIDs() {
    return this.breachConfigs?.map(({ id }) => id);
  }

  get breachConfigs() {
    return this.location?.breachConfigs;
  }

  get firstLog() {
    return this.logs.sorted('timestamp', false)[0];
  }

  get mostRecentBreach() {
    return this.breaches.sorted('startTimestamp', true)[0];
  }

  get mostRecentBreachTime() {
    return this.mostRecentBreach?.startTimestamp;
  }

  get currentTemperature() {
    return this.mostRecentLog?.temperature ?? null;
  }

  get isInHotBreach() {
    const breach = this.mostRecentBreach;
    const isOngoing = !breach?.endTimestamp;
    const isHot = breach?.type === 'HOT_CONSECUTIVE';
    const isUnacknowledged = breach?.acknowledged === false;

    return isOngoing && isHot && isUnacknowledged;
  }

  get isInColdBreach() {
    const breach = this.mostRecentBreach;
    const isOngoing = !breach?.endTimestamp;
    const isCold = breach?.type === 'COLD_CONSECUTIVE';
    const isUnacknowledged = breach?.acknowledged === false;

    return isOngoing && isCold && isUnacknowledged;
  }

  get locationID() {
    return this.location?.id;
  }

  toJSON() {
    return {
      id: this.id,
      macAddress: this.macAddress,
      name: this.name,
      batteryLevel: this.batteryLevel,
      isActive: this.isActive,
      isPaused: this.isPaused,
      logInterval: this.logInterval,
      logDelay: this.logDelay?.getTime(),
      programmedDate: this.programmedDate?.getTime(),
      currentTemperature: this.currentTemperature,
      mostRecentBreachTime: this.mostRecentBreachTime?.getTime(),
      isInHotBreach: this.isInHotBreach,
      isInColdBreach: this.isInColdBreach,

      breachConfigIDs: this.breachConfigIDs,
      locationID: this.locationID,
    };
  }
}

Sensor.schema = {
  name: 'Sensor',
  primaryKey: 'id',
  properties: {
    id: 'string',
    macAddress: { type: 'string', optional: true },
    name: { type: 'string', default: '' },
    location: { type: 'Location', optional: true },
    batteryLevel: { type: 'double', optional: true },
    logs: { type: 'linkingObjects', objectType: 'TemperatureLog', property: 'sensor' },
    breaches: { type: 'linkingObjects', objectType: 'TemperatureBreach', property: 'sensor' },
    isActive: { type: 'bool', default: true },
    isPaused: { type: 'bool', default: false },
    logInterval: { type: 'int', default: 300 },
    logDelay: { type: 'date', default: new Date(0) },
    programmedDate: { type: 'date', default: new Date() },
  },
};

export default Sensor;
