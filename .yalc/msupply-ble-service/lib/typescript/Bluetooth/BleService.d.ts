import { BtUtilService } from '../BTUtilService';
import { MacAddress } from '../types/common';
import { Characteristic, TypedDevice, InfoLog, MonitorCharacteristicCallback, MonitorCharacteristicParser, ScanCallback, SensorLog, DataLog } from './types';
import { BluetoothManager, MockOrRealDevice } from './BleManager';
declare type Action = (message: string | Error, details?: Record<string, unknown>) => void;
interface Logger {
    trace: Action;
    debug: Action;
    info: Action;
    warn: Action;
    error: Action;
    fatal: Action;
    setLogLevel: (transportKey: string, newLevel: number) => void;
}
export declare class BleService {
    manager: BluetoothManager;
    utils: BtUtilService;
    logger: Logger;
    constructor(manager: BluetoothManager, logger?: Logger);
    connectToDevice: (deviceId: string) => Promise<MockOrRealDevice>;
    connectAndDiscoverServices: (deviceDescriptor: string) => Promise<TypedDevice>;
    stopScan: () => void;
    scanForSensors: (callback: ScanCallback) => void;
    writeCharacteristic: (device: TypedDevice, command: string) => Promise<Characteristic>;
    monitorCharacteristic: (device: TypedDevice, callback: MonitorCharacteristicCallback<boolean | SensorLog[] | InfoLog | DataLog>, transactionId: string) => Promise<boolean | SensorLog[] | InfoLog | DataLog>;
    transactionId: () => string;
    writeAndMonitor: (device: TypedDevice, command: string, parser: MonitorCharacteristicParser<string[], SensorLog[] | InfoLog | DataLog>) => Promise<boolean | InfoLog | SensorLog[] | DataLog>;
    writeWithSingleResponse: (device: TypedDevice, command: string, parser: MonitorCharacteristicParser<string, boolean>) => Promise<boolean | SensorLog[] | InfoLog | DataLog>;
    /** Facade for clearing logs.
     *
     * Connects with a sensor and clears all temperature logs.
     *
     * Returns a promise which resolves to boolean, which is ignored by the caller.
     *
     * @param {String} macAddress
     */
    clearLogs: (macAddress: MacAddress) => Promise<void>;
    downloadLogs: (macAddress: MacAddress) => Promise<SensorLog[]>;
    updateLogInterval: (macAddress: MacAddress, logInterval: number, clearLogs?: boolean) => Promise<boolean>;
    blink: (macAddress: MacAddress) => Promise<boolean>;
    getInfo: (macAddress: MacAddress) => Promise<InfoLog>;
    toggleButton: (macAddress: MacAddress) => Promise<boolean>;
    getInfoWithRetries: (macAddress: MacAddress, retriesLeft: number, error: Error | null) => Promise<InfoLog>;
    toggleButtonWithRetries: (macAddress: MacAddress, retriesLeft: number, error: Error | null) => Promise<boolean>;
    downloadLogsWithRetries: (macAddress: MacAddress, retriesLeft: number, error: Error | null) => Promise<SensorLog[]>;
    blinkWithRetries: (macAddress: MacAddress, retriesLeft: number, error: Error | null) => Promise<boolean>;
    updateLogIntervalWithRetries: (macAddress: MacAddress, logInterval: number, retriesLeft: number, clearLogs: boolean, error: Error | null) => Promise<boolean>;
}
export {};
