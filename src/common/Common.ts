/**
 * Functional for loop
 */
export const mapFor = <T>(n: number, callback: (i: number) => T): T[] => {
  const result: T[] = [];
  for (let i = 0; i < n; i++) {
    result.push(callback(i));
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

type Filter<T> = (t: T) => boolean

export const multipleFilters = <T>(...filters: Array<boolean | Filter<T>>) => (list: T[]) => {
  if (filters.length === 0) return list;
  return list.filter(t => filters
    .filter(filter => filter instanceof Function)
    // @ts-ignore
    .every(filter => filter(t))
  );
};
