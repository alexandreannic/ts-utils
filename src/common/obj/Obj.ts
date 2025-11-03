import {OrderByNumber, OrderByString, Seq, seq} from '../seq/Seq'

export type Key = string
export type KeyOf<T> = Extract<keyof T, string>

export class Obj<K extends Key, V extends any> {
  constructor(private o: Record<K, V>) {
  }

  static readonly hasValue = (obj: Record<string, any>): boolean => {
    for (const key in obj) {
      if (obj[key] != null) return true
    }
    return false
  }
  readonly hasValue = () => Obj.hasValue(this.o)

  // ===== entries =====
  static readonly entries = <K extends Key, V extends any>(t: Record<K, V>): [K, V][] => {
    return Object.entries(t).map(([k, v]) => [k as K, v as V]) as [K, V][]
  }
  readonly entries = (): [K, V][] => Obj.entries(this.o)

  // ===== keys =====
  static readonly keys = <K extends Key, V extends any>(t: Record<K, V>): K[] => {
    return Object.keys(t) as K[]
  }
  readonly keys = (): K[] => Obj.keys(this.o)

  // ===== values =====
  static readonly values = <K extends Key, V extends any>(t: Record<K, V>): V[] => {
    return Object.values(t) as V[]
  }
  readonly values = (): Record<K, V>[K][] => Obj.values(this.o)

  // ===== toArray (custom keyName/valueName) =====
  static readonly toArray = <
    K extends Key,
    V extends any,
    KName extends string = 'name',
    VName extends string = 'value',
  >(
    obj: Record<K, V>,
    {
      keyName = 'name' as KName,
      valueName = 'value' as VName,
    }: {
      keyName?: KName
      valueName?: VName
    } = {},
  ): ({ [KK in KName]: K } & { [VV in VName]: V })[] => {
    return Object.entries(obj).map(([k, v]) => ({[keyName]: k, [valueName]: v})) as any
  }

  readonly toArray = <KName extends string = 'name', VName extends string = 'value'>(
    params: {keyName?: KName; valueName?: VName} = {},
  ) => Obj.toArray<K, V, KName, VName>(this.o, params as any)

  // ===== getKeyByValue =====
  static readonly getKeyByValue = <K extends Key, V extends any>(t: Record<K, V>, value: V): K | undefined => {
    return Obj.entries(t).find(([k, v]) => v === value)?.[0]
  }

  // ===== map =====
  static readonly map = <K extends Key, V extends any, NK extends Key, NV>(
    o: Record<K, V>,
    applyFn: (k: K, v: V, index: number) => [NK, NV],
  ): Record<NK, NV> => {
    const res: Record<NK, NV> = {} as Record<NK, NV>
    Obj.entries(o).forEach(([k, v], i) => {
      const [newK, newV] = applyFn(k, v, i)
      res[newK] = newV
    })
    return res
  }
  readonly map = <NK extends Key, NV>(fn: (k: K, v: Record<K, V>[K], index: number) => [NK, NV]) => {
    return new Obj(Obj.map(this.o, fn))
  }

  // ===== mapValues =====
  static readonly mapValues = <K extends Key, V extends any, NV>(
    o: Record<K, V>,
    fn: (v: V, k: K, index: number) => NV,
  ): Record<K, NV> => {
    const res: Partial<Record<K, NV>> = {}
    Obj.entries(o).forEach(([k, v], i) => {
      res[k] = fn(v, k, i)
    })
    return res as Record<K, NV>
  }
  readonly mapValues = <NV>(fn: (v: Record<K, V>[K], k: K, index: number) => NV) => {
    return new Obj<K, NV>(Obj.mapValues(this.o, fn) as any)
  }

  // ===== mapKeys =====
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
  readonly mapKeys = <NK extends Key>(fn: (k: K, v: Record<K, V>[K], index: number) => NK) => {
    return new Obj(Obj.mapKeys(this.o, (k, v, i) => fn(k, v, i)))
  }

  // ===== filter =====
  static readonly filter = <K extends Key, V extends any>(
    o: Record<K, V>,
    fn: (k: K, v: V, index: number) => boolean,
  ): Partial<Record<K, V>> => {
    const res: Partial<Record<K, V>> = {}
    Obj.entries(o).forEach(([k, v], i) => {
      if (fn(k, v, i)) res[k] = v
    })
    return res
  }
  readonly filter = (fn: (k: K, v: Record<K, V>[K], index: number) => boolean) => {
    return new Obj<K, V>(Obj.filter(this.o, fn) as any)
  }

  // ===== filterValue =====
  static readonly filterValue = <K extends Key, V extends any>(
    o: Record<K, V>,
    fn: (v: V) => boolean,
  ): Partial<Record<K, V>> => {
    const res: Partial<Record<K, V>> = {}
    Obj.entries(o).forEach(([k, v]) => {
      if (fn(v)) res[k] = v
    })
    return res
  }

  // ===== sort (by pairs) =====
  static readonly sort = <K extends Key, V extends any>(
    o: Record<K, V>,
    predicate: (a: [K, V], b: [K, V]) => number,
  ): Record<K, V> => {
    const arr = Obj.entries(o).slice().sort(predicate)
    const res = {} as Record<K, V>
    arr.forEach(([k, v]) => {
      res[k] = v
    })
    return res
  }
  readonly sort = (predicate: (a: [K, V], b: [K, V]) => number) => {
    return new Obj(Obj.sort(this.o, predicate))
  }

  // ===== sortBy generic impl =====
  private static readonly sortBy = <K extends Key, V extends any, S>(
    o: Record<K, V>,
    fn: (v: V, k: K) => S | undefined,
    compare: (a?: S, b?: S) => number,
  ): Record<K, V> => {
    const entries = Obj.entries(o).map(([k, v]) => ({
      k,
      v,
      sortKey: fn(v, k),
    }))
    entries.sort((a, b) => compare(a.sortKey, b.sortKey))
    const res = {} as Record<K, V>
    entries.forEach(e => {
      res[e.k] = e.v
    })
    return res
  }

  // ===== sortByString =====
  static readonly sortByString = <K extends Key, V extends any>(
    o: Record<K, V>,
    fn: (v: V, k: K) => string | undefined,
    orderBy: OrderByString = 'a-z',
  ): Record<K, V> => {
    return Obj.sortBy(o, fn, Seq.getSortByStringFn(orderBy))
  }

  readonly sortByString = (
    fn: (v: Record<K, V>[K], k: K) => string | undefined,
    orderBy?: OrderByString,
  ): Obj<K, V> => {
    return new Obj(Obj.sortByString(this.o, fn, orderBy))
  }

  // ===== sortByNumber =====
  static readonly sortByNumber = <K extends Key, V extends any>(
    o: Record<K, V>,
    fn: (v: V, k: K) => number | undefined,
    orderBy: OrderByNumber = '0-9',
  ): Record<K, V> => {
    return Obj.sortBy(o, fn, Seq.getSortByNumberFn(orderBy))
  }

  readonly sortByNumber = (fn: (v: V, k: K) => number | undefined, orderBy?: OrderByNumber): Obj<K, V> => {
    return new Obj<K, V>(Obj.sortByNumber(this.o, fn, orderBy))
  }

  // ===== sortKeys =====
  static readonly sortKeys = <K extends Key, V extends any>(
    o: Record<K, V>,
    predicate: (a: K, b: K) => number,
  ): Record<K, V> => {
    return Obj.sort(o, ([a], [b]) => predicate(a, b))
  }
  readonly sortKeys = (predicate: (a: K, b: K) => number): Obj<K, V> => {
    return new Obj(Obj.sortKeys(this.o, predicate))
  }

  // ===== sortManual =====
  static readonly sortManual = <K extends Key, V extends any>(o: Record<K, V>, order?: K[]): Record<K, V> => {
    if (!order) return o
    return Obj.sort(o, ([aK], [bK]) => order.indexOf(aK) - order.indexOf(bK))
  }
  readonly sortManual = (order?: K[]): Obj<K, V> => {
    return new Obj<K, V>(Obj.sortManual(this.o, order))
  }

  // ===== take =====
  static readonly take = <K extends Key, V extends any>(o: Record<K, V>, n?: number): Partial<Record<K, V>> => {
    if (n == null) return o
    const pairs = Obj.entries(o).slice(0, n)
    // using seq as in original (assumes seq([...]).reduceObject exists)
    // If Seq.reduceObject returns a Record, cast accordingly
    return seq(pairs).reduceObject(_ => _) as Partial<Record<K, V>> // keep behavior
  }
  readonly take = (n?: number) => new Obj<K, V>(Obj.take(this.o, n) as any)

  // ===== get =====
  readonly get = () => this.o
}
