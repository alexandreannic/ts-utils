type Log = typeof console.log

interface Logger {
  error: Log
  warn: Log
  info: Log
  http: Log
  verbose: Log
  debug: Log
  silly: Log
}

const winstonLogMethods: Array<keyof Logger> = [
  'error',
  'warn',
  'info',
  'http',
  'verbose',
  'debug',
  'silly',
];

export const prefixLog = (prefixes: string) => (logger: Log) => (...args: any[]) => {
  const [firstArg, ...othersArgs] = args;
  return logger(prefixes + ' ' + firstArg, ...othersArgs);
};

export const prefixLogger = (prefixes: string) => (logger: Logger, prefixedMethods: string[] = winstonLogMethods) => {
  prefixedMethods.forEach((m) => {
    // @ts-ignore
    logger[m] = prefixLog(prefixes)(logger[m]);
  });
  return logger;
};

