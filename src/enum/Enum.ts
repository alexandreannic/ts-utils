type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export class Enum {

  static readonly entries = <T>(t: T): Entries<T> => {
    const entries = Object.entries(t)
    const plainStringEnum = entries.every(([k, v]) => typeof v === 'string')
    return plainStringEnum
      ? entries
      : entries.filter(([k, v]) => typeof v !== 'string') as any
  }

  static readonly keys = <T>(t: T): (keyof T)[] => {
    return Enum.entries(t).map(([key]) => key)
  }

  static readonly values = <T>(t: T): (T[keyof T])[] => {
    const values = Object.values(t)
    const plainStringEnum = values.every(_ => typeof _ === 'string')
    return plainStringEnum ? values : values.filter(_ => typeof _ !== 'string')
  }
}

