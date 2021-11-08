"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BTUtilService = void 0;

var _buffer = require("buffer");

var _constants = require("../constants");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class BTUtilService {
  constructor() {
    _defineProperty(this, "toFahrenheit", celsius => Math.round(celsius * 9.0 / 5.0) + 320.0);

    _defineProperty(this, "bufferFromBase64", base64 => _buffer.Buffer.from(base64, 'base64'));

    _defineProperty(this, "stringFromBase64", base64 => this.bufferFromBase64(base64).toString('utf-8'));

    _defineProperty(this, "base64FromString", string => _buffer.Buffer.from(string, 'utf-8').toString('base64'));

    _defineProperty(this, "normaliseNumber", (currentVal, oldRange, newRange = [0, 100]) => {
      const [oldMin, oldMax] = oldRange;
      const [newMin, newMax] = newRange;
      const newVal = (currentVal - oldMin) * (newMax - newMin) / (oldMax - oldMin) + newMin;
      return Math.floor(newVal);
    });

    _defineProperty(this, "deviceDescriptorToDevice", macAddress => {
      var _ref, _parts$;

      const parts = macAddress.split('|');
      return {
        id: parts[0].trim(),
        // If the descriptor doesn't have a device field, it's a Blue Maestro that
        // was previously paired.
        deviceType: (_ref = ((_parts$ = parts[1]) === null || _parts$ === void 0 ? void 0 : _parts$.trim()) === 'BT510' ? _constants.BT510 : _constants.BLUE_MAESTRO) !== null && _ref !== void 0 ? _ref : _constants.BLUE_MAESTRO
      };
    });

    _defineProperty(this, "deviceToDeviceDescriptor", (deviceId, mfgId) => {
      const deviceType = mfgId === _constants.BLUE_MAESTRO.MANUFACTURER_ID ? 'BLUE_MAESTRO' : 'BT510';
      return `${deviceId} | ${deviceType}`;
    });
  }

}

exports.BTUtilService = BTUtilService;
//# sourceMappingURL=BTUtilService.js.map