import {indexEntities} from './IndexEntities'
import {expect} from 'chai'

describe('IndexEntities', function () {
  const user1 = {
    id: '1',
    age: 30,
    firstName: 'Rich',
    custom: {custom: 1}
  }
  const user2 = {
    id: '2',
    age: 30,
    custom: {custom: 1}
  }
  const users = [user1, user2]

  it('should work', async function () {
    const res = indexEntities('id', users)
    expect(res).deep.eq({
      1: user1,
      2: user2,
    })
  })
})
