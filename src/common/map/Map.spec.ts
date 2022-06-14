import {expect} from 'chai'
import {map} from './Map'

describe('Map', function () {

  interface Obj {
    key: {
      subArr?: string[] | undefined
      subNumber: number | undefined
      subNumberUndefined: number | undefined
    }
  }

  const obj: Obj = {
    key: {
      subArr: ['a', 'b'],
      subNumber: 2,
      subNumberUndefined: undefined,
    }
  }

  const square = (x: number) => x * x

  it('should call function when value is defined', async function () {
    expect(map(obj.key.subNumber, square)).eq(4)
  })

  it('should work with array', async function () {
    expect(map(obj.key.subArr, ([a, b]) => a + b)).eq('ab')
  })

  it('should prevent function computation at the 2nd call', async function () {
    expect(map(obj.key.subNumberUndefined, square)).eq(undefined)
  })

  it('should not call when one of the 2 args is undefined', async function () {
    expect(map(obj.key.subNumber, obj.key.subNumberUndefined, (a, b) => a + b)).eq(undefined)
  })

  it('should call with 2 args', async function () {
    expect(map(obj.key.subArr, obj.key.subNumber, ([a, b], c) => a + b + c)).eq('ab2')
  })
})
