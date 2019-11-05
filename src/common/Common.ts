/**
 * Functional for loop.
 * mapFor(n, callback)
 * is equivalent to
 * [...new Array(n)].map((_, i) => callback(i))
 * with better performance
 */
export const mapFor = <T>(n: number, callback: (i: number) => T): T[] => {
  const result: T[] = new Array(n);
  for (let i = 0; i < n; i++) {
    result[i] = callback(i);
  }
  return result;
};

type Filter<T> = (value: T, index: number, array: T[]) => boolean

/**
 * The goal is to be able to add filters conditionally using this pattern
 * multipleFilters(
 *  condition && callback,
 *  condition2 && callback2,
 *  ...
 * )(list)
 */
export const multipleFilters = <T>(...filters: Array<boolean | Filter<T>>) => (list: T[]) => {
  if (filters.length === 0) return list;
  return list.filter((t: T, index: number, array: T[]) => filters
    .filter(filter => filter instanceof Function)
    // @ts-ignore
    .every(filter => filter(t, index, array))
  );
};

export const toPercent = (value: number): string => value.toFixed(2) + '%';

/**
 * Why this function that convert another method to a promise ? Because promises are cools !
 */
export const toPromise = <T>(call: () => T): Promise<T> => new Promise((resolve, reject) => {
  try {
    resolve(call());
  } catch (e) {
    reject(e);
  }
});

/**
 * Principally designed to be used in a promise chain and automatically cast the function's result from Array<T | undefined> to T.
 * E.G.
 * const fetchingData: () => Promise<Array<T | undefined>> = ...
 * const data: T[] = await fetchingData().then(filterUndefined);
 */
export const filterUndefined = <T>(data: Array<T | undefined>): T[] => data.filter(_ => _ !== undefined) as T[];

/**
 * Principally designed to be used in a promise chain and automatically cast the function's result from T | undefined to T.
 * E.G.
 * const fetchingData: () => Promise<T | undefined> = ...
 * const data: T = await fetchingData().then(throwIfUndefined);
 */
export const throwIfUndefined = (message: string = 'Unexpected undefined value.') => <T>(data?: T): T => {
  if (data === undefined) throw new Error(message);
  return data;
};

/**
 * Principally designed to be used in a promise chain and automatically cast the function's result from T | undefined to T.
 * E.G.
 * const fetchUser: () => Promise<User> = ...
 * const frenchUser = await fetchUsers().then(throwIf(user => user.nationality !== 'fr', 'User should be french'));
 */
export const throwIf = <T>(condition: (t: T) => boolean, message: string) => (data: T): T => {
  if (condition(data)) throw new Error(message);
  return data;
};

export const queryStringToObject = (qs: string): {[key: string]: string} => qs
  .replace(/^\??/, '')
  .split('&')
  .map(_ => _.split('='))
  .filter(_ => _[0] !== '')
  .reduce((acc, [key, value]) => ({...acc, [key]: value}), {});

export const objectToQueryString = (obj: {[key: string]: string | number | boolean}): string => '?' + Object.keys(obj)
  .filter(k => obj[k] !== undefined)
  .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`)
  .join('&');
