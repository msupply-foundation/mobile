"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BLUE_MAESTRO = exports.BT510 = void 0;
let BT510;
exports.BT510 = BT510;

(function (BT510) {
  BT510["BLUETOOTH_UART_SERVICE_UUID"] = "569a1101-b87f-490c-92cb-11ba5ea5167c";
  BT510["BLUETOOTH_WRITE_CHARACTERISTIC_UUID"] = "569a2000-b87f-490c-92cb-11ba5ea5167c";
  BT510["BLUETOOTH_READ_CHARACTERISTIC_UUID"] = "569a2001-b87f-490c-92cb-11ba5ea5167c";
  BT510[BT510["BLUETOOTH_SCAN_MODE_LOW_LATENCY"] = 2] = "BLUETOOTH_SCAN_MODE_LOW_LATENCY";
  BT510["COMMAND_BLINK"] = "{\"jsonrpc\": \"2.0\", \"method\": \"ledTest\", \"params\": [200], \"id\": 1}";
  BT510["COMMAND_PREPARE_LOG"] = "{ \"jsonrpc\": \"2.0\", \"method\": \"prepareLog\", \"params\": [MODE], \"id\": 2 }";
  BT510["COMMAND_DOWNLOAD"] = "{ \"jsonrpc\": \"2.0\", \"method\": \"readLog\", \"params\": [NUMEVENTS], \"id\": 3 }";
  BT510["COMMAND_INFO"] = "{\"jsonrpc\": \"2.0\", \"method\": \"get\", \"params\": [\"batteryVoltageMv\"], \"id\": 4}";
  BT510["COMMAND_UPDATE_LOG_INTERVAL"] = "{\"jsonrpc\": \"2.0\", \"method\": \"set\", \"params\": {\"temperatureSenseInterval\": LOG_INTERVAL, \"batterySenseInterval\": 600}, \"id\": 5}";
  BT510["COMMAND_ACK_LOG"] = "{ \"jsonrpc\": \"2.0\", \"method\": \"ackLog\", \"params\": [NUMEVENTS], \"id\": 6 }";
  BT510[BT510["MANUFACTURER_ID"] = 228] = "MANUFACTURER_ID";
  BT510[BT510["TEMPERATURE_DIVISOR"] = 100] = "TEMPERATURE_DIVISOR";
})(BT510 || (exports.BT510 = BT510 = {}));

let BLUE_MAESTRO;
exports.BLUE_MAESTRO = BLUE_MAESTRO;

(function (BLUE_MAESTRO) {
  BLUE_MAESTRO["BLUETOOTH_UART_SERVICE_UUID"] = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
  BLUE_MAESTRO["BLUETOOTH_READ_CHARACTERISTIC_UUID"] = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
  BLUE_MAESTRO["BLUETOOTH_WRITE_CHARACTERISTIC_UUID"] = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
  BLUE_MAESTRO[BLUE_MAESTRO["BLUETOOTH_SCAN_MODE_LOW_LATENCY"] = 2] = "BLUETOOTH_SCAN_MODE_LOW_LATENCY";
  BLUE_MAESTRO["COMMAND_BLINK"] = "*blink";
  BLUE_MAESTRO["COMMAND_DOWNLOAD"] = "*logall";
  BLUE_MAESTRO["COMMAND_INFO"] = "*info";
  BLUE_MAESTRO["COMMAND_UPDATE_LOG_INTERVAL"] = "*lintLOG_INTERVAL";
  BLUE_MAESTRO["COMMAND_DISABLE_BUTTON"] = "*bd";
  BLUE_MAESTRO["COMMAND_CLEAR"] = "*clr";
  BLUE_MAESTRO[BLUE_MAESTRO["MANUFACTURER_ID"] = 307] = "MANUFACTURER_ID";
  BLUE_MAESTRO[BLUE_MAESTRO["DELIMITER_A"] = 11776] = "DELIMITER_A";
  BLUE_MAESTRO[BLUE_MAESTRO["DELIMITER_B"] = 11308] = "DELIMITER_B";
  BLUE_MAESTRO[BLUE_MAESTRO["TEMPERATURE_DIVISOR"] = 10] = "TEMPERATURE_DIVISOR";
})(BLUE_MAESTRO || (exports.BLUE_MAESTRO = BLUE_MAESTRO = {}));
//# sourceMappingURL=Bluetooth.js.map