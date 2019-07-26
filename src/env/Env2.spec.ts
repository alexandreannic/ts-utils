import * as dotenv from 'dotenv';
import * as moment from 'moment';
import * as fs from 'fs';
import {bool, defaultValue, int, required} from './EnvParser';
import {env} from './Env';

export type fileBaseName = 'tinyclues_product' | 'tinyclues_order' | 'tinyclues_order_details';

export const getFileName = (type: fileBaseName, date: string = moment().subtract(1, 'd').format('YYYYMMDD')): string => {
  return `${date}_${type}.csv`;
};

const parseTimestamp = (key: string): number | undefined => {
  const ts = process.env[key];
  if (ts) {
    if (ts.charAt(0) !== '1') {
      throw Error(`Timestamp ${ts} in ${key} seems invalid. It should looks like 1550567460000.`);
    }
    if (ts.length !== 13) {
      if (ts.length === 10) {
        return parseInt(ts + '000');
      }
      throw Error(`Timestamp ${ts} in ${key} seems invalid. It should looks like 1550567460000.`);
    }
    return parseInt(ts);
  }
};

const getLogPath = (): string => {
  return process.env.LOGS_DIR_ABSOLUTE_PATH || '/data/darty/offline-sales';
};

export type Config = typeof config;

export const config = {
  documentImportId: 153,
  sftp: {
    host: env(required)('SFTP_HOST'),
    username: env(required)('SFTP_USERNAME'),
    privateKey: fs.readFileSync(env(required)('SFTP_HOST')),
  },
  api: {
    datamartId: env(defaultValue('1139'), int)('DATAMART_ID'),
    compartmentId: env(defaultValue('1184'), int)('COMPARTMENT_ID'),
    offlineChannelId: env(defaultValue('2833'), int)('OFFLINE_CHANNEL_ID'),
    onlineChannelId: env(defaultValue('2844'), int)('ONLINE_CHANNEL_ID'),
    micsApiToken: env(required)('MICS_API_TOKEN'),
  },
  file: {
    product: env(defaultValue(getFileName('tinyclues_product')))('FILE_PRODUCT'),
    orders: env(defaultValue(getFileName('tinyclues_order')))('FILE_ORDER'),
    orderDetails: env(defaultValue(getFileName('tinyclues_order_details')))('FILE_ORDER_DETAILS'),
  },
  log: {
    level: env(defaultValue('info'))('LOG_LEVEL'),
    resultsPath: getLogPath() + '/logs',
    downloadsPath: getLogPath() + '/files',
    consolePath: getLogPath() + '/console',
    printStreamProgressionIntervalMs: env(defaultValue('60000'))('PRINT_STREAM_PROGRESSION_INTERVAL_MS'),
  },

  maxRetry: env(defaultValue('5'), int)(MAX_RETRY),
  maxConcurrents: env(defaultValue('200'), int)(MAX_SOCKETS),

  isProd: env()('NODE_ENV') === 'production',

  skipProducts: env(bool)('SKIP_PRODUCTS'),
  skipOrderDetails: env(bool)('SKIP_ORDER_DETAILS'),
  skipOrders: env(bool)('SKIP_ORDERS'),
  skipOrdersOnline: env(bool)('SKIP_ORDERS_ONLINE'),
  skipOrdersOlderThanTs: parseTimestamp('SKIP_ORDERS_OLDER_THAN_TS'),

  fromLine: env(defaultValue('1'), int)('FROM_LINE'),

  truncateOrderDetails: env(bool)('TRUNCATE_ORDER_DETAILS'),
};


