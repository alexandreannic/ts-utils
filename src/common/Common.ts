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

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : DeepPartial<T[P]>
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
