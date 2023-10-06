type PredicateFn<T, R> = (_: T, index: number, array: T[]) => R

interface Filter<T> {
  <S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): Seq<S>
  (predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): Seq<T>
}

type Primitive = number | string | boolean

export class Seq<T> extends Array<T> {

  readonly isArr = true

  static readonly fromArray = <TT>(t: TT[] = []) => {
    if ((t as Seq<TT>).isArr) return t as Seq<TT>
    const arr = new Seq<TT>()
    t.forEach((item) => arr.push(item))
    return arr
  }

  // @ts-ignore
  readonly count: (T extends number ? (fn?: PredicateFn<T, boolean>) => number : (fn: PredicateFn<T, boolean>) => number) = (fn = (value, index, array) => value) => {
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

  flatMap<U>(
    callback: (value: T, index: number, array: T[]) => U | ReadonlyArray<U>,
    thisArg?: any
  ): Seq<U> {
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
  sum: (T extends number ? (fn?: PredicateFn<T, number>) => number : (fn: PredicateFn<T, number>) => number) = (fn = (value, index, array) => value) => {
    let sum = 0
    this.forEach((v, i, arr) => sum += fn(v, i, arr))
    return sum
  }

  compact(): T extends undefined | null ? never : Seq<T> {
    return this.filter(_ => _ !== undefined && _ !== null) as any
  }

  sumObjects(): T extends Record<string, number> ? (Record<keyof T, number> | undefined) : never {
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
  reduceObject<R extends Record<any, any>>(
    fn: (_: T, acc: R) => undefined | [keyof R, R[keyof R]]
  ): R {
    const obj: R = {} as R
    this.map(t => {
      const kv = fn(t, obj)
      if (kv) {
        obj[kv[0]] = kv[1]
      }
    })
    return obj
  }

  groupBy<R extends undefined | Primitive>(fn: (_: T) => R): Record<string, Seq<T>> {
    const res: Record<string, Seq<T>> = {}
    this.forEach(curr => {
      const key = '' + fn(curr)
      if (!res[key]) {
        res[key] = seq()
      }
      res[key].push(curr)
      return res
    }, {})
    return res
  }

  percent(perdicate: PredicateFn<T, boolean>, base?: PredicateFn<T, boolean>): number {
    const v = this.count(perdicate)
    const total = base ? this.count(base) : this.length
    return v / total
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

  head(): T | undefined {
    return this[0]
  }

  last(): T | undefined {
    return this[this.length - 1]
  }

  get() {
    return this
  }
}

export const seq = Seq.fromArray

