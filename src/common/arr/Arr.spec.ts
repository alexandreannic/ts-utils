import {expect} from 'chai'
import {Arr} from './Arr'

describe.only('Arr', function () {

  it('get', function () {
    const arr = Arr([{k1: 1, k2: 'a'}, {k1: 2, k2: 'b'}])
    expect(arr.get).deep.eq([{k1: 1, k2: 'a'}, {k1: 2, k2: 'b'}])
  })

  it('head', function () {
    const arr = Arr([{k1: 1, k2: 'a'}, {k1: 2, k2: 'b'}])
    expect(arr.head).deep.eq({k1: 1, k2: 'a'})
  })

  it('last', function () {
    const arr = Arr([{k1: 1, k2: 'a'}, {k1: 2, k2: 'b'}])
    expect(arr.last).deep.eq({k1: 2, k2: 'b'})
  })

  it('filter', function () {
    expect(Arr([1, 2, 3]).filter((_, a, b) => _ > 1)).deep.eq([2, 3])
  })

  it('filter + last', function () {
    expect(Arr([1, 2, 3]).filter((_, a, b) => _ < 3).last).deep.eq(2)
  })

  it('map', function () {
    const arr = Arr([{k1: 1, k2: 'a'}, {k1: 2, k2: 'b'}])
    expect(arr.map(_ => _.k1).get).deep.eq([1, 2])
  })

  it('map + last', function () {
    const arr = Arr([{k1: 1, k2: 'a'}, {k1: 2, k2: 'b'}])
    expect(arr.map(_ => _.k1).last).deep.eq(2)
  })

  it('sum', function () {
    expect(Arr([1, 2]).sum()).eq(3)
  })

  it('sum objects', function () {
    expect(Arr([{a: 4}, {a: 7}]).sum(_ => _.a)).eq(11)
  })

  it('distinct', function () {
    expect(Arr([1, 1, 2]).distinct(_ => _)).deep.eq([1, 2])
  })

  it('distinct objects', function () {
    expect(Arr([{a: 4}, {a: 7}, {a: 4}]).distinct(_ => _.a)).deep.eq([{a: 4}, {a: 7}])
  })

  it('compact', function () {
    const before = [1, undefined, 2, null]
    const after = Arr(before).compact().get
    expect(after).deep.eq([1, 2])
  })

  it.only('should work with empty array', function () {
    const data = Arr([] as {a: number}[])
    expect(data.sumObjects()).deep.eq(undefined)
  })

  it.only('should sum object keys', function () {
    const data = Arr([{BK1: 1, HKF: 2}, {BK1: 5, HKF: 12}])
    expect(data.sumObjects()).deep.eq({
      BK1: 6,
      HKF: 14,
    })
  })

  it.only('should sum object keys with missing value', function () {
    const data = Arr([{BK1: 1, HKF: 2}, {BK1: 5}])
    expect(data.sumObjects()).deep.eq({
      BK1: 6,
      HKF: 2,
    })
  })

  it.only('should type as never if object contains string', function () {
    const dataWrong = Arr([{BK1: '1', HKF: 2}, {BK1: '5', HKF: 12}])
    const testType: never = dataWrong.sumObjects()
  })
})
