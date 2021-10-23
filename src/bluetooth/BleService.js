import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { BLUETOOTH } from './constants';

const bufferFromBase64 = base64 => Buffer.from(base64, 'base64');
const stringFromBase64 = base64 => bufferFromBase64(base64).toString('utf-8');
const base64FromString = string => Buffer.from(string, 'utf-8').toString('base64');

/**
 * Interface for interacting with a native Ble Manager for interacting
 * with BlueMaestro temperature sensors, specifically.
 *
 * To find sensors:   scanForSensors with a callback will scan until stopped
 *                    with stopScan.
 *
 * Sending commands:  There are simplified methods to send commands. Other methods are used
 *                    internally. There are also duplicates for retrying X times when a failure
 *                    occurs.
 *                    - toggleButton      : Toggles the physical button of the sensor on/off
 *                    - getInfo           : Returns details about the sensor i.e batteryLevel
 *                    - downloadLogs      : Returns an array of downloaded temperature logs.
 *                    - blink             : Forces the LED light on the sensor to blink.
 *                    - updateLogInterval : Updates the logging interval of the sensor
 *
 *
 */
class BleService {
  constructor(
    manager = new BleManager(),
    logger = {
      info: () => {},
    }
  ) {
    this.manager = manager;
    this.logger = logger;

    this.logger.info('BleService constructor', { manager });
  }

  setManager = manager => {
    this.manager = manager;
  };

  /**
   * Connects to a device with the provided macAddress.
   *
   * This ensures the underlying manager has a reference for the
   * device and is required before performing bluetooth operations
   * on the device.
   * @param {String} macAddress
   */
  connectToDevice = async macAddress => {
    this.logger.info('connectToDevice', { macAddress });
    return this.manager.connectToDevice(macAddress);
  };

  /**
   * Connects to a device with the provided macAddress as well as discovering
   * available bluetooth services of the sensor.
   *
   * Discovering services is required to ensure the the service that is used
   * is supported by the device.
   * @param {String} macAddress
   */
  connectAndDiscoverServices = async macAddress => {
    this.logger.info('connectAndDiscoverServices', { macAddress });
    // without the cancel & reconnect further commands
    // were sometimes returning an error: "BleError: Device [mac address] was disconnected"
    // Note: adding the option `{ autoConnect: true }` prevents the sensors from
    // connecting sometimes :shrug:
    const deviceIsConnected = await this.manager.isDeviceConnected(macAddress);
    this.logger.info('deviceIsConnected', { deviceIsConnected });
    if (deviceIsConnected) {
      await this.manager.cancelDeviceConnection(macAddress);
    }

    const device = await this.connectToDevice(macAddress);

    await this.manager.discoverAllServicesAndCharacteristicsForDevice(macAddress);

    this.logger.info('Discovered all services and characteristics for device', { macAddress });
    return device;
  };

  /**
   * Stops the bluetooth scanner from finding devices.
   */
  stopScan = () => {
    this.manager.stopDeviceScan();
  };

  /**
   * Spins up the bluetooth scanner to start searching for devices.
   *
   * The scanner finds all bluetooth devices within close range proximity.
   * All devices will be returned from the scanner but filtered before
   * triggering the callback passed with the device object.
   *
   * See: https://github.com/Polidea/react-native-ble-plx/blob/master/src/Device.js
   * @param {Func} callback
   */
  scanForSensors = callback => {
    this.manager.startDeviceScan(
      null,
      { scanMode: BLUETOOTH.SCAN_MODE.LOW_LATENCY },
      (_, device) => {
        if (device) {
          const { manufacturerData } = device;

          if (
            manufacturerData &&
            bufferFromBase64(manufacturerData).readInt16LE(0) === BLUETOOTH.MANUFACTURER_ID
          ) {
            callback(device);
          }
        }
      },
      callback
    );
  };

  /**
   * Sends a command to a physical sensor.
   *
   * Writes to the UART characteristic of a physical
   * device, not expecting a response. The device
   * *must* have services discovered, which also requires
   * a connection.
   * @param {String} macAddress
   * @param {String} command
   */
  writeCharacteristic = (macAddress, command) =>
    this.manager.writeCharacteristicWithoutResponseForDevice(
      macAddress,
      BLUETOOTH.SERVICE.UART,
      BLUETOOTH.CHARACTERISTIC.UART_WRITE,
      base64FromString(command)
    );

  /**
   * Monitors the UART Read characteristic.
   *
   * Reads any data which the sensor writes to the
   * UART read characteristic. This is how you receive results
   * from a command sent.
   *
   * @param {String} macAddress
   * @param {Func} callback
   */
  monitorCharacteristic = (macAddress, callback) =>
    new Promise((resolve, reject) => {
      this.manager.monitorCharacteristicForDevice(
        macAddress,
        BLUETOOTH.SERVICE.UART,
        BLUETOOTH.CHARACTERISTIC.UART_READ,
        (_, result) => {
          callback(result, resolve, reject);
        }
      );
    });

  /**
   * Wrapper for writing and monitoring for complex
   * return values. For example a large number of
   * temperature logs which needs to stream the result
   * from the RX Characteristic.
   *
   * @param {String} macAddress
   * @param {String} command
   * @param {Func} parser (data: [string]) => any
   */
  writeAndMonitor = async (macAddress, command, parser) => {
    const monitor = this.monitorCharacteristic(
      macAddress,
      (() => {
        const data = [];

        return (result, resolve, reject) => {
          if (result?.value) data.push(result.value);
          else {
            try {
              resolve(parser(data));
            } catch (e) {
              reject(new Error(`Parsing failed:  ${e.message}`));
            }
          }
        };
      })()
    );

    await this.writeCharacteristic(macAddress, command);

    return monitor;
  };

  /**
   * Wrapper over reading and monitoring for simple commands
   * which result in only a single read from the RX characteristic.
   *
   * @param {String} macAddress
   * @param {String} command
   * @param {Func} parser (data: string) => any
   */
  writeWithSingleResponse = async (macAddress, command, parser) => {
    const monitor = this.monitorCharacteristic(macAddress, (result, resolve, reject) => {
      if (result?.value) {
        try {
          resolve(parser(result.value));
        } catch (e) {
          reject(new Error(`Parsing failed:  ${e.message}`));
        }
      } else reject(new Error('Command Failed'));
    });

    await this.writeCharacteristic(macAddress, command);

    return monitor;
  };

  /** Facade for clearing logs.
   *
   * Connects with a sensor and clears all temperature logs.
   *
   * Returns a promise which resolves to string 'ok'.
   *
   * @param {String} macAddress
   */
  clearLogs = async macAddress => {
    await this.connectAndDiscoverServices(macAddress);
    return this.writeWithSingleResponse(
      macAddress,
      `${BLUETOOTH.COMMANDS.CLEAR}`,
      stringFromBase64
    );
  };

  /**
   * Facade for downloading logs.
   *
   * Connects with a sensor and downloads all temperature logs.
   *
   * Returns a promise which resolves to an array of temperature objects: { temperature: 10.0 }
   *
   * @param {String} macAddress
   */
  downloadLogs = async macAddress => {
    await this.connectAndDiscoverServices(macAddress);
    this.logger.info('Download logs connected and discovered services', { macAddress });
    return this.writeAndMonitor(macAddress, BLUETOOTH.COMMANDS.DOWNLOAD, data => {
      this.logger.info('Write and monitor found some data!', { data });
      const buffer = Buffer.concat(data.slice(1).map(datum => bufferFromBase64(datum)));

      const ind = buffer.findIndex(
        (_, i) =>
          (i % 2 === 0 && buffer.readInt16BE(i) === BLUETOOTH.DELIMITER_A) ||
          buffer.readInt16BE(i) === BLUETOOTH.DELIMITER_B
      );

      return buffer.slice(0, ind).reduce((acc, _, index, buf) => {
        if (index % 2 !== 0) return acc;
        return [...acc, { temperature: buf.readInt16BE(index) / BLUETOOTH.TEMPERATURE_DIVISOR }];
      }, []);
    });
  };

  /**
   * Facade for updating a sensors log interval.
   *
   * Connects with and updates a sensors logging interval.
   *
   * Returns a promise which resolves to a string 'Interval: XXs'
   *
   * @param {String} macAddress
   * @param {Int} logInterval   The logging interval in seconds
   */
  updateLogInterval = async (macAddress, logInterval) => {
    await this.connectAndDiscoverServices(macAddress);
    return this.writeWithSingleResponse(
      macAddress,
      `${BLUETOOTH.COMMANDS.UPDATE_LOG_INTERVAL}${logInterval}`,
      stringFromBase64
    );
  };

  /**
   * Facade for forcing a sensor to blink.
   *
   * Connects with and blinks a sensors LED light.
   *
   * Returns a promise which resolves to a boolean
   *
   * @param {String} macAddress
   */
  blink = async macAddress => {
    await this.connectAndDiscoverServices(macAddress);
    return this.writeWithSingleResponse(
      macAddress,
      BLUETOOTH.COMMANDS.BLINK,
      data => !!stringFromBase64(data).match(/ok/i)
    );
  };

  /**
   * Facade for fetching a sensors meta data..
   *
   * Returns a promise which resolves to a an object:
   *
   * { batteryLevel: [int: 0-100], isDisabled: [bool]}
   *
   * @param {String} macAddress
   */
  getInfo = async macAddress => {
    await this.connectAndDiscoverServices(macAddress);
    return this.writeAndMonitor(macAddress, BLUETOOTH.COMMANDS.INFO, data =>
      data.map(stringFromBase64).reduce((acc, info) => {
        if (info.match(/Batt/)) return { ...acc, batteryLevel: info.match(/[0-9]{1,3}/)[0] };
        if (info.match(/Btn on\/off: 1/)) return { ...acc, isDisabled: true };
        return acc;
      }, {})
    );
  };

  /**
   * Facade for toggling a sensors physical on/off switch.
   *
   * Returns a promise which resolves to a string 'OK'
   *
   * @param {String} macAddress
   */
  toggleButton = async macAddress => {
    await this.connectAndDiscoverServices(macAddress);
    return this.writeWithSingleResponse(
      macAddress,
      BLUETOOTH.COMMANDS.DISABLE_BUTTON,
      data => !!stringFromBase64(data).match(/ok/i)
    );
  };

  /**
   * Wrapper around getInfo which will retry attempts if an
   * error is throwing up to {retriesLeft} times.
   * @param {String} macAddress
   * @param {Int} retriesLeft
   * @param {Error} error
   */
  getInfoWithRetries = async (macAddress, retriesLeft, error) => {
    if (!retriesLeft) throw error;

    return this.getInfo(macAddress).catch(err =>
      this.getInfoWithRetries(macAddress, retriesLeft - 1, err)
    );
  };

  /**
   * Wrapper around toggleButton which will retry attempts if an
   * error is throwing up to {retriesLeft} times.
   * @param {String} macAddress
   * @param {Int} retriesLeft
   * @param {Error} error
   */
  toggleButtonWithRetries = async (macAddress, retriesLeft, error) => {
    if (!retriesLeft) throw error;

    return this.toggleButton(macAddress).catch(err =>
      this.toggleButtonWithRetries(macAddress, retriesLeft - 1, err)
    );
  };

  /**
   * Wrapper around downloadLogs which will retry attempts if an
   * error is throwing up to {retriesLeft} times.
   * @param {String} macAddress
   * @param {Int} retriesLeft
   * @param {Error} error
   */
  downloadLogsWithRetries = async (macAddress, retriesLeft, error) => {
    this.logger.info('Starting to download logs', { macAddress, retriesLeft, error });
    if (!retriesLeft) throw error;

    return this.downloadLogs(macAddress).catch(err =>
      this.downloadLogsWithRetries(macAddress, retriesLeft - 1, err)
    );
  };

  /**
   * Wrapper around blink which will retry attempts if an
   * error is throwing up to {retriesLeft} times.
   * @param {String} macAddress
   * @param {Int} retriesLeft
   * @param {Error} error
   */
  blinkWithRetries = async (macAddress, retriesLeft, error) => {
    if (!retriesLeft) throw error;

    return this.blink(macAddress).catch(err =>
      this.blinkWithRetries(macAddress, retriesLeft - 1, err)
    );
  };

  /**
   * Wrapper around updateLogInterval which will retry attempts if an
   * error is throwing up to {retriesLeft} times.
   * @param {String} macAddress
   * @param {Int} logInterval The logging interval in seconds
   * @param {Int} retriesLeft
   * @param {Error} error
   */
  updateLogIntervalWithRetries = async (macAddress, logInterval, retriesLeft, error) => {
    if (!retriesLeft) throw error;

    return this.updateLogInterval(macAddress, logInterval).catch(err =>
      this.updateLogIntervalWithRetries(macAddress, logInterval, retriesLeft - 1, err)
    );
  };
}

let BleServiceInstance;

export const getBleServiceInstance = (manager, logger) => {
  if (!BleServiceInstance) {
    BleServiceInstance = new BleService(manager, logger);
  }

  return BleServiceInstance;
};

export default getBleServiceInstance;
