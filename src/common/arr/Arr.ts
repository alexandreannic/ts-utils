export const Arr = <T>(t: T[]) => new _Arr(...t)

type PredicateFn<T, R> = (_: T, index: number, array: T[]) => R

interface Filter<T> {
  <S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): _Arr<S>
  (predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): _Arr<T>
}

// interface Count<T> {
//   <S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): number
//   (predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): number
// }

type Primitive = number | string | boolean

export class _Arr<T> extends Array<T> {

  // constructor(...get: T[]) {
  //   super(...get)
  //   this.arr = [...get]
  // }
  //
  // readonly arr: T[]


  // @ts-ignore
  readonly count: (T extends number ? (fn?: PredicateFn<T, boolean>) => boolean : (fn: PredicateFn<T, boolean>) => boolean) = (fn = (value, index, array) => value) => {
    let x = 0
    this.forEach((v, i, a) => {
      if (fn(v, i, a)) x += 1
    })
    return x
  }

  filter: Filter<T> = (predicate: any, thisArg: any) => {
    return new _Arr(...super.filter(predicate, thisArg))
  }

  map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): _Arr<U> {
    return new _Arr(...super.map(callbackfn, thisArg))
  }

  distinct(fn: (element: T) => any) {
    const uniqueValues: Record<any, boolean> = {}
    return this.get.reduce((result: T[], currentValue: T) => {
      const key = fn(currentValue)
      if (!uniqueValues[key]) {
        uniqueValues[key] = true
        result.push(currentValue)
      }
      return result
    }, [])
  }

  // @ts-ignore
  readonly sum: (T extends number ? (fn?: PredicateFn<T, number>) => number : (fn: PredicateFn<T, number>) => number) = (fn = (value, index, array) => value) => {
    let sum = 0
    this.forEach((v, i, arr) => sum += fn(v, i, arr))
    return sum
  }

  compact(): T extends undefined | null ? never : _Arr<T> {
    return this.filter(_ => _ !== undefined && _ !== null) as any
  }

  readonly sumObjects = (): T extends Record<string, number> ? (Record<keyof T, number> | undefined) : never => {
    if (!this.head) {
      return undefined as any
    }
    const init = Object.keys(this.head).reduce((sum, k) => ({...sum, [k]: 0}), {} as Record<keyof T, number>)
    return this.reduce((acc, curr) => {
      const res = ({
        ...acc,
        ...(Object.keys(curr) as (keyof T)[]).reduce<Partial<Record<keyof T, number>>>((sum, k) => ({
          ...sum,
          [k]: acc[k] + (curr[k] as unknown as number)
        }), {})
      })
      return res
    }, init) as any
  }

  /**
   * Simpler and faster API for reduce((acc, curr) => ({...acc, [xxx]: yyy}), {} as BlaBla)
   */
  readonly reduceObject = <R extends Record<any, any>>(fn: (_: T, acc: R) => undefined | [keyof R, R[keyof R]]): R => {
    const obj: R = {} as R
    this.map(t => {
      const kv = fn(t, obj)
      if (kv) {
        obj[kv[0]] = kv[1]
      }
    })
    return obj
  }

  readonly groupBy = <R extends undefined | Primitive>(fn: (_: T) => R): Record<string, T[]> => {
    const res: Record<string, T[]> = {}
    this.reduce<Record<string, T[]>>((acc, curr) => {
      const key = '' + fn(curr)
      if (!res[key]) {
        res[key] = []
      }
      res[key].push(curr)
      return res
    }, {})
    return res
  }

  readonly head = this[0]

  readonly last = this[this.length - 1]

  readonly get = [...this]
}
