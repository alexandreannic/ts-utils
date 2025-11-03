import {OrderByNumber, OrderByString, Seq, seq} from '../seq/Seq'

export type KeyOf<T> = Extract<keyof T, string>

type Entries<T> = NonNullable<{
  [K in KeyOf<T>]: NonNullable<[K, T[K]]>
}>[KeyOf<T>][]

// export type _Enum<T = any> = {
//   [id: string]: T | string
//   [nu: number]: string
// }

type Key = string | number

export type ObjType<T = any> = Record<Key, T>

export class Obj<T extends ObjType> {
  static readonly toArray = <T extends ObjType, K extends string = 'name', V extends string = 'value'>(
    obj: T,
    {
      keyName = 'name' as K,
      valueName = 'value' as V,
    }: {
      keyName?: K
      valueName?: V
    } = {},
  ): ({ [KK in K]: KeyOf<T> } & { [VV in V]: T[KeyOf<T>] })[] => {
    return Object.entries(obj).map(([k, v]) => ({[keyName]: k, [valueName]: v})) as any
  }

  static readonly hasValue = (obj: Record<string, any>): boolean => {
    for (const key in obj) {
      if (obj[key] != null) return true
    }
    return false
  }

  static readonly entries = <K extends Key, V>(t: Record<K, V> | Partial<Record<K, V>>): Entries<Record<K, V>> => {
    // static readonly entries = <K extends Key, V>(t: Record<K, V> | Partial<Record<K, V>>): [K, V][] => {
    return Object.entries(t) as any
  }

  static readonly keys = <T extends ObjType>(t: T): KeyOf<T>[] => {
    return Object.keys(t) as any
  }

  static readonly values = <T extends ObjType>(t: T): T[keyof T][] => {
    return Object.values(t)
  }

  static readonly getKeyByValue = <T extends ObjType>(t: T, value: string /*T[keyof T]*/): keyof T | undefined => {
    return Obj.entries(t).find(([k, v]) => v === value)?.[0]
  }

  /**@deprecated use map instead*/
  static readonly transform = <K extends Key, V extends any, NK extends Key, NV>(
    o: Record<K, V>,
    applyFn: (k: K, v: V, index: number) => [NK, NV],
  ): Record<NK, NV> => {
    const res: Record<NK, NV> = {} as any
    Obj.entries(o).forEach(([k, v], i) => {
      const [newK, newV] = applyFn(k, v, i)
      res[newK] = newV
    })
    return res
  }

  static readonly map = Obj.transform

  static readonly mapValues = <K extends Key, V extends any, NV>(
    o: Record<K, V>,
    fn: (v: V, k: K, index: number) => NV,
  ): Record<K, NV> => {
    const res: Record<K, NV> = {} as any
    Obj.entries(o).forEach(([k, v], i) => {
      res[k] = fn(v, k, i)
    })
    return res
  }

  static readonly mapKeys = <K extends Key, V extends any, NK extends Key>(
    o: Record<K, V>,
    fn: (k: K, v: V, index: number) => NK,
  ): Record<NK, V> => {
    const res: Record<NK, V> = {} as any
    Obj.entries(o).forEach(([k, v], i) => {
      const newK = fn(k, v, i)
      res[newK] = v
    })
    return res
  }

  static readonly filter = <K extends Key, V extends any>(
    o: Record<K, V>,
    fn: (k: K, v: V, index: number) => boolean,
  ): Partial<Record<K, V>> => {
    const res: Partial<Record<K, V>> = {} as any
    Obj.entries(o).forEach(([k, v], i) => {
      if (fn(k, v, i)) res[k] = v
    })
    return res
  }

  static readonly filterValue = <K extends Key, V extends any>(
    o: Record<K, V>,
    fn: (v: V) => boolean,
  ): Record<K, V> => {
    const res: Record<K, V> = {} as any
    Obj.entries(o).forEach(([k, v], i) => {
      if (fn(v)) res[k] = v
    })
    return res
  }

  static readonly sort = <K extends Key, V extends any>(
    o: Record<K, V>,
    predicate: (a: [K, V], b: [K, V]) => number,
  ) => {
    return Obj.entries(o)
      .sort(predicate)
      .reduce((res, [k, v]) => {
        res[k as K] = v
        return res
      }, {} as Record<K, V>)
  }

  private static readonly sortBy =
    <K extends Key, V, T>(
      o: Record<K, V>,
      fn: (v: V, k: K) => T | undefined,
      compare: (a?: T, b?: T) => number,
    ): Record<K, V> => {
      const entries = Object.entries(o).map(([k, v]) => ({
        k: k as K,
        v: v as V,
        sortKey: fn(v as V, k as K),
      }))
      entries.sort((a, b) => compare(a.sortKey, b.sortKey))
      return entries.reduce((res, e) => {
        res[e.k] = e.v
        return res
      }, {} as Record<K, V>)
    }

  static readonly sortByString = <K extends Key, V>(
    o: Record<K, V>,
    fn: (v: V, k: K) => string | undefined,
    orderBy: OrderByString = 'a-z',
  ) => this.sortBy(o, fn, Seq.getSortByStringFn(orderBy))

  static readonly sortByNumber = <K extends Key, V>(
    o: Record<K, V>,
    fn: (v: V, k: K) => number | undefined,
    orderBy: OrderByNumber = '0-9',
  ) => this.sortBy(o, fn, Seq.getSortByNumberFn(orderBy))

  static readonly sortKeys = <K extends Key, V extends any>(
    o: Record<K, V>,
    predicate: (a: K, b: K) => number,
  ) => {
    const res: any = {}
    Obj.entries(o)
      .sort(([a], [b]) => predicate(a, b))
      .forEach(([k, v]) => {
        res[k] = v
      })
    return res as Record<K, V>
  }

  static readonly sortManual = <K extends Key, V extends any>(o: Record<K, V>, order: K[]) => {
    return Obj.sort(o, ([aK, aV], [bK, bV]) => {
      return order.indexOf(aK) - order.indexOf(bK)
    })
  }

  static readonly take = <K extends Key, V extends any>(o: Record<K, V>, n?: number) => {
    if (n) return seq(Obj.entries(o).splice(0, n)).reduceObject(_ => _)
    return o
  }

  constructor(private o: T) {
  }

  readonly take = (n?: number) => new Obj(Obj.take(this.o, n))

  /**@deprecated use map instead*/
  readonly transform = <NK extends Key, NV>(fn: (k: keyof T, v: T[keyof T], index: number) => [NK, NV]) => {
    return new Obj(Obj.transform(this.o, fn))
  }

  readonly map = this.transform

  readonly hasValue = () => {
    return Obj.hasValue(this.o)
  }

  readonly mapValues = <NV>(fn: (v: T[keyof T], k: keyof T, index: number) => NV) => {
    return new Obj(Obj.mapValues(this.o, fn))
  }

  readonly mapKeys = <NK extends Key>(fn: (k: keyof T, v: T[keyof T], index: number) => NK) => {
    return new Obj(Obj.mapKeys(this.o, (k, v, i) => fn(k, v, i)))
  }

  readonly filter = <NK extends Key, NV>(fn: (k: keyof T, v: T[keyof T], index: number) => boolean) => {
    return new Obj<Partial<T>>(Obj.filter(this.o, fn) as any)
  }

  readonly sort = (predicate: (a: [keyof T, T[keyof T]], b: [keyof T, T[keyof T]]) => number) => {
    return new Obj(Obj.sort<KeyOf<T>, T[keyof T]>(this.o, predicate))
  }

  readonly sortByNumber = (
    fn: (v: T[ keyof T], k: keyof T) => number | undefined,
    orderBy?: OrderByNumber,
  ) => {
    return new Obj(Obj.sortByNumber<KeyOf<T>, T[keyof T]>(this.o, fn, orderBy))
  }

  readonly sortByString = (
    fn: (v: T[ keyof T], k: keyof T) => string | undefined,
    orderBy?: OrderByString,
  ) => {
    return new Obj(Obj.sortByString<KeyOf<T>, T[keyof T]>(this.o, fn, orderBy))
  }

  readonly sortKeys = (predicate: (a: keyof T, b: keyof T) => number) => {
    return new Obj(Obj.sortKeys<KeyOf<T>, T[keyof T]>(this.o, predicate))
  }

  readonly sortManual = (order: KeyOf<T>[]) => {
    return new Obj(Obj.sortManual(this.o, order))
  }

  // @ts-ignore
  readonly entries = () => Obj.entries<keyof T, T[keyof T]>(this.o)

  readonly keys = () => Obj.keys<T>(this.o)

  readonly values = () => Obj.values<T>(this.o)

  readonly toArray = <K extends string = 'name', V extends string = 'value'>(
    params: {
      keyName?: K
      valueName?: V
    } = {},
  ) => Obj.toArray<T, K, V>(this.o, params as any)

  readonly get = () => this.o
}
