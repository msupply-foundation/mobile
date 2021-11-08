export enum BT510 {
  BLUETOOTH_UART_SERVICE_UUID = '569a1101-b87f-490c-92cb-11ba5ea5167c',
  BLUETOOTH_WRITE_CHARACTERISTIC_UUID = '569a2000-b87f-490c-92cb-11ba5ea5167c',
  BLUETOOTH_READ_CHARACTERISTIC_UUID = '569a2001-b87f-490c-92cb-11ba5ea5167c',
  BLUETOOTH_SCAN_MODE_LOW_LATENCY = 2,
  COMMAND_BLINK = '{"jsonrpc": "2.0", "method": "ledTest", "params": [200], "id": 1}',
  COMMAND_PREPARE_LOG = '{ "jsonrpc": "2.0", "method": "prepareLog", "params": [MODE], "id": 2 }',
  COMMAND_DOWNLOAD = '{ "jsonrpc": "2.0", "method": "readLog", "params": [NUMEVENTS], "id": 3 }',
  COMMAND_INFO = '{"jsonrpc": "2.0", "method": "get", "params": ["batteryVoltageMv"], "id": 4}',
  COMMAND_UPDATE_LOG_INTERVAL = '{"jsonrpc": "2.0", "method": "set", "params": {"temperatureSenseInterval": LOG_INTERVAL, "batterySenseInterval": 600}, "id": 5}',
  COMMAND_ACK_LOG = '{ "jsonrpc": "2.0", "method": "ackLog", "params": [NUMEVENTS], "id": 6 }',
  MANUFACTURER_ID = 228, // 0xE4
  TEMPERATURE_DIVISOR = 100.0,
}

export enum BLUE_MAESTRO {
  BLUETOOTH_UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  BLUETOOTH_READ_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
  BLUETOOTH_WRITE_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
  BLUETOOTH_SCAN_MODE_LOW_LATENCY = 2,
  COMMAND_BLINK = '*blink',
  COMMAND_DOWNLOAD = '*logall',
  COMMAND_INFO = '*info',
  COMMAND_UPDATE_LOG_INTERVAL = '*lintLOG_INTERVAL',
  COMMAND_DISABLE_BUTTON = '*bd',
  COMMAND_CLEAR = '*clr',
  MANUFACTURER_ID = 307,
  DELIMITER_A = 11776,
  DELIMITER_B = 11308,
  TEMPERATURE_DIVISOR = 10.0,
}
