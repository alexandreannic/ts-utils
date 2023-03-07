import {expect} from 'chai'
import {Cache} from './Cache'
import {duration} from '../duration/Duration'
import {sleep} from '../delay/Delay'
import {getTime} from '../lazy/Lazy.spec'

interface User {
  name: string
  address: {
    city: string
    zip: number
  }
}

interface Activity {
  activity: string
}

describe('Cache', function () {

  const user: User = {
    name: 'Francis Ngannou', address: {city: 'Paris', zip: 75000}
  }

  const user2: User = {
    name: 'Mike Horn', address: {city: 'Lausanne', zip: 1000}
  }

  const activity: Activity = {
    activity: 'blabla'
  }

  it('should save and get', async function () {
    const cache = new Cache<User>()
    cache.set('francis', user)
    expect(cache.get('francis')).deep.eq(user)
  })

  it('should get before expiration', async function () {
    const cache = new Cache<User>()
    cache.set('francis', user, duration(.5, 'second'))
    await sleep(duration(.4, 'second'))
    expect(cache.get('francis')).deep.eq(user)
  })

  it('should not get after expiration', async function () {
    const cache = new Cache<User>()
    cache.set('francis', user, duration(.4, 'second'))
    await sleep(duration(.5, 'second'))
    expect(cache.get('francis')).eq(undefined)
  })

  it('should get only not expired', async function () {
    const cache = new Cache<User>()
    cache.set('mike', user2, duration(.1, 'second'))
    cache.set('francis', user, duration(.3, 'second'))
    await sleep(duration(.2, 'second'))
    expect(cache.getAll()).deep.eq([user])
  })

  it('should remove one', async function () {
    const cache = new Cache<User>()
    cache.set('mike', user2, duration(10, 'second'))
    cache.set('francis', user, duration(10, 'second'))
    cache.remove('francis')
    expect(cache.getAll()).deep.eq([user2])
  })

  it('should remove all', async function () {
    const cache = new Cache<User>()
    cache.set('mike', user2, duration(10, 'second'))
    cache.set('francis', user, duration(10, 'second'))
    cache.removeAll()
    expect(cache.getAll()).deep.eq([])
  })

  it('should handle multiple types', async function () {
    const cache = new Cache()
    cache.set<User>('mike', user2)
    cache.set('activity', activity)
    const u: User | undefined = cache.get<User>('mike')
    const a: Activity | undefined = cache.get<Activity>('activity')
    // Since Cache is not typed, it returns any and should be assigned to anything even it's wrong
    const all: {wrongType: Symbol}[] = cache.getAll()
    expect(true).to.true
  })

  it('should ignore get type when cash is typed', async function () {
    const cache = new Cache<User>()
    cache.set<{ignoredType: Symbol}>('user', user)
    const u: User | undefined = cache.get<{ignoredType: Symbol}>('user')
    const users: User[] = cache.getAll()
    expect(true).to.true
  })

  it('should avoid reprocess request', async function () {
    let sideEffect = 0
    const request = Cache.request(async (id: number) => {
      ++sideEffect
      return id
    }, {ttl: duration(10, 'minute')})

    expect(await request(3)).eq(3)
    expect(sideEffect).eq(1)

    expect(await request(4)).eq(4)
    expect(sideEffect).eq(2)

    expect(await request(3)).eq(3)
    expect(sideEffect).eq(2)

    expect(await request(3)).eq(3)
    expect(sideEffect).eq(2)
  })

  it('should consider ttl', async function () {
    let sideEffect = 0
    const request = Cache.request(async (id: number) => {
      ++sideEffect
      return id
    }, {ttl: duration(.5, 'second')})

    await request(3)
    expect(sideEffect).eq(1)
    await request(3)
    expect(sideEffect).eq(1)
    await sleep(duration(1, 'second'))
    await request(3)
    expect(sideEffect).eq(2)
  })
})
