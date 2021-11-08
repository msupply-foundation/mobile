import { Buffer } from 'buffer';
import { TypedDevice } from '../Bluetooth/types';
import { BT510, BLUE_MAESTRO } from '../constants';
type NumberRange = [number, number];

export class BTUtilService {
  /**
   * Convert to Fahrenheit
   */
  toFahrenheit = (celsius: number): number => Math.round((celsius * 9.0) / 5.0) + 320.0;

  bufferFromBase64 = (base64: string): Buffer => Buffer.from(base64, 'base64');

  stringFromBase64 = (base64: string): string => this.bufferFromBase64(base64).toString('utf-8');

  base64FromString = (string: string): string => Buffer.from(string, 'utf-8').toString('base64');
  /**
   * Normalises a number within some number range i.e. [75-100] into the corresponding
   * number within 0-100.
   */
  normaliseNumber = (currentVal: number, oldRange: NumberRange, newRange = [0, 100]): number => {
    const [oldMin, oldMax] = oldRange;
    const [newMin, newMax] = newRange;

    const newVal = ((currentVal - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;

    return Math.floor(newVal);
  };
  deviceDescriptorToDevice = (macAddress: string): TypedDevice => {
    const parts = macAddress.split('|');
    return {
      id: parts[0].trim(),
      // If the descriptor doesn't have a device field, it's a Blue Maestro that
      // was previously paired.
      deviceType: (parts[1]?.trim() === 'BT510' ? BT510 : BLUE_MAESTRO) ?? BLUE_MAESTRO,
    };
  };
  deviceToDeviceDescriptor = (
    deviceId: string,
    mfgId: BLUE_MAESTRO.MANUFACTURER_ID | BT510.MANUFACTURER_ID
  ): string => {
    const deviceType = mfgId === BLUE_MAESTRO.MANUFACTURER_ID ? 'BLUE_MAESTRO' : 'BT510';
    return `${deviceId} | ${deviceType}`;
  };
}
