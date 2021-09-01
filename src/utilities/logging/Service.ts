/* eslint-disable no-undef */
import { BunyanLoggingEngine } from './Engine';
import { Logger } from './Logger';
import { consoleTransport, fileTransport } from './Transport';

const createLoggingEngine = options => new BunyanLoggingEngine(options);

export class LoggerService {
  loggers = {};

  transports = {};

  // type DefaultLogLevel = Record<LoggerName, Record<TransportName, LogLevel>>
  defaultLogLevels = {};

  constructor(defaultLogLevels = {}) {
    this.defaultLogLevels = defaultLogLevels;

    if (__DEV__) {
      this.addTransport('console', consoleTransport);
    } else {
      this.addTransport('file', fileTransport);
    }
  }

  createLogger(module) {
    const engine = createLoggingEngine({ module, transports: this.transports });
    const newLogger = new Logger(engine);
    this.loggers[module] = newLogger;

    // Get the default log levels for this module:
    // defaultLogLevels = Record<TransportName, LogLevel>
    const defaultLogLevels = this.defaultLogLevels[module];
    if (defaultLogLevels) {
      // Set the logging level for each transport within the module
      Object.entries(defaultLogLevels).forEach(([transportName, logLevel]) => {
        newLogger.setLogLevel(transportName, logLevel);
      });
    }

    return newLogger;
  }

  addTransport(key, transport) {
    this.transports[key] = transport;
  }
}
