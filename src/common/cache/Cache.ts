import {duration, Duration} from '../duration/Duration'
import {filterUndefined} from '../common/Common'

export interface CacheData<V> {
  lastUpdate: Date;
  expiration?: number;
  value: V;
}

export class Cache<V = any> {

  constructor(
    private defaultExpiration: Duration = duration(1, 'hour'),
    private cleaningCheckupInterval: Duration = duration(2, 'day'),
  ) {
    this.intervalRef = setInterval(this.cleanCheckup, cleaningCheckupInterval)
  }

  private readonly intervalRef

  private cache: Map<string, CacheData<V>> = new Map()

  private readonly isExpired = (_: CacheData<V>) => _.expiration && _.lastUpdate.getTime() + _.expiration < new Date().getTime()

  readonly get = (key: string): V | undefined => {
    const data = this.cache.get(key)
    if (data) {
      if (this.isExpired(data)) {
        this.remove(key)
      } else {
        return data.value
      }
    }
  }

  readonly getAll = (): V[] => {
    this.cleanCheckup()
    return filterUndefined(Array.from(this.cache.values()).map(_ => _.value))
  }

  readonly getAllKeys = (): string[] => {
    this.cleanCheckup()
    return Array.from(this.cache.keys())
  }

  readonly set = (key: string, value: V, expiration?: Duration): void => {
    this.cache.set(key, {
      value,
      expiration: expiration || this.defaultExpiration,
      lastUpdate: new Date(),
    })
  }

  readonly remove = (key: string): void => {
    this.cache.delete(key)
  }

  readonly removeAll = (): void => {
    this.cache = new Map()
  }

  private cleanCheckup = () => {
    this.cache.forEach((data: CacheData<V>, key: string) => {
      if (data.expiration && data.lastUpdate.getTime() + data.expiration < new Date().getTime()) {
        this.remove(key)
      }
    })
  }
}
