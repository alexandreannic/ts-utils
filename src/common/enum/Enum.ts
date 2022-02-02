type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

type _Enum = {[key: string]: any}

export class Enum {

  static readonly entries = <T extends _Enum>(t: T): Entries<T> => {
    const entries = Object.entries(t)
    const plainStringEnum = entries.every(([k, v]) => typeof v === 'string')
    return plainStringEnum
      ? entries
      : entries.filter(([k, v]) => typeof v !== 'string') as any
  }

  static readonly keys = <T extends _Enum>(t: T): (keyof T)[] => {
    return Enum.entries(t).map(([key]) => key)
  }

  static readonly values = <T extends _Enum>(t: T): (T[keyof T])[] => {
    const values = Object.values(t)
    const plainStringEnum = values.every(_ => typeof _ === 'string')
    return plainStringEnum ? values : values.filter(_ => typeof _ !== 'string')
  }

  static readonly getKeyByValue = <T extends _Enum>(t: T, value: string/*T[keyof T]*/): keyof T  | undefined => {
    return Enum.entries(t).find(([k, v]) => v === value)?.[0]
  }
}
