/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import moment from 'moment';
import { truncateString } from 'sussol-utilities';
import temperature from './temperature';
import { generalStrings, modalStrings, vaccineStrings } from '../localization';

export const formatErrorItemNames = items => {
  const MAX_ITEMS_IN_ERROR_MESSAGE = 4; // Number of items to display in finalise error modal.
  const MAX_ITEM_STRING_LENGTH = 40; // Length of string representing item in error modal.
  let itemsString = '';
  items.forEach((item, index) => {
    if (!item) return; // Rerendering sometimes causes a crash here.
    if (index >= MAX_ITEMS_IN_ERROR_MESSAGE) return;
    itemsString += truncateString(`\n${item.itemCode} - ${item.itemName}`, MAX_ITEM_STRING_LENGTH);
  });
  if (items.length > MAX_ITEMS_IN_ERROR_MESSAGE) {
    itemsString +=
      `\n${modalStrings.and} ` +
      `${items.length - MAX_ITEMS_IN_ERROR_MESSAGE} ` +
      `${modalStrings.more}.`;
  }
  return itemsString;
};
/**
 * Rounds a number to the provided number of digits. I.e.
 * roundNumber(17.123, 2) = 17.12
 *
 * @param {Number} number           The number to round.
 * @param {Number} fractionalDigits The number of digits to round to.
 */
export const roundNumber = (number, fractionalDigits) =>
  Number(parseFloat(number).toFixed(fractionalDigits));

export const formatTemperatureExposure = ({
  minimumTemperature = Infinity,
  maximumTemperature = -Infinity,
} = {}) => {
  const infinityTemperatures = minimumTemperature === Infinity || maximumTemperature === -Infinity;
  if (infinityTemperatures) return vaccineStrings.no_temperatures;

  return `${temperature(minimumTemperature).format()} - ${temperature(
    maximumTemperature
  ).format()}`;
};

export const formatTimeDifference = duration => {
  const suffixes = [generalStrings.days, generalStrings.hours, generalStrings.minutes];
  const durations = [duration.days(), duration.hours(), duration.minutes()];

  // merges the above arrays to give a string for example: 3 days, 4 hours, 3 minutes
  return durations.reduce(
    (acc, value, index) =>
      value
        ? `${acc} ${value} ${suffixes[index]}${durations.length - 1 === index ? '' : ','}`
        : acc,
    ''
  );
};

export const timestampTickFormatter = tick => moment(tick).format('h:mma[\n](D/M)');

export const temperatureTickFormatter = tick => `${tick} \u2103`;

export const formatDate = date => (date ? moment(date).fromNow() : generalStrings.not_available);

export const formatTime = sum => {
  const asMoment = moment.duration(sum);

  const asDays = Math.floor(asMoment.asDays());
  const asHours = Math.floor(asMoment.asHours());
  const asMinutes = Math.floor(asMoment.asMinutes());

  const lengthOfHours = String(asHours).length;
  const lengthOfMinutes = String(asMinutes).length;

  const addSuffix = (amount, suffix) => `${amount} ${suffix}`;

  if (lengthOfMinutes < 3) return addSuffix(asMinutes, 'm');
  if (lengthOfHours < 3) return addSuffix(asHours, 'h');

  return addSuffix(asDays, 'd');
};

export const formatLogDelay = delay =>
  `${vaccineStrings.logging_delayed_until}: ${moment(delay).format('HH:mm:ss')}`;

export const formatBatteryLevel = batteryLevel =>
  batteryLevel == null ? generalStrings.not_available : `${batteryLevel}%`;

export const twoDecimalsMax = num => Math.round(num * 100) / 100;
