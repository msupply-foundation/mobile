import bunyan from 'react-native-bunyan';

// Logging engine for the Logger class which implements the logic
// of creating a log format and hands off the log to a transport
// object.
//
// interface LoggingEngine {
//     trace: (text: string) => void
//     debug: (text: string) => void
//     info: (text: string) => void
//     warn: (text: string) => void
//     error: (text: string) => void
//     fatal: (text: string) => void
//     setLogLevel(transportKey: string, newLevel: int) => void
// }
export class BunyanLoggingEngine {
  bunyan = null;

  constructor({ module, transports }) {
    const streams = Object.values(transports).map(({ level, write, name }) => ({
      name,
      level,
      stream: { write },
    }));

    this.bunyan = bunyan.createLogger({ name: module, streams });
  }

  trace(text) {
    this.bunyan.trace(text);
  }

  debug(text) {
    this.bunyan.debug(text);
  }

  info(text) {
    this.bunyan.info(text);
  }

  warn(text) {
    this.bunyan.warn(text);
  }

  error(text) {
    this.bunyan.error(text);
  }

  fatal(text) {
    this.bunyan.fatal(text);
  }

  setLogLevel(transportKey, newLevel) {
    this.bunyan.levels(transportKey, newLevel);
  }
}
