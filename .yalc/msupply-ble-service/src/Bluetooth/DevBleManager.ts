import { MacAddress } from '../types/common';
import { BluetoothManager, MockOrRealDevice } from './BleManager';
import {
  Device,
  BleError,
  ScanOptions,
  Characteristic,
  Subscription,
  LogLevel,
} from 'react-native-ble-plx';

interface MonitorCallback {
  (error: BleError | null, characteristic: Characteristic | null): void;
}

const COMMAND_TO_RESULT_LOOKUP = {
  // *logall
  'KmxvZ2FsbA==': (callback: MonitorCallback) => {
    callback(null, { value: 'ABEAEQARAAIBAAAAAAA6' } as Characteristic); // 00110011001100020100000000003ax
    callback(null, { value: 'ARcBFwEXARcBFwEXARcBFwEXARc=' } as Characteristic); // 0117011701170117011701170117011701170117x
    callback(null, { value: 'ARcBFwEXARYBFgEWARguAAAAAAA=' } as Characteristic); // 01170117011701160116011601182e0000000000x
    callback(null, null);
  },
  // *blink
  KmJsaW5r: (callback: MonitorCallback) => {
    callback(null, { value: 'T2sA' } as Characteristic);
    callback(null, null);
  },
  // *info
  'KmluZm8=': (callback: MonitorCallback) => {
    callback(null, { value: 'U0VUVElOR1MAAAAAAAAAAAAAAAA=' } as Characteristic);
    callback(null, { value: 'TmFtZTogICBFNzIyOTZERQAAAAA=' } as Characteristic);
    callback(null, { value: 'VmVyIG5vOiAxMwAAAAAAAAAAAAA=' } as Characteristic);
    callback(null, { value: 'U3ViIHZlciBubzogMTUuMC4wAAA=' } as Characteristic);
    callback(null, { value: 'UmVsIGR0ZTogMjYgU2VwIDE5AAA=' } as Characteristic);
    callback(null, { value: 'VHhwIGx2bDogNAAAAAAAAAAAAAA=' } as Characteristic);
    callback(null, { value: 'QmF0dCBsdmw6IDEwMCUAAAAAAAA=' } as Characteristic);
    callback(null, { value: 'TWVtIDgzMyBkYXlzAAAAAAAAAAA=' } as Characteristic);
    callback(null, { value: 'QWR2IHdrZXVwOiBOL0EAAAAAAAA=' } as Characteristic);
    callback(null, { value: 'VW5pdHM6IEMAAAAAAAAAAAAAAAA=' } as Characteristic);
    callback(null, { value: 'TWVtOiAyMDAwMAAAAAAAAAAAAAA=' } as Characteristic);
    callback(null, { value: 'QWlyIG1vZGUgb2ZmAAAAAAAAAAA=' } as Characteristic);
    callback(null, { value: 'UnVuIGFwcHggMTZocnMAAAAAAAA=' } as Characteristic);
    callback(null, { value: 'RGF0ZSB5eW1tZGRoaG1tOgAAAAA=' } as Characteristic);
    callback(null, { value: 'LT4gMDA6MDA6MDA6MDA6MDAAAAA=' } as Characteristic);
    callback(null, { value: 'SWQ6IDI1NQAAAAAAAAAAAAAAAAA=' } as Characteristic);
    callback(null, { value: 'QnRuIG9uL29mZjogMQAAAAAAAAA=' } as Characteristic);
    callback(null, { value: 'VGVtcCBDYWwuIDAAAAAAAAAAAAA=' } as Characteristic);
    callback(null, { value: 'SHVtIENhbHgxMCAwJQAAAAAAAAA=' } as Characteristic);
    callback(null, null);
  },
  // *bd
  KmJk: (callback: MonitorCallback) => {
    callback(null, { value: 'T2sA' } as Characteristic);
    callback(null, null);
  },
  // *lint300
  'KmxpbnQzMDA=': (callback: MonitorCallback) => {
    callback(null, { value: 'SW50ZXJ2YWw6IDYwcwAAAAAAAAA=' } as Characteristic);
    callback(null, null);
  },
};

export class DevBleManager implements BluetoothManager {
  connectedDevices: { [key: string]: MockOrRealDevice | null };

  registeredCallbacks: {
    [key: string]: MonitorCallback;
  };

  isScanning: boolean;

  level: LogLevel = LogLevel.None;

  scannerInterval: number | null;

  constructor() {
    this.connectedDevices = {};
    this.registeredCallbacks = {};
    this.isScanning = false;
    this.scannerInterval = null;
  }
  async logLevel(): Promise<LogLevel> {
    return this.level;
  }

  cancelTransaction(transactionId: string): void {
    console.log(`Canceling transaction ${transactionId}`);
  }

  setLogLevel(logLevel: LogLevel): void {
    this.level = logLevel;
  }

  async connectToDevice(macAddress: MacAddress): Promise<MockOrRealDevice> {
    this.connectedDevices[macAddress] = { id: macAddress, name: 'bluemaestro' };
    if (this.level !== LogLevel.None) {
      console.log('connect to Device in DEVBlemanager');
    }
    return { id: macAddress, name: 'bluemaestro' };
  }

  async isDeviceConnected(macAddress: string): Promise<boolean> {
    return !!this.connectedDevices[macAddress];
  }

  async cancelDeviceConnection(macAddress: string): Promise<MockOrRealDevice> {
    const device = this.connectedDevices[macAddress];

    if (!device) {
      throw new Error('Device is not connected');
    }

    this.connectedDevices[macAddress] = null;

    return device;
  }

  async discoverAllServicesAndCharacteristicsForDevice(
    macAddress: MacAddress
  ): Promise<MockOrRealDevice> {
    const connectedDevice = this.connectedDevices[macAddress];
    if (this.level !== LogLevel.None) {
      console.log('connect to Device in DEVBlemanager');
    }
    if (!connectedDevice) {
      throw new Error("Trying to discover services of a device which isn't connected");
    }

    return connectedDevice;
  }

  stopDeviceScan(): void {
    this.isScanning = false;

    if (this.scannerInterval) clearInterval(this.scannerInterval);
  }

  startDeviceScan(
    _: string[] | null,
    __: ScanOptions | null,
    callback: (error: BleError | null, scannedDevice: Device | null) => void
  ): void {
    this.isScanning = true;
    if (this.level !== LogLevel.None) {
      console.log('Scanning in DEVBlemanager');
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - TSC sometimes thinks it's getting setInterval from node, not react-native
    this.scannerInterval = setInterval(
      () =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Ignoring this as I don't want to create a full Device object for this development helper.
        callback(null, {
          id: 'AB:CD:EF:GH:IJ:KL',
          manufacturerData: 'MwEBDAN0AFkBtwEMA3QAWQG3AMwCrAAAAAAA',
        }),
      1000
    );
  }

  async writeCharacteristicWithoutResponseForDevice(
    macAddress: string,
    _: string,
    __: string,
    command: string,
    ___: string
  ): Promise<Characteristic> {
    const connectedDevice = this.connectedDevices[macAddress];
    const callback = this.connectedDevices[macAddress];
    if (connectedDevice && callback) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - ignoring this to not explicitly type the base64d commands etc
      COMMAND_TO_RESULT_LOOKUP[command](callback);
      this.connectedDevices[macAddress] = null;
    } else {
      throw new Error("Trying to write to a device which isn't connected or isn't being monitored");
    }

    return {} as Characteristic;
  }

  monitorCharacteristicForDevice(
    macAddress: string,
    _: string,
    __: string,
    callback: MonitorCallback,

    ___: string
  ): Subscription {
    const connectedDevice = this.connectedDevices[macAddress];
    if (connectedDevice) {
      this.registeredCallbacks[macAddress] = callback;
    } else {
      throw new Error("Trying to write to a device which isn't connected");
    }

    return {} as Subscription;
  }
}
