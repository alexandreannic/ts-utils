export interface LogObjectConfig {
  prefix?: string,
  log?: (message?: any, ...optionalParams: any[]) => void,
  indent?: string
  truncate?: number
}

export const logObject = (o: {[key: string]: any}, {prefix = '- ', indent = '  ', log = console.log, truncate}: LogObjectConfig = {}): void => {
  Object.keys(o).forEach(k => {
    if (typeof o[k] === 'object') {
      log(`${prefix}${k}`);
      logObject(o[k], {prefix: `${indent}${prefix}`, log, indent, truncate});
    } else {
      log(`${prefix}${k}: ${parseValue(o[k], truncate)}`);
    }
  });
};

const parseValue = (value: string, truncate?: number): string => {
  try {
    const isValueTooLong = truncate && value.length > truncate;
    return isValueTooLong ? (value.substring(0, truncate) + '...') : value;
  } catch (e) {
    return value;
  }
};

