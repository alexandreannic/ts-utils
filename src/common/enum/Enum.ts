type Entries<T> = NonNullable<{
  [K in keyof T]: NonNullable<[K, T[K]]>
}>[keyof T][];

// export type _Enum<T = any> = {
//   [id: string]: T | string
//   [nu: number]: string
// }

type Key = string | number

export type _Enum<T = any> = Record<Key, T>

export class Enum<T extends _Enum> {

  static readonly entries = <K extends Key, V>(t: Record<K, V> | Partial<Record<K, V>>): Entries<Record<K, V>> => {
    // static readonly entries = <K extends Key, V>(t: Record<K, V> | Partial<Record<K, V>>): [K, V][] => {
    return Object.entries(t) as any
  }

  static readonly keys = <T extends _Enum>(t: T): (keyof T)[] => {
    return Object.keys(t)
  }

  static readonly values = <T extends _Enum>(t: T): (T[keyof T])[] => {
    return Object.values(t)
  }

  static readonly getKeyByValue = <T extends _Enum>(t: T, value: string/*T[keyof T]*/): keyof T | undefined => {
    return Enum.entries(t).find(([k, v]) => v === value)?.[0]
  }

  /**@deprecated use map instead*/
  static readonly transform = <K extends Key, V extends any, NK extends Key, NV>(o: Record<K, V>, map: (k: K, v: V, index: number) => [NK, NV]): Record<NK, NV> => {
    const res: Record<NK, NV> = {} as any
    Enum.entries(o).forEach(([k, v], i) => {
      const [newK, newV] = map(k, v, i)
      res[newK] = newV
    })
    return res
  }

  static readonly map = Enum.transform

  static readonly mapValues = <K extends Key, V extends any, NV>(o: Record<K, V>, fn: (v: V, k: K, index: number) => NV): Record<K, NV> => {
    const res: Record<K, NV> = {} as any
    Enum.entries(o).forEach(([k, v], i) => {
      res[k] = fn(v, k, i)
    })
    return res
  }

  static readonly mapKeys = <K extends Key, V extends any, NK extends Key>(o: Record<K, V>, fn: (k: K, v: V, index: number) => NK): Record<NK, V> => {
    const res: Record<NK, V> = {} as any
    Enum.entries(o).forEach(([k, v], i) => {
      const newK = fn(k, v, i)
      res[newK] = v
    })
    return res
  }

  static readonly filter = <K extends Key, V extends any>(o: Record<K, V>, fn: (k: K, v: V, index: number) => boolean): Partial<Record<K, V>> => {
    const res: Partial<Record<K, V>> = {} as any
    Enum.entries(o).forEach(([k, v], i) => {
      if (fn(k, v, i)) res[k] = v
    })
    return res
  }

  constructor(private o: T) {
  }

  /**@deprecated use map instead*/
  readonly transform = <NK extends Key, NV>(fn: (k: keyof T, v: T[keyof T], index: number) => [NK, NV]) => {
    return new Enum(Enum.transform(this.o, fn))
  }

  readonly map = this.transform

  readonly mapValues = <NV>(fn: (k: keyof T, v: T[keyof T], index: number) => NV) => {
    return new Enum(Enum.mapValues(this.o, fn))
  }

  readonly mapKeys = <NK extends Key>(fn: (k: keyof T, v: T[keyof T], index: number) => NK) => {
    return new Enum(Enum.mapKeys(this.o, (k, v, i) => fn(k, v, i)))
  }

  readonly filter = <NK extends Key, NV>(fn: (k: keyof T, v: T[keyof T], index: number) => boolean) => {
    return new Enum<Partial<T>>(Enum.filter(this.o, fn) as any)
  }

  readonly sort = (predicate: (a: [keyof T, T[keyof T]], b: [keyof T, T[keyof T]]) => number) => {
    const res: any = {}
    Enum.entries(this.o).sort(predicate).forEach(([k, v]) => {
      res[k] = v
    })
    return new Enum(res as T)
  }

  // @ts-ignore
  readonly entries = () => Enum.entries<keyof T, T[keyof T]>(this.o)

  readonly keys = () => Enum.keys<T>(this.o)

  readonly values = () => Enum.values<T>(this.o)

  readonly get = () => this.o
}
