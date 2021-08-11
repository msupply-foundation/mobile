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
  engine = null;

  constructor(engine) {
    this.engine = engine;
  }

  trace(text) {
    this.engine.trace(text);
  }

  debug(text) {
    this.engine.debug(text);
  }

  info(text) {
    this.engine.info(text);
  }

  warn(text) {
    this.engine.warn(text);
  }

  error(text) {
    this.engine.warn(text);
  }

  fatal(text) {
    this.engine.warn(text);
  }

  setLogLevel(transportName, newLevel) {
    this.engine.setLogLevel(transportName, newLevel);
  }
}
