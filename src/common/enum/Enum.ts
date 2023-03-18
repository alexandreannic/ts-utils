type Entries<T> = NonNullable<{
  [K in keyof T]: NonNullable<[K, T[K]]>
}>[keyof T][];

// export type _Enum<T = any> = {
//   [id: string]: T | string
//   [nu: number]: string
// }

export type _Enum<T = any> = Record<string | number, T>

export class Enum {

  static readonly entries = <K extends string | number, V>(t: Record<K, V> | Partial<Record<K, V>>): Entries<Record<K, V>> => {
  // static readonly entries = <K extends string | number, V>(t: Record<K, V> | Partial<Record<K, V>>): [K, V][] => {
    return Object.entries(t) as any
  }

  static readonly keys = <T extends _Enum>(t: T): (keyof T)[] => {
    return Object.keys(t)
  }

  static readonly values = <T extends _Enum>(t: T): (T[keyof T])[] => {
    return Object.values(t)
  }

  static readonly getKeyByValue = <T extends _Enum>(t: T, value: string/*T[keyof T]*/): keyof T  | undefined => {
    return Enum.entries(t).find(([k, v]) => v === value)?.[0]
  }
}
