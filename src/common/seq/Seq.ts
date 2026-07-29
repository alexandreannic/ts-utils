import {RequiredProperty} from '../common/CommonType'
import {KeyOf, Obj} from '../obj/Obj'

type PredicateFn<T, R> = (_: T, index: number, array: T[]) => R

type KeyOfGroupBy = number | string

export type OrderByString = 'a-z' | 'z-a'

export type OrderByNumber = '0-9' | '9-0'

export class Seq<T> extends Array<T> {

  static fromArray<TT>(array: TT[] = []): Seq<TT> {
    return array instanceof Seq ? array : new Seq(...array)
  }

  static distinct<T>(array: T[]): T[] {
    return [...new Set(array)]
  }

  static getSortByStringFn(orderBy: OrderByString = 'a-z') {
    const asc = orderBy === 'a-z'
    return (a?: string, b?: string) => {
      if (a === undefined && b === undefined) return 0
      if (a === undefined) return asc ? 1 : -1
      if (b === undefined) return asc ? -1 : 1
      return asc ? a.localeCompare(b) : b.localeCompare(a)
    }
  }

  static getSortByNumberFn(orderBy: OrderByNumber = '0-9') {
    const asc = orderBy === '0-9'
    return (a?: number, b?: number) => {
      if (a === b) return 0
      if (a === undefined) return asc ? 1 : -1
      if (b === undefined) return asc ? -1 : 1
      return asc ? a - b : b - a
    }
  }

  count(): number
  count(fn: PredicateFn<T, boolean>): number
  count(fn?: PredicateFn<T, boolean>): number {
    if (!fn) {
      return this.length
    }
    let count = 0
    this.forEach((value, index, array) => {
      if (fn(value, index, array)) count++
    })
    return count
  }

  filter<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S): Seq<S>
  filter(predicate: (value: T, index: number, array: T[]) => unknown): Seq<T>
  filter(predicate: any): Seq<T> {
    return seq(super.filter(predicate))
  }

  map<U>(callback: (value: T, index: number, array: T[]) => U): Seq<U> {
    return seq(super.map(callback))
  }

  flatMap<U>(callback: (value: T, index: number, array: T[]) => U | ReadonlyArray<U>): Seq<U> {
    return seq(super.flatMap(callback))
  }

  distinctBy<K>(fn: (element: T) => K): Seq<T> {
    const seen = new Set<K>()
    return this.filter(item => {
      const key = fn(item)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  distinct(): Seq<T> {
    return seq(Seq.distinct(this))
  }

  sum(): number
  sum(fn: PredicateFn<T, number>): number
  sum(fn?: PredicateFn<T, number>): number {
    let total = 0
    this.forEach((value, index, array) => {
      total += fn ? fn(value, index, array) : (value as unknown as number)
    })
    return total
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
  reduceObject<R extends Record<any, any>>(fn: (_: T, acc: R, index: number) => undefined | [keyof R, R[keyof R]]): R {
    const obj: R = {} as R
    this.map((t, i) => {
      const kv = fn(t, obj, i)
      if (kv) {
        obj[kv[0]] = kv[1]
      }
    })
    return obj
  }

  groupBy<K extends KeyOfGroupBy>(fn: (_: T, i: number) => K): Record<K, Seq<T>> {
    const res = {} as Record<K, Seq<T>>
    this.forEach((curr, i) => {
      const key = ('' + fn(curr, i)) as K
      if (!res[key]) {
        res[key] = seq()
      }
      res[key].push(curr)
    }, {})
    return res
  }

  groupByAndApply<K extends KeyOfGroupBy, R>(fn: (_: T, i: number) => K, apply: (_: Seq<T>) => R): Record<KeyOf<K>, R> {
    return new Obj(this.groupBy((_, i) => fn(_, i))).mapValues(v => apply(v)).get()
  }

  groupByFirst<R extends KeyOfGroupBy>(fn: (_: T, i: number) => R): Record<R, T> {
    const res: Record<KeyOfGroupBy, T> = {}
    this.forEach((curr, i) => {
      const key = '' + fn(curr, i)
      if (!res[key]) res[key] = curr
    }, {})
    return res
  }

  groupByLast<R extends KeyOfGroupBy>(fn: (_: T, i: number) => R): Record<R, T> {
    const res: Record<KeyOfGroupBy, T> = {}
    this.forEach((curr, i) => {
      const key = '' + fn(curr, i)
      res[key] = curr
      return res
    }, {})
    return res
  }

  groupByToMap<R extends KeyOfGroupBy>(fn: (_: T, i: number) => R): Map<R, Seq<T>> {
    const res = new Map<R, Seq<T>>()
    this.forEach((curr, i) => {
      const key = fn(curr, i)
      if (!res.has(key)) {
        res.set(key, seq())
      }
      res.get(key)!.push(curr)
      return res
    }, {})
    return res
  }

  groupByAndApplyToMap<K extends KeyOfGroupBy, R>(
    fn: (_: T, i: number) => K,
    applyFn: (group: Seq<T>) => R,
  ): Map<K, R> {
    const grouped = this.groupByToMap(fn)
    for (const [key, items] of grouped) {
      grouped.set(key, applyFn(items) as any)
    }
    return grouped as Map<K, R>
  }

  groupByFirstToMap<R extends KeyOfGroupBy>(fn: (_: T, i: number) => R): Map<R, T> {
    const res = new Map<R, T>()
    this.forEach((curr, i) => {
      const key = fn(curr, i)
      res.set(key, curr)
    }, {})
    return res
  }

  groupByLastToMap<R extends KeyOfGroupBy>(fn: (_: T, i: number) => R): Map<R, T> {
    const res = new Map<R, T>()
    this.forEach((curr, i) => {
      const key = fn(curr, i)
      res.set(key, curr)
    }, {})
    return res
  }

  percent(perdicate: PredicateFn<T, boolean>, base?: PredicateFn<T, boolean>): number {
    const v = this.count(perdicate)
    const total = base ? this.count(base) : this.length
    return v / total
  }

  sortByString(fn: (_: T) => string, orderBy: OrderByString = 'a-z') {
    const compare = Seq.getSortByStringFn(orderBy)
    return this.sort((a, b) => compare(fn(a), fn(b)))
  }

  sortByManual<K extends string>(fn: (_: T) => K, order: readonly K[]) {
    const orderMap = new Map(order.map((key, i) => [key, i]))
    return this.sort((a, b) => {
      const rankA = orderMap.get(fn(a)) ?? Infinity
      const rankB = orderMap.get(fn(b)) ?? Infinity
      return rankA - rankB
    })
  }

  sortByNumber(fn: (_: T) => number, orderBy: OrderByNumber = '0-9') {
    const compare = Seq.getSortByNumberFn(orderBy)
    return this.sort((a, b) => compare(fn(a), fn(b)))
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

  static minBy<T, R extends number | string>(array: T[], fn: (_: T) => R): T | undefined {
    if (array.length === 0) return undefined

    let min = array[0]
    let minValue = fn(min)

    for (let i = 1; i < array.length; i++) {
      const value = fn(array[i])

      if (value < minValue) {
        min = array[i]
        minValue = value
      }
    }

    return min
  }

  static maxBy<T, R extends number | string>(array: T[], fn: (_: T) => R): T | undefined {
    if (array.length === 0) return undefined

    let max = array[0]
    let maxValue = fn(max)

    for (let i = 1; i < array.length; i++) {
      const value = fn(array[i])

      if (value > maxValue) {
        max = array[i]
        maxValue = value
      }
    }

    return max
  }

  static partition<T>(array: T[], fn: PredicateFn<T, boolean>): [T[], T[]] {
    const yes: T[] = []
    const no: T[] = []

    array.forEach((item, i, arr) => {
      ;(fn(item, i, arr) ? yes : no).push(item)
    })

    return [yes, no]
  }

  static chunk<T>(array: T[], size: number): T[][] {
    if (size <= 0) {
      throw new Error('Chunk size must be greater than zero')
    }

    const result: T[][] = []

    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size))
    }

    return result
  }

  minBy<R extends number | string>(fn: (_: T) => R): T | undefined {
    return Seq.minBy(this, fn)
  }

  maxBy<R extends number | string>(fn: (_: T) => R): T | undefined {
    return Seq.maxBy(this, fn)
  }

  partition(fn: PredicateFn<T, boolean>): [Seq<T>, Seq<T>] {
    const [yes, no] = Seq.partition(this, fn)
    return [seq(yes), seq(no)]
  }

  chunk(size: number): Seq<Seq<T>> {
    return seq(Seq.chunk(this, size).map(seq))
  }
}

export const seq = Seq.fromArray
