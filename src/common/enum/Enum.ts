type Entries<T> = NonNullable<{
  [K in keyof T]: NonNullable<[K, T[K]]>
}>[keyof T][];

// export type _Enum<T = any> = {
//   [id: string]: T | string
//   [nu: number]: string
// }

export type _Enum<T = any> = Record<string | number, T>

export class Enum<T extends Record<any, any>> {

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

  static readonly getKeyByValue = <T extends _Enum>(t: T, value: string/*T[keyof T]*/): keyof T | undefined => {
    return Enum.entries(t).find(([k, v]) => v === value)?.[0]
  }

  static readonly transform = <K extends string, V extends any, NK extends string, NV>(o: Record<K, V>, map: (k: K, v: V, index: number) => [NK, NV]): Record<NK, NV> => {
    const res: Record<NK, NV> = {} as any
    Enum.entries(o).forEach(([k, v], i) => {
      const [newK, newV] = map(k, v, i)
      res[newK] = newV
    })
    return res
  }

  static readonly filter = <K extends string, V extends any>(o: Record<K, V>, fn: (k: K, v: V, index: number) => boolean): Partial<Record<K, V>> => {
    const res: Partial<Record<K, V>> = {} as any
    Enum.entries(o).forEach(([k, v], i) => {
      if (fn(k, v, i)) res[k] = v
    })
    return res
  }

  constructor(private o: T) {
  }

  readonly transform = <NK extends string, NV>(fn: (k: keyof T, v: T[keyof T], index: number) => [NK, NV]) => {
    return new Enum(Enum.transform(this.o, fn))
  }

  readonly filter = <NK extends string, NV>(fn: (k: keyof T, v: T[keyof T], index: number) => boolean) => {
    return new Enum<Partial<T>>(Enum.filter(this.o, fn) as any)
  }

  readonly sort = (predicate: (a: [keyof T, T[keyof T]], b: [keyof T, T[keyof T]]) => number) => {
    const res: any = {}
    Enum.entries(this.o).sort(predicate).forEach(([k, v]) => {
      res[k] = v
    })
    return new Enum(res as T)
  }

  readonly entries = () => Enum.entries(this.o)

  readonly get = () => this.o
}
