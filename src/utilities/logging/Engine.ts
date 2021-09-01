import bunyan from 'react-native-bunyan';
import { Action } from '.';
import { Transport } from './Transport';
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
  bunyan: null | any = null;

  constructor({ module, transports }: { module: any; transports: Transport[] }) {
    const streams = Object.values(transports).map(
      ({ level, write, name }: { level: number; write: any; name: string }) => ({
        name,
        level,
        stream: { write },
      })
    );

    this.bunyan = bunyan.createLogger({ name: module, streams });
  }

  trace: Action = (text, details) => {
    this.bunyan?.trace(text, details);
  };

  debug: Action = (text, details) => {
    this.bunyan?.debug(text, details);
  };

  info: Action = (text, details) => {
    this.bunyan.info(text), details;
  };

  warn: Action = (text, details) => {
    this.bunyan.warn(text, details);
  };

  error: Action = (text, details) => {
    this.bunyan.error(text, details);
  };

  fatal: Action = (text, details) => {
    this.bunyan.fatal(text, details);
  };

  setLogLevel(transportKey, newLevel) {
    this.bunyan.levels(transportKey, newLevel);
  }
}
