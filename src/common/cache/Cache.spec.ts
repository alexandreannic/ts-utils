import {expect} from 'chai'
import {Cache} from './Cache'
import {duration} from '../duration/Duration'
import {sleep} from '../delay/Delay'

interface User {
  name: string
  address: {
    city: string
    zip: number
  }
}

describe('Cache', function () {

  const user: User = {
    name: 'Francis Ngannou', address: {city: 'Paris', zip: 75000}
  }

  const user2: User = {
    name: 'Mike Horn', address: {city: 'Lausanne', zip: 1000}
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

  it('should get only not expired', async function() {
    const cache = new Cache<User>()
    cache.set('mike', user2, duration(.1, 'second'))
    cache.set('francis', user, duration(.3, 'second'))
    await sleep(duration(.2, 'second'))
    expect(cache.getAll()).deep.eq([user])
  })

  it('should remove one', async function() {
    const cache = new Cache<User>()
    cache.set('mike', user2, duration(10, 'second'))
    cache.set('francis', user, duration(10, 'second'))
    cache.remove('francis')
    expect(cache.getAll()).deep.eq([user2])
  })

  it('should remove all', async function() {
    const cache = new Cache<User>()
    cache.set('mike', user2, duration(10, 'second'))
    cache.set('francis', user, duration(10, 'second'))
    cache.removeAll()
    expect(cache.getAll()).deep.eq([])
  })
})
