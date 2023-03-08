export const Arr = <T>(t: T[]) => new _Arr(...t)

type SumFn<T> = (_: T) => number

interface Filter<T> {
  <S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): _Arr<S>;
  (predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): _Arr<T>;
}

export class _Arr<T> extends Array<T> {

  // constructor(...get: T[]) {
  //   super(...get)
  //   this.arr = [...get]
  // }
  //
  // readonly arr: T[]


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
  readonly sum: (T extends number ? (fn?: SumFn<T>) => number : (fn: SumFn<T>) => number) = (fn = _ => _) => {
    return this.get.reduce((acc, curr) => acc + fn(curr), 0)
  }

  compact(): T extends undefined | null ? never : _Arr<T> {
    return this.filter(_ => _ !== undefined && _ !== null) as any
  }

  readonly head = this[0]

  readonly last = this[this.length - 1]

  readonly get = [...this]
}
