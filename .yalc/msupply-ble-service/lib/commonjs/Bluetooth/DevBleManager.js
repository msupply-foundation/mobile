"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevBleManager = void 0;

var _reactNativeBlePlx = require("react-native-ble-plx");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const COMMAND_TO_RESULT_LOOKUP = {
  // *logall
  'KmxvZ2FsbA==': callback => {
    callback(null, {
      value: 'ABEAEQARAAIBAAAAAAA6'
    }); // 00110011001100020100000000003ax

    callback(null, {
      value: 'ARcBFwEXARcBFwEXARcBFwEXARc='
    }); // 0117011701170117011701170117011701170117x

    callback(null, {
      value: 'ARcBFwEXARYBFgEWARguAAAAAAA='
    }); // 01170117011701160116011601182e0000000000x

    callback(null, null);
  },
  // *blink
  KmJsaW5r: callback => {
    callback(null, {
      value: 'T2sA'
    });
    callback(null, null);
  },
  // *info
  'KmluZm8=': callback => {
    callback(null, {
      value: 'U0VUVElOR1MAAAAAAAAAAAAAAAA='
    });
    callback(null, {
      value: 'TmFtZTogICBFNzIyOTZERQAAAAA='
    });
    callback(null, {
      value: 'VmVyIG5vOiAxMwAAAAAAAAAAAAA='
    });
    callback(null, {
      value: 'U3ViIHZlciBubzogMTUuMC4wAAA='
    });
    callback(null, {
      value: 'UmVsIGR0ZTogMjYgU2VwIDE5AAA='
    });
    callback(null, {
      value: 'VHhwIGx2bDogNAAAAAAAAAAAAAA='
    });
    callback(null, {
      value: 'QmF0dCBsdmw6IDEwMCUAAAAAAAA='
    });
    callback(null, {
      value: 'TWVtIDgzMyBkYXlzAAAAAAAAAAA='
    });
    callback(null, {
      value: 'QWR2IHdrZXVwOiBOL0EAAAAAAAA='
    });
    callback(null, {
      value: 'VW5pdHM6IEMAAAAAAAAAAAAAAAA='
    });
    callback(null, {
      value: 'TWVtOiAyMDAwMAAAAAAAAAAAAAA='
    });
    callback(null, {
      value: 'QWlyIG1vZGUgb2ZmAAAAAAAAAAA='
    });
    callback(null, {
      value: 'UnVuIGFwcHggMTZocnMAAAAAAAA='
    });
    callback(null, {
      value: 'RGF0ZSB5eW1tZGRoaG1tOgAAAAA='
    });
    callback(null, {
      value: 'LT4gMDA6MDA6MDA6MDA6MDAAAAA='
    });
    callback(null, {
      value: 'SWQ6IDI1NQAAAAAAAAAAAAAAAAA='
    });
    callback(null, {
      value: 'QnRuIG9uL29mZjogMQAAAAAAAAA='
    });
    callback(null, {
      value: 'VGVtcCBDYWwuIDAAAAAAAAAAAAA='
    });
    callback(null, {
      value: 'SHVtIENhbHgxMCAwJQAAAAAAAAA='
    });
    callback(null, null);
  },
  // *bd
  KmJk: callback => {
    callback(null, {
      value: 'T2sA'
    });
    callback(null, null);
  },
  // *lint300
  'KmxpbnQzMDA=': callback => {
    callback(null, {
      value: 'SW50ZXJ2YWw6IDYwcwAAAAAAAAA='
    });
    callback(null, null);
  }
};

class DevBleManager {
  constructor() {
    _defineProperty(this, "connectedDevices", void 0);

    _defineProperty(this, "registeredCallbacks", void 0);

    _defineProperty(this, "isScanning", void 0);

    _defineProperty(this, "level", _reactNativeBlePlx.LogLevel.None);

    _defineProperty(this, "scannerInterval", void 0);

    this.connectedDevices = {};
    this.registeredCallbacks = {};
    this.isScanning = false;
    this.scannerInterval = null;
  }

  async logLevel() {
    return this.level;
  }

  cancelTransaction(transactionId) {
    console.log(`Canceling transaction ${transactionId}`);
  }

  setLogLevel(logLevel) {
    this.level = logLevel;
  }

  async connectToDevice(macAddress) {
    this.connectedDevices[macAddress] = {
      id: macAddress,
      name: 'bluemaestro'
    };

    if (this.level !== _reactNativeBlePlx.LogLevel.None) {
      console.log('connect to Device in DEVBlemanager');
    }

    return {
      id: macAddress,
      name: 'bluemaestro'
    };
  }

  async isDeviceConnected(macAddress) {
    return !!this.connectedDevices[macAddress];
  }

  async cancelDeviceConnection(macAddress) {
    const device = this.connectedDevices[macAddress];

    if (!device) {
      throw new Error('Device is not connected');
    }

    this.connectedDevices[macAddress] = null;
    return device;
  }

  async discoverAllServicesAndCharacteristicsForDevice(macAddress) {
    const connectedDevice = this.connectedDevices[macAddress];

    if (this.level !== _reactNativeBlePlx.LogLevel.None) {
      console.log('connect to Device in DEVBlemanager');
    }

    if (!connectedDevice) {
      throw new Error("Trying to discover services of a device which isn't connected");
    }

    return connectedDevice;
  }

  stopDeviceScan() {
    this.isScanning = false;
    if (this.scannerInterval) clearInterval(this.scannerInterval);
  }

  startDeviceScan(_, __, callback) {
    this.isScanning = true;

    if (this.level !== _reactNativeBlePlx.LogLevel.None) {
      console.log('Scanning in DEVBlemanager');
    } // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - TSC sometimes thinks it's getting setInterval from node, not react-native


    this.scannerInterval = setInterval(() => // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Ignoring this as I don't want to create a full Device object for this development helper.
    callback(null, {
      id: 'AB:CD:EF:GH:IJ:KL',
      manufacturerData: 'MwEBDAN0AFkBtwEMA3QAWQG3AMwCrAAAAAAA'
    }), 1000);
  }

  async writeCharacteristicWithoutResponseForDevice(macAddress, _, __, command, ___) {
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

    return {};
  }

  monitorCharacteristicForDevice(macAddress, _, __, callback, ___) {
    const connectedDevice = this.connectedDevices[macAddress];

    if (connectedDevice) {
      this.registeredCallbacks[macAddress] = callback;
    } else {
      throw new Error("Trying to write to a device which isn't connected");
    }

    return {};
  }

}

exports.DevBleManager = DevBleManager;
//# sourceMappingURL=DevBleManager.js.map