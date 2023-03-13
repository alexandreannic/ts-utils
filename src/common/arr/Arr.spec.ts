import {expect} from 'chai'
import {Arr, Dictionary} from './Arr'

describe('Arr', function () {

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
})

describe('sumObjects', function () {
  it('should work with empty array', function () {
    const data = Arr([] as {a: number}[])
    expect(data.sumObjects()).deep.eq(undefined)
  })

  it('should sum object keys', function () {
    const data = Arr([{BK1: 1, HKF: 2}, {BK1: 5, HKF: 12}])
    expect(data.sumObjects()).deep.eq({
      BK1: 6,
      HKF: 14,
    })
  })

  it('should sum object keys with missing value', function () {
    const data = Arr([{BK1: 1, HKF: 2}, {BK1: 5}])
    expect(data.sumObjects()).deep.eq({
      BK1: 6,
      HKF: 2,
    })
  })

  it('should type as never if object contains string', function () {
    const dataWrong = Arr([{BK1: '1', HKF: 2}, {BK1: '5', HKF: 12}])
    const testType: never = dataWrong.sumObjects()
  })
})

type Oblast = 'karkiv' | 'dni'

interface Form {
  oblast? :Oblast
}

describe('reduceObj', function () {
  it('should works with undefined', function () {
    const arr: Form[] = [
      {oblast: 'karkiv'},
      {oblast: undefined},
      {oblast: 'dni'},
      {oblast: undefined},
      {oblast: 'dni'},
    ]
    const res: Record<Oblast, number> = Arr(arr).reduceObject<Record<NonNullable<Oblast>, number>>((_, acc) => {
      return [_.oblast!, (acc[_.oblast!] ?? 0) + 1]
    })
    expect(res).deep.eq({
      karkiv: 1,
      dni: 2,
      undefined: 2,
    })
  })

  it('should works with undefined', function () {
    const arr = Arr([1, undefined, 2, 2, 1, 3])
    const res = arr.reduceObject<Record<number, number>>((_, acc) => {
      return [_!, (acc[_!] ?? 0) + 1]
    })
    expect(res).deep.eq({
      1: 2, 2: 2, 3: 1, undefined: 1
    })
  })


  it('should works', function () {
    const users = Arr([
      {name: 'Alice', age: 25},
      {name: 'Bob', age: 30},
      {name: 'Charlie', age: 25},
      {name: 'Dave', age: 35},
    ])
    const res = users.reduceObject(_ => [_.name, _])
    expect(res).deep.eq({
      Alice: {name: 'Alice', age: 25},
      Bob: {name: 'Bob', age: 30},
      Charlie: {name: 'Charlie', age: 25},
      Dave: {name: 'Dave', age: 35},
    })

  })

  it('should sum', function () {
    const users = Arr([
      {name: 'Charlie', age: 25},
      {name: 'Alice', age: 25},
      {name: 'Alice', age: 22},
      {name: 'Charlie', age: 25},
      {name: 'Bob', age: 30},
      {name: 'Charlie', age: 25},
    ])
    const res = users.reduceObject<Record<string, number>>((_, acc) => {
      const sum = 1 + (acc[_.name] ?? 0)
      return [_.name, sum]
    })
    expect(res).deep.eq({
      Alice: 2,
      Bob: 1,
      Charlie: 3,
    })

  })
})

describe('groupBy', function () {
  it('groupBy length', function () {
    const arr = Arr(['apple', 'banana', 'pear', 'orange', 'kiwi', 'grape'])
    expect(arr.groupBy(_ => _.length)).deep.eq({
      5: ['apple', 'grape'], 6: ['banana', 'orange'], 4: ['pear', 'kiwi']
    })
  })

  it('groupBy by boolean', function () {
    const arr = Arr([2, 4, 23, 342, 21, 4, 100,])
    expect(arr.groupBy(_ => _ > 22)).deep.eq({
      false: [2, 4, 21, 4,],
      true: [23, 342, 100],
    })
  })

  it('groupBy by value', function () {
    const arr = Arr(['vin', 'vol', 'dnip', 'vol', 'vol', 'dnip'])
    expect(arr.groupBy(_ => _)).deep.eq({
      dnip: ['dnip', 'dnip'],
      vol: ['vol', 'vol', 'vol'],
      vin: ['vin'],
    })
  })

  it('groupBy objects by value', function () {
    const arr = Arr([
      {name: 'Alice', age: 25},
      {name: 'Bob', age: 30},
      {name: 'Charlie', age: 25},
      {name: 'Dave', age: 35},
    ])
    expect(arr.groupBy(_ => _.age)).deep.eq({
      25: [{name: 'Alice', age: 25}, {name: 'Charlie', age: 25}],
      30: [{name: 'Bob', age: 30}],
      35: [{name: 'Dave', age: 35}]
    })
  })

  it('should works with undefined value', function () {
    const arr = Arr([1, undefined, 2, 2, 1, 3])
    const res: Record<string, (number | undefined)[]> = arr.groupBy(_ => _)
    expect(res).deep.eq({
      1: [1, 1],
      2: [2, 2],
      3: [3],
      undefined: [undefined]
    })
  })
})
