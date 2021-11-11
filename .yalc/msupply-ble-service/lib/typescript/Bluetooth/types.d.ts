import { ScanMode, Subscription, Characteristic, BleError, Device, ScanOptions, LogLevel } from 'react-native-ble-plx';
import { BT510, BLUE_MAESTRO } from '../constants';
export declare type DeviceType = typeof BT510 | typeof BLUE_MAESTRO;
export interface TypedDevice {
    id: string;
    deviceType: DeviceType;
}
export interface InfoLog {
    batteryLevel: null | number;
    isDisabled: boolean;
}
export interface SensorLog {
    temperature: number;
}
export interface DataLog {
    numEvents: number;
    data: string;
}
export interface ScanCallback {
    (error: BleError | null, deviceDescriptor: string): void;
}
export interface Resolver<ResolverResult> {
    (result: ResolverResult): void;
}
export interface ErrorRejector {
    (error: Error): void;
}
export interface MonitorCharacteristicCallback<ResolverResult> {
    (result: Characteristic | null, resolver: Resolver<ResolverResult>, rejector: ErrorRejector, subscription: Subscription): void;
}
export interface MonitorCharacteristicParser<ParserInput, ParserResult> {
    (result: ParserInput): ParserResult;
}
export { ScanMode, Subscription, Characteristic, BleError, Device, ScanOptions, LogLevel };
