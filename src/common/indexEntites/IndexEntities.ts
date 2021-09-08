type RequiredKeys<T> = { [K in keyof T]-?: ({} extends { [P in K]: T[K] } ? never : K) }[keyof T];
type TypeMatchingKeys<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T];
type NonOptionalTypeMatchingKeys<T, V> = TypeMatchingKeys<T, V> & keyof Pick<T, RequiredKeys<T>>;

export const indexEntities = <T>(key: NonOptionalTypeMatchingKeys<T, string>, entities: T[]): {[key: string]: T} => {
  const res: {[key: string]: T} = {}
  entities.forEach(entity => {
    res[entity[key] as any] = entity
  })
  return res
}
