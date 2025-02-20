import {RequiredProperty} from '../common/CommonType'
import {Obj} from '../obj/Obj'

type PredicateFn<T, R> = (_: T, index: number, array: T[]) => R

interface Filter<T> {
  <S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): Seq<S>
  (predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): Seq<T>
}

type Key = number | string

export class Seq<T> extends Array<T> {
  readonly isSeq = true

  static readonly fromArray = <TT>(_: TT[] = []): Seq<TT> => {
    if ((_ as Seq<TT>).isSeq) return _ as Seq<TT>
    const instance = new Seq<TT>()
    Object.setPrototypeOf(instance, Seq.prototype)
    Object.assign(instance, _)
    return instance
  }

  static distinct<T extends number | string | boolean>(array: T[]): T[] {
    return [...new Set(array)]
  }

  // @ts-ignore
  readonly count: T extends number
    ? (fn?: PredicateFn<T, boolean>) => number
    : (fn: PredicateFn<T, boolean>) => number = (fn = (value, index, array) => value) => {
    let x = 0
    this.forEach((v, i, a) => {
      if (fn(v, i, a)) x += 1
    })
    return x
  }

  filter: Filter<T> = (predicate: any, thisArg: any) => {
    return seq(super.filter(predicate, thisArg))
  }

  map<U>(callback: (value: T, index: number, array: T[]) => U, thisArg?: any): Seq<U> {
    return seq(super.map(callback, thisArg))
  }

  flatMap<U>(callback: (value: T, index: number, array: T[]) => U | ReadonlyArray<U>, thisArg?: any): Seq<U> {
    return seq(super.flatMap(callback, thisArg))
  }

  distinct(fn: (element: T) => any): Seq<T> {
    const uniqueValues: Record<any, boolean> = {}
    return this.get().reduce((result: Seq<T>, currentValue: T) => {
      const key = fn(currentValue)
      if (!uniqueValues[key]) {
        uniqueValues[key] = true
        result.push(currentValue)
      }
      return result
    }, seq([]))
  }

  // @ts-ignore
  sum: T extends number ? (fn?: PredicateFn<T, number>) => number : (fn: PredicateFn<T, number>) => number = (
    fn = (value, index, array) => value,
  ) => {
    let sum = 0
    this.forEach((v, i, arr) => (sum += fn(v, i, arr)))
    return sum
  }

  static contains<T>(arr: T[], item: T) {
    return arr.includes(item)
  }

  contains(item: T): boolean {
    return this.includes(item)
  }

  compact(): T extends undefined | null ? never : Seq<T> {
    return this.filter(_ => _ !== undefined && _ !== null) as any
  }

  compactBy<K extends keyof T>(property: K): Seq<RequiredProperty<T, K>> {
    return this.filter(_ => _[property] !== undefined && _[property] !== null) as any
  }

  sumObjects(): T extends Record<string, number> ? Record<keyof T, number> | undefined : never {
    if (!this.head()) {
      return undefined as any
    }
    const res = {} as Record<string, number>

    Object.keys(this.head()!).forEach(k => {
      res[k] = 0
    })
    this.forEach((item: T) => {
      Object.keys(item as object).forEach(k => {
        res[k] = res[k] + ((item as any)[k] ?? 0)
      })
    })
    return res as any
  }

  /**
   * Simpler and faster API for reduce((acc, curr) => ({...acc, [xxx]: yyy}), {} as BlaBla)
   */
  reduceObject<R extends Record<any, any>>(fn: (_: T, acc: R) => undefined | [keyof R, R[keyof R]]): R {
    const obj: R = {} as R
    this.map(t => {
      const kv = fn(t, obj)
      if (kv) {
        obj[kv[0]] = kv[1]
      }
    })
    return obj
  }

  groupBy<R extends Key>(fn: (_: T, i: number) => R): Record<R, Seq<T>> {
    const res: Record<Key, Seq<T>> = {}
    this.forEach((curr, i) => {
      const key = '' + fn(curr, i)
      if (!res[key]) {
        res[key] = seq()
      }
      res[key].push(curr)
      return res
    }, {})
    return res
  }

  groupByAndApply<K extends Key, R>(fn: (_: T, i: number) => K, apply: (_: Seq<T>) => R): Record<K, R> {
    return new Obj(this.groupBy((_, i) => fn(_, i))).mapValues(v => apply(v)).get()
  }

  groupByFirst<R extends Key>(fn: (_: T, i: number) => R): Record<R, T> {
    const res: Record<Key, T> = {}
    this.forEach((curr, i) => {
      const key = '' + fn(curr, i)
      if (!res[key]) {
        res[key] = curr
      }
      return res
    }, {})
    return res
  }

  groupByLast<R extends Key>(fn: (_: T, i: number) => R): Record<R, T> {
    const res: Record<Key, T> = {}
    this.forEach((curr, i) => {
      const key = '' + fn(curr, i)
      res[key] = curr
      return res
    }, {})
    return res
  }

  percent(perdicate: PredicateFn<T, boolean>, base?: PredicateFn<T, boolean>): number {
    const v = this.count(perdicate)
    const total = base ? this.count(base) : this.length
    return v / total
  }

  sortByString(fn: (_: T) => string, orderBy: 'a-z' | 'z-a' = 'a-z') {
    return this.sort((a, b) => {
      return fn(a).localeCompare(fn(b)) * (orderBy === 'a-z' ? 1 : -1)
    })
  }

  sortByNumber(fn: (_: T) => number, orderBy: '0-9' | '9-0' = '0-9') {
    return this.sort((a, b) => {
      return fn(a) - fn(b) * (orderBy === '0-9' ? 1 : -1)
    })
  }

  difference(target: T[]): Seq<T> {
    const thisSet = new Set(this)
    const targetSet = new Set(target)
    const res: Seq<T> = seq()
    for (const item of thisSet) {
      if (!targetSet.has(item)) {
        res.push(item)
      }
    }
    for (const item of targetSet) {
      if (!thisSet.has(item)) {
        res.push(item)
      }
    }
    return res
  }

  intersect(array: T[]): Seq<T> {
    const countMap = new Map<T, number>()
    for (const _ of [array, this]) {
      for (const element of _) {
        const count = countMap.get(element) || 0
        countMap.set(element, count + 1)
      }
    }
    const intersectedArray: T[] = []
    for (const [element, count] of countMap) {
      if (count > 1) {
        intersectedArray.push(element)
      }
    }
    return seq(intersectedArray)
  }

  equals(target?: T[]) {
    if (target === undefined || this.length !== target.length) return false
    for (let i = 0; i < this.length; i++) {
      if (this[i] !== target[i]) return false
    }
    return true
  }

  head(): T | undefined {
    return this[0]
  }

  last(): T | undefined {
    return this[this.length - 1]
  }

  get() {
    const r: T[] = []
    this.forEach(_ => r.push(_))
    return r
  }
}

export const seq = Seq.fromArray
