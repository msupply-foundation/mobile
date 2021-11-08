import { MacAddress } from '../types/common';
import { Subscription, Characteristic, BleError, Device, ScanOptions, LogLevel } from 'react-native-ble-plx';
export declare type MockOrRealDevice = Pick<Device, 'id' | 'name'> | Device;
export declare class BluetoothManager {
    setLogLevel(logLevel: LogLevel): void;
    logLevel(): Promise<LogLevel>;
    cancelTransaction(transactionId: string): void;
    connectToDevice(macAddress: MacAddress): Promise<MockOrRealDevice>;
    isDeviceConnected(macAddress: MacAddress): Promise<boolean>;
    cancelDeviceConnection(macAddress: MacAddress): Promise<MockOrRealDevice>;
    discoverAllServicesAndCharacteristicsForDevice(macAddress: MacAddress): Promise<MockOrRealDevice>;
    stopDeviceScan(): void;
    startDeviceScan(UUIDs: string[] | null, options: ScanOptions | null, listener: (error: BleError | null, scannedDevice: Device | null) => void): void;
    writeCharacteristicWithoutResponseForDevice(deviceIdentifier: string, serviceUUID: string, characteristicUUID: string, base64Value: string, transactionId?: string): Promise<Characteristic>;
    monitorCharacteristicForDevice(deviceIdentifier: string, serviceUUID: string, characteristicUUID: string, listener: (error: BleError | null, characteristic: Characteristic | null) => void, transactionId?: string): Subscription;
}
export declare const BleManager: typeof BluetoothManager;
