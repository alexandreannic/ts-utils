import {expect} from 'chai'
import {Seq, seq} from './Seq'

type Oblast = 'karkiv' | 'dni'

interface Form {
  oblast?: Oblast
}

describe('Arr', function () {

  it.only('check nested call', function () {
    expect((seq(seq(seq(seq([1, 2])))).get() as any).isArr).undefined
    expect(seq(seq(seq(seq([1, 2])))).isArr).true
  })

  it('get', function () {
    const arr = seq([{k1: 1, k2: 'a'}, {k1: 2, k2: 'b'}])
    expect(arr.get()).deep.eq([{k1: 1, k2: 'a'}, {k1: 2, k2: 'b'}])
  })

  it('head', function () {
    const arr = seq([{k1: 1, k2: 'a'}, {k1: 2, k2: 'b'}])
    expect(arr.head()).deep.eq({k1: 1, k2: 'a'})
  })

  it('last', function () {
    const arr = seq([{k1: 1, k2: 'a'}, {k1: 2, k2: 'b'}])
    expect(arr.last()).deep.eq({k1: 2, k2: 'b'})
  })

  it('filter', function () {
    expect(seq([1, 2, 3]).filter((_, a, b) => _ > 1)).deep.eq([2, 3])
  })

  it('filter + last', function () {
    expect(seq([1, 2, 3]).filter((_, a, b) => _ < 3).last()).deep.eq(2)
  })

  it('map', function () {
    const arr = seq([{k1: 1, k2: 'a'}, {k1: 2, k2: 'b'}])
    expect(arr.map(_ => _.k1).get()).deep.eq([1, 2])
  })

  it('map + last', function () {
    const arr = seq([{k1: 1, k2: 'a'}, {k1: 2, k2: 'b'}])
    expect(arr.map(_ => _.k1).last()).deep.eq(2)
  })

  it('sum', function () {
    expect(seq([1, 2]).sum()).eq(3)
  })

  it('sum objects', function () {
    expect(seq([{a: 4}, {a: 7}]).sum(_ => _.a)).eq(11)
  })

  it('distinct', function () {
    expect(seq([1, 1, 2]).distinct(_ => _)).deep.eq([1, 2])
  })

  it('distinct objects', function () {
    expect(seq([{a: 4}, {a: 7}, {a: 4}]).distinct(_ => _.a)).deep.eq([{a: 4}, {a: 7}])
  })

  it('flatMap', function () {
    const res: number[] = seq([1, [2, 3]]).flatMap(_ => _)
    expect(res).deep.eq([1, 2, 3])
  })

  it('compact', function () {
    const before = [1, undefined, 2, null]
    const after = seq(before).compact().get()
    expect(after).deep.eq([1, 2])
  })

  it('compact custom type', function () {
    type Name = 'name1' | 'name2'
    const before: (Name | undefined)[] = ['name1', undefined, 'name2', undefined]
    const after = seq(before).compact().get().map(_ => _)
    expect(after).deep.eq(['name1', 'name2'])
  })

  it('compact enum', function () {
    enum AB {A = 'A', B = 'B'}

    const before = seq([AB.A, AB.B, undefined])
    const after = before.compact().get().map(_ => _)
    expect(after).deep.eq([AB.A, AB.B,])
  })

  describe('sort', function () {
    const users = seq([
      {name: 'Dave', age: 35},
      {name: 'Bob', age: 30},
      {name: 'Charlie', age: 25},
      {name: 'Alice', age: 25},
    ])

    it('by string asc', function () {
      expect(users.sortByString(_ => _.name, 'a-z').get()).deep.eq([
        {name: 'Alice', age: 25},
        {name: 'Bob', age: 30},
        {name: 'Charlie', age: 25},
        {name: 'Dave', age: 35},
      ])
    })

    it('by string desc', function () {
      expect(users.sortByString(_ => _.name, 'z-a').get()).deep.eq([
        {name: 'Dave', age: 35},
        {name: 'Charlie', age: 25},
        {name: 'Bob', age: 30},
        {name: 'Alice', age: 25},
      ])
    })

    it('by number asc', function () {
      expect(users.sortByNumber(_ => _.age, '0-9').get()).deep.eq([
        {name: 'Charlie', age: 25},
        {name: 'Alice', age: 25},
        {name: 'Bob', age: 30},
        {name: 'Dave', age: 35},
      ])
    })

    it('by number desc', function () {
      expect(users.sortByNumber(_ => _.age, '9-0').get()).deep.eq([
        {name: 'Charlie', age: 25},
        {name: 'Alice', age: 25},
        {name: 'Bob', age: 30},
        {name: 'Dave', age: 35},
      ])
    })
  })

  describe('sumObjects', function () {
    it('should work with empty array', function () {
      const data = seq([] as {a: number}[])
      expect(data.sumObjects()).deep.eq(undefined)
    })

    it('should sum object keys', function () {
      const data = seq([{BK1: 1, HKF: 2}, {BK1: 5, HKF: 12}])
      expect(data.sumObjects()).deep.eq({
        BK1: 6,
        HKF: 14,
      })
    })

    it('should sum object keys with missing value', function () {
      const data = seq([{BK1: 1, HKF: 2}, {BK1: 5}])
      expect(data.sumObjects()).deep.eq({
        BK1: 6,
        HKF: 2,
      })
    })

    it('should type as never if object contains string', function () {
      const dataWrong = seq([{BK1: '1', HKF: 2}, {BK1: '5', HKF: 12}])
      const testType: never = dataWrong.sumObjects()
    })
  })

  describe('compactBy', function () {
    it('should filter', function () {
      const arr = seq([
        {name: 'Alice', age: 25},
        {name: 'Bob'},
        {name: 'Charlie', age: 25},
        {age: 35},
      ] as {name?: string, age?: number}[])
      const res = arr.compactBy('name')
      const shouldBeString: string = res[0].name
      expect(res).deep.eq([
        {name: 'Alice', age: 25},
        {name: 'Bob'},
        {name: 'Charlie', age: 25},
      ])
    })
  })

  describe('distinct', function () {
    it('string array', function () {
      const arr = ['aa', 'ba', 'aa', 'ca', 'aa', 'ba']
      const res = Seq.distinct(arr)
      expect(res).deep.eq(['aa', 'ba', 'ca'])
    })
  })

  describe('contains', function () {
    it('static', function () {
      type YN = 'yes' | 'no'
      const arr = ['yes', 'yes'] as YN[]
      const s = Seq.contains(arr, 'aageaa')
    })

    it('union', function () {
      type YN = 'yes' | 'no'
      const s = seq(['yes', 'yes'] as YN[])
      s.contains('yes')
    })

    it('enum', function () {
      enum YN {
        Yes = 'Yes',
        No = 'No',
      }

      const s = seq([YN.Yes, YN.Yes] as YN[])
      s.contains(YN.No)
    })
  })

  describe('count', function () {

    it('should count', function () {
      const arr = seq([25, 30, 25, 35,])
      const res: number = arr.count()
      expect(res).eq(arr.length)
    })

    it('should count object property', function () {
      const arr = seq([
        {name: 'Alice', age: 25},
        {name: 'Bob', age: 30},
        {name: 'Charlie', age: 25},
        {name: 'Dave', age: 35},
      ])
      expect(arr.count(_ => _.age > 26)).eq(2)
    })
  })

  describe('percent', function () {
    it('should compute percentage', function () {
      const arr = seq([
        {name: 'Alice', age: 25},
        {name: 'Bob', age: 30},
        {name: 'Charlie', age: 25},
        {name: 'Dave', age: 35},
      ])
      expect(arr.percent(_ => _.age === 35)).eq(.25)
      expect(arr.percent(_ => _.age === 35, _ => _.age >= 30)).eq(.5)
      expect(arr.percent(_ => _.age < 31)).eq(.75)
    })
  })

  describe('reduceObj', function () {
    it('should works with undefined and accepts filter', function () {
      const arr: Form[] = [
        {oblast: 'karkiv'},
        {oblast: undefined},
        {oblast: 'dni'},
        {oblast: undefined},
        {oblast: 'dni'},
      ]
      const res: Record<Oblast, number> = seq(arr).reduceObject<Record<NonNullable<Oblast>, number>>((_, acc) => {
        if (_.oblast !== 'dni') {
          return [_.oblast!, (acc[_.oblast!] ?? 0) + 1]
        }
      })
      expect(res).deep.eq({
        karkiv: 1,
        undefined: 2,
      })
    })

    it('should works with undefined', function () {
      const arr = seq([1, undefined, 2, 2, 1, 3])
      const res = arr.reduceObject<Record<number, number>>((_, acc) => {
        return [_!, (acc[_!] ?? 0) + 1]
      })
      expect(res).deep.eq({
        1: 2, 2: 2, 3: 1, undefined: 1
      })
    })


    it('should works', function () {
      const users = seq([
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
      const users = seq([
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

  describe('intersect', function () {
    it('should works', function () {
      const arr = seq(['apple', 'banana', 'pear', 'orange', 'kiwi', 'grape'])
      expect(arr.intersect(['apple', 'orange', 'prune'])).deep.eq(['apple', 'orange'])
    })

    it('should works with empty array', function () {
      const arr = seq(['apple', 'banana', 'pear', 'orange', 'kiwi', 'grape'])
      expect(arr.intersect([])).deep.eq([])
    })
  })

  describe('groupByFirst', function () {
    it('groupBy length', function () {
      const arr = seq([
        {name: 'Alice', age: 25},
        {name: 'Bob', age: 30},
        {name: 'Charlie', age: 25},
        {name: 'Dave', age: 35},
      ])
      expect(arr.groupByFirst(_ => _.age)).deep.eq({
        25: {name: 'Alice', age: 25},
        30: {name: 'Bob', age: 30},
        35: {name: 'Dave', age: 35},
      })
    })
  })

  describe('groupByFirst', function () {
    it('groupBy length', function () {
      const arr = seq([
        {name: 'Alice', age: 25},
        {name: 'Bob', age: 30},
        {name: 'Charlie', age: 25},
        {name: 'Dave', age: 35},
      ])
      expect(arr.groupByLast(_ => _.age)).deep.eq({
        25: {name: 'Charlie', age: 25},
        30: {name: 'Bob', age: 30},
        35: {name: 'Dave', age: 35},
      })
    })
  })

  describe('groupByAndApply', function () {
    it('count', function () {
      const arr = seq([
        {name: 'Dave', age: 25},
        {name: 'Alice', age: 30},
        {name: 'Charlie', age: 25},
        {name: 'Dave', age: 35},
        {name: 'Charlie', age: 35},
        {name: 'Charlie', age: 35},
      ])
      expect(arr.groupByAndApply(_ => _.name, _ => _.length)).deep.eq({
        Dave: 2,
        Alice: 1,
        Charlie: 3,
      })
    })

    it('sum', function () {
      const arr = seq([
        {name: 'Dave', age: 1},
        {name: 'Alice', age: 2},
        {name: 'Charlie', age: 3},
        {name: 'Dave', age: 4},
        {name: 'Charlie', age: 5},
        {name: 'Charlie', age: 6},
      ])

      expect(arr.groupByAndApply(_ => _.name, _ => _.sum(_ => _.age))).deep.eq({
        Dave: 5,
        Alice: 2,
        Charlie: 14,
      })
    })
  })

  describe('groupBy', function () {
    it('groupBy length', function () {
      const arr = seq(['apple', 'banana', 'pear', 'orange', 'kiwi', 'grape'])
      expect(arr.groupBy(_ => _.length)).deep.eq({
        5: ['apple', 'grape'], 6: ['banana', 'orange'], 4: ['pear', 'kiwi']
      })
    })

    it('groupBy by boolean', function () {
      const arr = seq([2, 4, 23, 342, 21, 4, 100,])
      const test = arr.groupBy(_ => String(_ > 22))
      expect(arr.groupBy(_ => String(_ > 22))).deep.eq({
        false: [2, 4, 21, 4,],
        true: [23, 342, 100],
      })
    })

    it('groupBy by value', function () {
      const arr = seq(['vin', 'vol', 'dnip', 'vol', 'vol', 'dnip'])
      expect(arr.groupBy(_ => _)).deep.eq({
        dnip: ['dnip', 'dnip'],
        vol: ['vol', 'vol', 'vol'],
        vin: ['vin'],
      })
    })

    it('groupBy objects by value', function () {
      const arr = seq([
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

    it('should infer key type when is it a subset of string', function () {
      type Name = 'Alice' | 'Bob' | 'Charlie' | 'Dave'
      const arr: Seq<{name: Name, age: number}> = seq([
        {name: 'Alice', age: 25},
        {name: 'Bob', age: 30},
        {name: 'Charlie', age: 25},
        {name: 'Dave', age: 35},
      ])
      const res: Record<Name, typeof arr> = arr.groupBy(_ => _.name)
    })

    it('should infer key type when is it a subset of string', function () {
      type Name = 'Alice' | 'Bob' | 'Charlie' | 'Dave'
      const arr: Seq<{name: Name, adult: boolean}> = seq([
        {name: 'Alice', adult: true},
        {name: 'Bob', adult: false},
        {name: 'Charlie', adult: true},
        {name: 'Dave', adult: true},
      ])
      const res = arr.groupBy(_ => _.adult + '')
    })

    it('should works with undefined value', function () {
      const arr = seq([1, undefined, 2, 2, 1, 3])
      const res: Record<string, (number | undefined)[]> = arr.groupBy(_ => _ ?? '')
      expect(res).deep.eq({
        1: [1, 1],
        2: [2, 2],
        3: [3],
        '': [undefined]
      })
    })

    it('should get index', function () {
      const arr = seq([1, undefined, 2, 2, 1, 3])
      const res: Record<string, (number | undefined)[]> = arr.groupBy((_, i) => i)
      // expect(res).deep.eq({
      //   1: [0, 4],
      //   2: [2, 3],
      //   3: [5],
      //   '': [undefined]
      // })
    })
  })
})
