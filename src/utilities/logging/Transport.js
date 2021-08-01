/* eslint-disable no-console */
import moment from 'moment';
import RNFS from 'react-native-fs';

export const LogLevel = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

export const logDir = `${RNFS.ExternalStorageDirectoryPath}/Download/mSupplyMobile_data`;
export const logFileName = 'log.txt';
export const logFileDate = 'DD-MM-YY';
export const logFileSeparator = '__';

// interface Transport {
//     write: (text: string) => void
//     level: number
//     name: string
// }

export const consoleTransport = {
  name: 'console',
  level: LogLevel.trace,
  write: text => {
    console.log('-------------------------------------------');
    console.log('text', text);
    console.log('-------------------------------------------');
  },
};

export const fileTransport = {
  name: 'file',
  level: LogLevel.info,
  write: text => {
    const date = moment().format(logFileDate);
    // mSupplyMobile_data/DD-MM-YY__log.txt
    const path = `${logDir}/${date}${logFileSeparator}${logFileName}`;
    RNFS.appendFile(path, text);
  },
};
