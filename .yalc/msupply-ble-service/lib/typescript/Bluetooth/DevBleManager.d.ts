import { MacAddress } from '../types/common';
import { BluetoothManager, MockOrRealDevice } from './BleManager';
import { Device, BleError, ScanOptions, Characteristic, Subscription, LogLevel } from 'react-native-ble-plx';
interface MonitorCallback {
    (error: BleError | null, characteristic: Characteristic | null): void;
}
export declare class DevBleManager implements BluetoothManager {
    connectedDevices: {
        [key: string]: MockOrRealDevice | null;
    };
    registeredCallbacks: {
        [key: string]: MonitorCallback;
    };
    isScanning: boolean;
    level: LogLevel;
    scannerInterval: number | null;
    constructor();
    logLevel(): Promise<LogLevel>;
    cancelTransaction(transactionId: string): void;
    setLogLevel(logLevel: LogLevel): void;
    connectToDevice(macAddress: MacAddress): Promise<MockOrRealDevice>;
    isDeviceConnected(macAddress: string): Promise<boolean>;
    cancelDeviceConnection(macAddress: string): Promise<MockOrRealDevice>;
    discoverAllServicesAndCharacteristicsForDevice(macAddress: MacAddress): Promise<MockOrRealDevice>;
    stopDeviceScan(): void;
    startDeviceScan(_: string[] | null, __: ScanOptions | null, callback: (error: BleError | null, scannedDevice: Device | null) => void): void;
    writeCharacteristicWithoutResponseForDevice(macAddress: string, _: string, __: string, command: string, ___: string): Promise<Characteristic>;
    monitorCharacteristicForDevice(macAddress: string, _: string, __: string, callback: MonitorCallback, ___: string): Subscription;
}
export {};
