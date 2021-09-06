import { BunyanLoggingEngine } from './Engine';
import { Action } from '.';

// interface Logger {
//     trace: (text: string) => void
//     debug: (text: string) => void
//     info: (text: string) => void
//     warn: (text: string) => void
//     error: (text: string) => void
//     fatal: (text: string) => void
//     createChild: (text: string) => void
//     setLogLevel: (transportName: string, logLevel: number) => void
// }

export class Logger {
  engine = null as BunyanLoggingEngine | null;

  constructor(engine: null | BunyanLoggingEngine) {
    this.engine = engine;
  }

  trace: Action = (textOrError, details) => {
    this.engine?.trace(textOrError, details);
  };

  debug: Action = (textOrError, details) => {
    this.engine?.debug(textOrError, details);
  };

  info: Action = (textOrError, details) => {
    this.engine?.info(textOrError, details);
  };

  warn: Action = (textOrError, details) => {
    this.engine?.warn(textOrError, details);
  };

  error: Action = (textOrError, details) => {
    this.engine?.warn(textOrError, details);
  };

  fatal: Action = (textOrError, details) => {
    this.engine?.warn(textOrError, details);
  };

  setLogLevel(transportName, newLevel) {
    this.engine?.setLogLevel(transportName, newLevel);
  }
}
