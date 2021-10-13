/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */
import moment from 'moment';
import { createSelector } from 'reselect';
import { UIDatabase } from '../database';
import { MILLISECONDS_PER_DAY } from '../database/utilities/index';
import { MILLISECONDS } from '../utilities';
import { formatTime } from '../utilities/formatters';

import { CHART_CONSTANTS, VACCINE_CONSTANTS } from '../utilities/modules/vaccines/constants';

export const selectFridgeDetailState = ({ fridgeDetail }) => fridgeDetail;

export const selectSelectedFridgeID = ({ fridgeDetail }) => {
  const { locationID } = fridgeDetail ?? {};
  return locationID;
};

export const selectSelectedFridge = createSelector([selectSelectedFridgeID], selectedFridgeID => {
  const selectedFridge = UIDatabase.get('Location', selectedFridgeID);
  return selectedFridge;
});

export const selectSelectedFridgeSensorID = state => {
  const location = selectSelectedFridge(state);
  return location?.sensor?.id ?? '';
};

export const selectSelectedFridgeSensor = createSelector([selectSelectedFridgeSensorID], sensorID =>
  UIDatabase.get('Sensor', sensorID)
);

export const selectMinimumFromDate = state => {
  const { leastRecentTemperatureLog = {} } = selectSelectedFridge(state);
  const { now } = selectFridgeDetailState(state);
  const { timestamp } = leastRecentTemperatureLog;
  return timestamp?.getTime() ?? now;
};

export const selectMaximumToDate = state => {
  const { mostRecentTemperatureLog = {} } = selectSelectedFridge(state);
  const { timestamp } = mostRecentTemperatureLog;

  const { now } = selectFridgeDetailState(state);
  const asMilliseconds = timestamp?.getTime() ?? now;

  return now >= asMilliseconds ? now : asMilliseconds;
};

export const selectFromDate = state => {
  const { fromDate } = selectFridgeDetailState(state);
  const minimumFromDate = selectMinimumFromDate(state);
  return moment.max([moment(fromDate), moment(minimumFromDate)]).valueOf();
};

export const selectToDate = state => {
  const { toDate } = selectFridgeDetailState(state);
  const maximumToDate = moment(selectMaximumToDate(state));

  // If the `toDate` and the `maximumDate` are the same day,
  // return the maximum date as this will cause the `toDate` to
  // change when there are new temperature logs.
  const sameDay = moment(toDate).isSame(moment(maximumToDate), 'day');
  if (sameDay) return maximumToDate.valueOf();

  // Otherwise, just return the toDate
  return toDate;
};

export const selectBreaches = createSelector(
  [selectFromDate, selectToDate, selectSelectedFridgeID],
  (fromDate, toDate, fridgeID) => {
    const breaches = UIDatabase.objects('TemperatureBreach').filtered(
      '((startTimestamp <= $0 && (endTimestamp >= $0 || endTimestamp == null)) || ' +
        '(startTimestamp >= $0 && startTimestamp <= $1)) && location.id == $2 &&' +
        'acknowledged == false',
      new Date(fromDate),
      new Date(toDate),
      fridgeID
    );

    return breaches;
  }
);

export const selectMinAndMaxLogs = createSelector(
  [selectFromDate, selectToDate, selectSelectedFridge, selectBreaches],
  (fromDate, toDate, fridge, breaches) => {
    const diff = new Date(toDate).getTime() - new Date(fromDate).getTime();
    const logs = fridge.temperatureLogs.filtered(
      'timestamp >= $0 && timestamp <= $1',
      new Date(fromDate),
      new Date(toDate)
    );

    // If time period is less than a day, reduce datapoint count slightly
    const days = diff / MILLISECONDS_PER_DAY;
    const maxDataPoints =
      days <= 1 ? CHART_CONSTANTS.MAX_DATA_POINTS_PER_DAY : CHART_CONSTANTS.MAX_DATA_POINTS;

    const numOfDataPoints = Math.min(maxDataPoints, logs.length);
    const periodDuration = diff / numOfDataPoints;

    // Adjust breaches such that the timestamp is within the date range being displayed.
    const adjustedBreaches = breaches.map(({ startTimestamp, id, temperature }) => {
      const timestamp = moment(startTimestamp).isBefore(moment(fromDate))
        ? new Date(fromDate)
        : startTimestamp;

      return { id, temperature, timestamp };
    });

    const defaultReturn = {
      minLine: [],
      maxLine: [],
      minDomain: Infinity,
      maxDomain: -Infinity,
      breaches: adjustedBreaches,
    };

    if (!logs.length) return defaultReturn;

    const minAndMax = Array.from({
      length: numOfDataPoints,
    }).reduce((acc, _, i) => {
      const periodStart = new Date(new Date(fromDate).getTime() + periodDuration * i);
      const periodEnd = new Date(new Date(fromDate).getTime() + periodDuration * (i + 1));
      const logsInPeriod = logs.filtered(
        'timestamp >= $0 && timestamp <= $1',
        periodStart,
        periodEnd
      );

      const maxTemperature = logsInPeriod.max('temperature') ?? null;
      const minTemperature = logsInPeriod.min('temperature') ?? null;

      const { minLine, maxLine, minDomain, maxDomain } = acc;

      return {
        ...acc,
        minLine: [...minLine, { temperature: minTemperature, timestamp: periodStart }],
        maxLine: [...maxLine, { temperature: maxTemperature, timestamp: periodStart }],
        minDomain: Math.min(minDomain, minTemperature),
        maxDomain: Math.max(maxDomain, maxTemperature),
      };
    }, defaultReturn);

    return { ...minAndMax };
  }
);

export const selectColdConsecutiveBreaches = createSelector([selectBreaches], breaches => {
  const coldBreaches =
    breaches?.filtered("type == 'COLD_CONSECUTIVE' && acknowledged == false") ?? [];

  return coldBreaches;
});

export const selectHotConsecutiveBreaches = createSelector([selectBreaches], breaches => {
  const hotBreaches =
    breaches?.filtered("type == 'HOT_CONSECUTIVE' && acknowledged == false") ?? [];

  return hotBreaches;
});

const selectFridgeTemperatureLogsInPeriod = createSelector(
  [selectFromDate, selectToDate, selectSelectedFridge],
  (fromDate, toDate, selectedFridge) => {
    const { temperatureLogs } = selectedFridge;
    const withinDateRange = temperatureLogs.filtered(
      'timestamp >= $0 && timestamp <= $1',
      new Date(fromDate),
      new Date(toDate)
    );
    return withinDateRange;
  }
);

export const selectHotCumulativeBreach = createSelector(
  [selectSelectedFridge, selectFridgeTemperatureLogsInPeriod],
  (fridge, logs) => {
    const { hotCumulativeBreachConfig } = fridge;

    const { minimumTemperature, duration } = hotCumulativeBreachConfig;

    const logsOverThreshold = logs.filtered('temperature >= $0', minimumTemperature);
    const sum = logsOverThreshold.sum('logInterval') * MILLISECONDS.ONE_SECOND ?? 0;
    const hasCumulativeBreach = sum >= duration && duration;

    return hasCumulativeBreach ? formatTime(sum) : null;
  }
);

export const selectColdCumulativeBreach = createSelector(
  [selectSelectedFridge, selectFridgeTemperatureLogsInPeriod],
  (fridge, logs) => {
    const { coldCumulativeBreachConfig } = fridge;
    const { maximumTemperature, duration } = coldCumulativeBreachConfig;

    const logsOverThreshold = logs.filtered('temperature <= $0', maximumTemperature);
    const sum = logsOverThreshold.sum('logInterval') * MILLISECONDS.ONE_SECOND ?? 0;
    const hasCumulativeBreach = sum >= duration && duration;

    return hasCumulativeBreach ? formatTime(sum) : null;
  }
);

export const selectBreachBoundaries = createSelector([selectSelectedFridge], fridge => {
  const { coldConsecutiveBreachConfig = {}, hotConsecutiveBreachConfig = {} } = fridge;

  const { maximumTemperature = 2 } = coldConsecutiveBreachConfig;
  const { minimumTemperature = 8 } = hotConsecutiveBreachConfig;

  return {
    lower: maximumTemperature,
    upper: minimumTemperature,
  };
});

export const selectAverageTemperature = createSelector(
  [selectFridgeTemperatureLogsInPeriod],
  logs => {
    // Aggregate methods return undefined if the collection is empty.
    // Return early to avoid having to handle falsey values (the
    // average can be 0 which is a valid value but undefined is not)
    if (!logs.length) return null;

    const averageTemperature = logs.avg('temperature');
    return Number(averageTemperature).toFixed(1);
  }
);

export const selectSelectedFridgeIsInHotBreach = state => {
  const fridge = selectSelectedFridge(state);
  const { isInHotBreach } = fridge;
  return isInHotBreach;
};

export const selectSelectedFridgeIsInColdBreach = state => {
  const fridge = selectSelectedFridge(state);
  const { isInColdBreach } = fridge;
  return isInColdBreach;
};

export const selectSelectedFridgeSensorIsLowBattery = state => {
  const fridge = selectSelectedFridge(state);
  const { batteryLevel } = fridge;
  return batteryLevel && batteryLevel <= VACCINE_CONSTANTS.LOW_BATTERY_PERCENTAGE;
};

export const selectSelectFridgeCurrentTemperature = state => {
  const fridge = selectSelectedFridge(state);
  const { currentTemperature } = fridge;
  return currentTemperature;
};
