type Mapper<I, O> = (value: I) => O

class Pipe<T> {
  constructor(private readonly value: T) {
  }

  map<U>(fn: Mapper<T, U>): Pipe<U> {
    return new Pipe(fn(this.value))
  }

  tap(fn: (value: T) => void): Pipe<T> {
    fn(this.value)
    return this
  }

  chain<U>(fn: (value: T) => Pipe<U>): Pipe<U> {
    return fn(this.value)
  }

  get(): T {
    return this.value
  }

  when(
    condition: boolean,
    fn: (value: T) => T,
  ): Pipe<T> {
    return condition ? new Pipe(fn(this.value)) : this
  }

  cast<U extends T>(): Pipe<U> {
    return this as unknown as Pipe<U>
  }

  match<U>(
    cases: Array<[(value: T) => boolean, (value: T) => U]>,
    otherwise: (value: T) => U,
  ): Pipe<U> {
    for (const [predicate, mapper] of cases) {
      if (predicate(this.value)) {
        return new Pipe(mapper(this.value))
      }
    }
    return new Pipe(otherwise(this.value))
  }
}

export const pipe = <T>(value: T): Pipe<T> => new Pipe(value)
