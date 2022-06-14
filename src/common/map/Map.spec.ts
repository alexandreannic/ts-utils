import {expect} from 'chai'
import {map} from './Map'

describe('Map', function () {

  interface Obj {
    key: {
      subString?: string | undefined
      subNumber: number | undefined
      subNumberUndefined: number | undefined
    }
  }

  const obj: Obj = {
    key: {
      subString: 'a',
      subNumber: 2,
      subNumberUndefined: undefined,
    }
  }

  const square = (x: number) => x * x

  it('should prevent function computation at the 2nd call', async function () {
    expect(map(obj.key.subNumber, square)).eq(4)
  })

  it('should prevent function computation at the 2nd call', async function () {
    expect(map(obj.key.subNumberUndefined, square)).eq(undefined)
  })

  it.only('should not call when one of the 2 args is undefined', async function () {
    expect(map(obj.key.subNumber, obj.key.subNumberUndefined, ([a, b]) => a + b)).eq(undefined)
  })

  it.only('should call with 2 args', async function () {
    expect(map(obj.key.subString, obj.key.subNumber, ([a, b]) => a + b)).eq('a2')
  })
})
