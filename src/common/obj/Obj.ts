import {OrderByNumber, OrderByString, Seq, seq} from '../seq/Seq'

export type Key = string | number
export type ObjType<T = any> = Record<Key, T>
export type KeyOf<T> = Extract<keyof T, string>
export type Pair<T extends ObjType> = [KeyOf<T>, T[KeyOf<T>]]

export class Obj<T extends ObjType> {
  constructor(private o: T) {
  }

  // ===== helpers =====
  static readonly hasValue = (obj: Record<string, any>): boolean => {
    for (const key in obj) {
      if (obj[key] != null) return true
    }
    return false
  }
  readonly hasValue = () => Obj.hasValue(this.o)

  // ===== entries / keys / values =====
  static readonly entries = <U extends ObjType>(t: U): Pair<U>[] => {
    return Object.entries(t).map(([k, v]) => [k as KeyOf<U>, v as U[KeyOf<U>]]) as Pair<U>[]
  }
  readonly entries = (): Pair<T>[] => Obj.entries(this.o)

  static readonly keys = <U extends ObjType>(t: U): KeyOf<U>[] => {
    return Object.keys(t) as KeyOf<U>[]
  }
  readonly keys = (): KeyOf<T>[] => Obj.keys(this.o)

  static readonly values = <U extends ObjType>(t: U): U[KeyOf<U>][] => {
    return Object.values(t) as U[KeyOf<U>][]
  }
  readonly values = (): T[KeyOf<T>][] => Obj.values(this.o)

  // ===== toArray (custom keyName/valueName) =====
  static readonly toArray = <
    U extends ObjType,
    KName extends string = 'name',
    VName extends string = 'value'
  >(
    obj: U,
    {
      keyName = 'name' as KName,
      valueName = 'value' as VName,
    }: {
      keyName?: KName
      valueName?: VName
    } = {},
  ): ({ [KK in KName]: KeyOf<U> } & { [VV in VName]: U[KeyOf<U>] })[] => {
    return Object.entries(obj).map(([k, v]) => ({[keyName]: k, [valueName]: v})) as any
  }
  readonly toArray = <KName extends string = 'name', VName extends string = 'value'>(
    params: {keyName?: KName; valueName?: VName} = {},
  ) => Obj.toArray<T, KName, VName>(this.o, params as any)

  // ===== getKeyByValue =====
  static readonly getKeyByValue = <U extends ObjType>(t: U, value: U[KeyOf<U>]): KeyOf<U> | undefined => {
    return Obj.entries(t).find(([k, v]) => v === value)?.[0]
  }

  // ===== map =====
  static readonly map = <U extends ObjType, NK extends Key, NV>(
    o: U,
    applyFn: (k: KeyOf<U>, v: U[KeyOf<U>], index: number) => [NK, NV],
  ): Record<NK, NV> => {
    const res: Record<NK, NV> = {} as Record<NK, NV>
    Obj.entries(o).forEach(([k, v], i) => {
      const [newK, newV] = applyFn(k, v, i)
      res[newK] = newV
    })
    return res
  }
  readonly map = <NK extends Key, NV>(fn: (k: KeyOf<T>, v: T[KeyOf<T>], index: number) => [NK, NV]) => {
    return new Obj(Obj.map(this.o, fn))
  }

  // ===== mapValues =====
  static readonly mapValues = <U extends ObjType, NV>(
    o: U,
    fn: (v: U[KeyOf<U>], k: KeyOf<U>, index: number) => NV,
  ): Record<KeyOf<U>, NV> => {
    const res: Partial<Record<KeyOf<U>, NV>> = {}
    Obj.entries(o).forEach(([k, v], i) => {
      res[k] = fn(v, k, i)
    })
    return res as Record<KeyOf<U>, NV>
  }
  readonly mapValues = <NV>(fn: (v: T[KeyOf<T>], k: KeyOf<T>, index: number) => NV) => {
    return new Obj(Obj.mapValues(this.o, fn) as any)
  }

  // ===== mapKeys =====
  static readonly mapKeys = <U extends ObjType, NK extends Key>(
    o: U,
    fn: (k: KeyOf<U>, v: U[KeyOf<U>], index: number) => NK,
  ): Record<NK, U[KeyOf<U>]> => {
    const res: Record<NK, U[KeyOf<U>]> = {} as any
    Obj.entries(o).forEach(([k, v], i) => {
      const newK = fn(k, v, i)
      res[newK] = v
    })
    return res
  }
  readonly mapKeys = <NK extends Key>(fn: (k: KeyOf<T>, v: T[KeyOf<T>], index: number) => NK) => {
    return new Obj(Obj.mapKeys(this.o, (k, v, i) => fn(k, v, i)))
  }

  // ===== filter =====
  static readonly filter = <U extends ObjType>(
    o: U,
    fn: (k: KeyOf<U>, v: U[KeyOf<U>], index: number) => boolean,
  ): Partial<Record<KeyOf<U>, U[KeyOf<U>]>> => {
    const res: Partial<Record<KeyOf<U>, U[KeyOf<U>]>> = {}
    Obj.entries(o).forEach(([k, v], i) => {
      if (fn(k, v, i)) res[k] = v
    })
    return res
  }
  readonly filter = (fn: (k: KeyOf<T>, v: T[KeyOf<T>], index: number) => boolean) => {
    return new Obj<Partial<T>>(Obj.filter(this.o, fn) as any)
  }

  // ===== filterValue =====
  static readonly filterValue = <U extends ObjType>(
    o: U,
    fn: (v: U[KeyOf<U>]) => boolean,
  ): Partial<Record<KeyOf<U>, U[KeyOf<U>]>> => {
    const res: Partial<Record<KeyOf<U>, U[KeyOf<U>]>> = {}
    Obj.entries(o).forEach(([k, v]) => {
      if (fn(v)) res[k] = v
    })
    return res
  }

  // ===== sort (by pairs) =====
  static readonly sort = <U extends ObjType>(
    o: U,
    predicate: (a: Pair<U>, b: Pair<U>) => number,
  ): Record<KeyOf<U>, U[KeyOf<U>]> => {
    const arr = Obj.entries(o).slice().sort(predicate)
    const res: Partial<Record<KeyOf<U>, U[KeyOf<U>]>> = {}
    arr.forEach(([k, v]) => {
      res[k] = v
    })
    return res as Record<KeyOf<U>, U[KeyOf<U>]>
  }
  readonly sort = (predicate: (a: Pair<T>, b: Pair<T>) => number) => {
    return new Obj(Obj.sort(this.o, predicate))
  }

  // ===== sortBy generic impl =====
  private static readonly sortBy = <U extends ObjType, S>(
    o: U,
    fn: (v: U[KeyOf<U>], k: KeyOf<U>) => S | undefined,
    compare: (a?: S, b?: S) => number,
  ): Record<KeyOf<U>, U[KeyOf<U>]> => {
    const entries = Obj.entries(o).map(([k, v]) => ({
      k,
      v,
      sortKey: fn(v, k),
    }))
    entries.sort((a, b) => compare(a.sortKey, b.sortKey))
    const res: Partial<Record<KeyOf<U>, U[KeyOf<U>]>> = {}
    entries.forEach(e => {
      res[e.k] = e.v
    })
    return res as Record<KeyOf<U>, U[KeyOf<U>]>
  }

  static readonly sortByString = <U extends ObjType>(
    o: U,
    fn: (v: U[KeyOf<U>], k: KeyOf<U>) => string | undefined,
    orderBy: OrderByString = 'a-z',
  ) => Obj.sortBy<U, string>(o, fn, Seq.getSortByStringFn(orderBy))
  readonly sortByString = (fn: (v: T[KeyOf<T>], k: KeyOf<T>) => string | undefined, orderBy?: OrderByString) => {
    return new Obj(Obj.sortByString(this.o, fn, orderBy))
  }

  static readonly sortByNumber = <U extends ObjType>(
    o: U,
    fn: (v: U[KeyOf<U>], k: KeyOf<U>) => number | undefined,
    orderBy: OrderByNumber = '0-9',
  ) => Obj.sortBy<U, number>(o, fn, Seq.getSortByNumberFn(orderBy))
  readonly sortByNumber = (fn: (v: T[KeyOf<T>], k: KeyOf<T>) => number | undefined, orderBy?: OrderByNumber) => {
    return new Obj(Obj.sortByNumber(this.o, fn, orderBy))
  }

  // ===== sortKeys =====
  static readonly sortKeys = <U extends ObjType>(o: U, predicate: (a: KeyOf<U>, b: KeyOf<U>) => number) => {
    return Obj.sort<U>(o, ([a], [b]) => predicate(a, b))
  }
  readonly sortKeys = (predicate: (a: KeyOf<T>, b: KeyOf<T>) => number) => {
    return new Obj(Obj.sortKeys(this.o, predicate))
  }

  // ===== sortManual =====
  static readonly sortManual = <U extends ObjType>(o: U, order: KeyOf<U>[]) => {
    return Obj.sort<U>(o, ([aK], [bK]) => order.indexOf(aK) - order.indexOf(bK))
  }
  readonly sortManual = (order: KeyOf<T>[]) => {
    return new Obj(Obj.sortManual(this.o, order))
  }

  // ===== take =====
  static readonly take = <U extends ObjType>(o: U, n?: number): Partial<Record<KeyOf<U>, U[KeyOf<U>]>> => {
    if (n == null) return o
    const pairs = Obj.entries(o).slice(0, n)
    // using seq as in original (assumes seq([...]).reduceObject exists)
    // If Seq.reduceObject returns a Record, cast accordingly
    return seq(pairs).reduceObject(_ => _) as Partial<Record<KeyOf<U>, U[KeyOf<U>]>> // keep behavior
  }
  readonly take = (n?: number) => new Obj(Obj.take(this.o, n) as any)

  // ===== get =====
  readonly get = () => this.o
}
