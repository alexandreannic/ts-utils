type Value = string | number
type CaseValue<R> = R | (() => R)
type Cases<V extends Value, R> = Record<V, CaseValue<R>>
type CasesPartial<V extends Value, R> = Partial<Record<V, CaseValue<R>>>
type DefaultCase<R> = <NR>(value: CaseValue<NR>) => R | NR

export function match<V extends Value>(value: V): Matcher<V, false>
export function match<V extends Value, IsNullable extends true>(value: V | null | undefined): Matcher<V, IsNullable>

export function match<V extends Value>(value: V | null | undefined): Matcher<V, boolean> {
  return new Matcher<V, typeof value extends V ? false : true>(value as V)
}

class Matcher<V extends Value, IsNullable extends boolean = false> {
  constructor(private value: IsNullable extends true ? V | null | undefined : V) {}

  cases: IsNullable extends true
    ? {
        <R>(cases: CasesPartial<V, R>): {
          default: DefaultCase<R>
        }
      }
    : {
        <R>(cases: Cases<V, R>): {
          default: DefaultCase<R>
          exhaustive: () => R
        }
        <R>(cases: CasesPartial<V, R>): {
          default: DefaultCase<R>
        }
      } = <R>(cases: Cases<V, R> | CasesPartial<V, R>) => {
    return new CaseBuilder<V, R, IsNullable>(this.value as any, cases) as any
  }
}

class CaseBuilder<V extends Value, R, IsNullable extends boolean> {
  constructor(
    private value: IsNullable extends true ? V | null | undefined : V,
    private cases: Cases<V, R> | CasesPartial<V, R>,
  ) {}

  resolveCaseValue = <T>(value: CaseValue<T>): T => {
    if (typeof value === 'function') {
      return (value as Function)()
    }
    return value
  }

  default(defaultValue: CaseValue<R>): R {
    if (this.value === null || this.value === undefined) {
      return this.resolveCaseValue(defaultValue)
    }

    if (!Object.hasOwn(this.cases, this.value as V)) {
      return this.resolveCaseValue(defaultValue)
    }
    const matchedCase = this.cases[this.value]
    return this.resolveCaseValue(matchedCase as any) as any // TODO
  }

  exhaustive(): R {
    if (!Object.hasOwn(this.cases, this.value as V)) {
      throw new Error(`No matching case for value: ${this.value}`)
    }
    const matchedCase = this.cases[this.value as V]
    return this.resolveCaseValue(matchedCase) as any
  }
}
