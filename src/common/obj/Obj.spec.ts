import {KeyOf, Obj} from './Obj'
import {expect} from 'chai'

enum Status {
  OK = 'Ok',
  ERROR = 'Error',
  WARNING = 'Warning',
}

const status = {
  OK: 'Ok',
  ERROR: 'Error',
  WARNING: 'Warning',
}

const simpleObj = {
  a: '1',
  b: '2',
}

interface Oblast {
  koboKey: string
  name: string
  iso: string
}

describe('Obj', function () {
  it('Should infer as string', function () {
    const x: string[] = Obj.values(Status)
  })

  it('Should type and get keys correctly', function () {
    const keys: readonly ('OK' | 'ERROR' | 'WARNING')[] = Obj.keys(Status)
    expect(keys).deep.eq(['OK', 'ERROR', 'WARNING'])
  })

  it('Should type and get values correctly', function () {
    const keys: readonly ('Ok' | 'Error' | 'Warning')[] = Obj.values(Status)
    expect(keys).deep.eq(['Ok', 'Error', 'Warning'])
  })

  it('Should type entries and get correctly', function () {
    const entries: (['OK', Status] | ['ERROR', Status] | ['WARNING', Status])[] = Obj.entries(Status)
    expect(entries).deep.eq([
      ['OK', 'Ok'],
      ['ERROR', 'Error'],
      ['WARNING', 'Warning'],
    ])
  })

  it('Should get value and handle type correctly', function () {
    expect(Obj.getKeyByValue(Status, Status.WARNING)).eq('WARNING')
    expect(Obj.getKeyByValue(Status, 'unknown value' as any)).to.undefined
  })

  it('Should work when used in a regular object', function () {
    const blabla = {
      [Status.OK]: 'ok',
      [Status.ERROR]: 1,
      [Status.WARNING]: undefined,
    }
    expect(Object.entries(blabla)).deep.eq([
      [Status.OK, 'ok'],
      [Status.ERROR, 1],
      [Status.WARNING, undefined],
    ])
  })

  it('Should correctly manage Partial<>', function () {
    const test = <T extends Record<any, any>>(t: Partial<T>) => {
      Obj.entries(t).map(([k, v]) => {
        const _k: keyof T = k
        const _v: T[keyof T] | undefined = v
      })
    }
  })

  it('Should correctly manage Partial<>', function () {
    const test = <T extends Record<any, any>>(t: T) => {
      Obj.entries(t).reduce<T>((acc, [k, v]) => {
        const test = acc[k]
        return acc
      }, {} as T)
    }
  })

  describe('method', function () {
    it('test all', function () {
      const res = new Obj({
        cat: 2,
        bat: 1,
        catwoman: 4,
        batman: 3,
      })
        .map((k, v) => ['_' + k, v + 1])
        .sort(([ka, va], [kb, vb]) => va - vb)
        .filter((k, v) => k.includes('man'))
        .get()
      expect(res).deep.eq({
        _batman: 4,
        _catwoman: 5,
      })
    })

    it('keys', function () {
      const obj = new Obj({
        [Status.OK]: 1,
        [Status.ERROR]: 1,
        [Status.WARNING]: 2,
      })
      expect(obj.keys()).deep.eq([Status.OK, Status.ERROR, Status.WARNING])
    })

    it('values', function () {
      const obj = new Obj({
        [Status.OK]: 1,
        [Status.ERROR]: 1,
        [Status.WARNING]: 2,
      })
      expect(obj.values()).deep.eq([1, 1, 2])
    })

    it('entries', function () {
      it('', function () {
        const obj = new Obj({
          [Status.OK]: 1,
          [Status.ERROR]: 1,
          [Status.WARNING]: 2,
        })
        expect(obj.entries()).deep.eq([
          [Status.OK, 1],
          [Status.ERROR, 1],
          [Status.WARNING, 2],
        ])
      })
    })

    describe('sortManual', function () {
      it('sort by key', function () {
        const res = new Obj({
          ironman: 2,
          barman: 1,
          catwoman: 4,
          batman: 3,
        })
          .sortManual(['catwoman', 'barman', 'ironman', 'batman'])
          .get()
        expect(res).deep.eq({
          catwoman: 4,
          barman: 1,
          ironman: 2,
          batman: 3,
        })
      })
    })

    describe('sortKeys', function () {
      const data = new Obj({
        ironman: 2,
        barman: 1,
        catwoman: 4,
        batman: 3,
      } as Record<string, number>)

      it('sort by key', function () {
        const res = data.sortKeys((ak, bk) => ak.localeCompare(bk)).get()
        expect(res).deep.eq({
          barman: 1,
          batman: 3,
          catwoman: 4,
          ironman: 2,
        })
      })
    })

    describe('sort', function () {
      const data = new Obj({
        ironman: 2,
        barman: 1,
        catwoman: 4,
        batman: 3,
      } as Record<string, number>)

      it('sort by key', function () {
        const res = data.sort(([ak, av], [bk, bv]) => ak.localeCompare(bk)).get()
        expect(res).deep.eq({
          barman: 1,
          batman: 3,
          catwoman: 4,
          ironman: 2,
        })
      })

      it('sort by val', function () {
        const res = data.sort(([ak, av], [bk, bv]) => bv - av).get()
        expect(res).deep.eq({
          barman: 1,
          ironman: 2,
          batman: 3,
          catwoman: 4,
        })
      })
    })

    describe('toArray', function () {
      it('basic', function () {
        expect(Obj.toArray({a: 1, b: 2})).deep.eq([
          {name: 'a', value: 1},
          {name: 'b', value: 2},
        ])
      })
      it('override key value', function () {
        const r: {k: string; v: number}[] = Obj.toArray({a: 1, b: 2}, {keyName: 'k', valueName: 'v'})
        expect(r).deep.eq([
          {k: 'a', v: 1},
          {k: 'b', v: 2},
        ])
      })
      it('method version', function () {
        const r: {k: string; v: number}[] = new Obj({a: 1, b: 2}).toArray({keyName: 'k', valueName: 'v'})
        expect(r).deep.eq([
          {k: 'a', v: 1},
          {k: 'b', v: 2},
        ])
      })
    })

    describe('filterValue', function () {
      it('filter by string value', function () {
        const obj = {
          a: 'cat',
          b: 'catwoman',
          c: 'batman',
        }
        const filtered = Obj.filterValue(obj, v => v.includes('cat'))
        expect(filtered).deep.eq({
          a: 'cat',
          b: 'catwoman',
        })
      })
    })

    describe('filter', function () {
      it('filter by index', function () {
        const obj = {
          a: 'cat',
          b: 'catwoman',
          c: 'batman',
        }
        const filtered = Obj.filter(obj, (k, v, i) => i === 1)
        expect(filtered).deep.eq({
          b: 'catwoman',
        })
      })

      it('filter by string value', function () {
        const obj = {
          a: 'cat',
          b: 'catwoman',
          c: 'batman',
        }
        const filtered = Obj.filter(obj, (k, v) => v.includes('cat'))
        expect(filtered).deep.eq({
          a: 'cat',
          b: 'catwoman',
        })
      })

      it('filter by number value', function () {
        const obj = {
          a: 1,
          b: 2,
          c: 3,
        }
        const filtered = Obj.filter(obj, (k, v) => v > 1)
        expect(filtered).deep.eq({b: 2, c: 3})
      })

      it('filter by key', function () {
        const obj = {
          a: 1,
          b: 2,
          c: 3,
        }
        const filtered = Obj.filter(obj, (k, v) => k === 'a')
        expect(filtered).deep.eq({a: 1})
      })
    })

    describe('map', function () {
      it('should copy', function () {
        const objCopy: {a: string; b: string} = Obj.map(simpleObj, (k, v) => [k, v])
        expect(objCopy).deep.eq({a: '1', b: '2'})
      })

      it('should change keys', function () {
        const mapKey = (k: keyof typeof simpleObj): 'aa' | 'ab' => ('a' + k) as any
        const objCopy: {aa: string; ab: string} = Obj.map(simpleObj, (k, v) => [mapKey(k), v])
        expect(objCopy).deep.eq({aa: '1', ab: '2'})
      })

      it('should change values', function () {
        const objCopy: {a: number; b: number} = Obj.map(simpleObj, (k, v) => [k, parseInt(v)])
        expect(objCopy).deep.eq({a: 1, b: 2})
      })
    })

    describe('mapValues', function () {
      const obj = {
        a: 1,
        b: 2,
      }

      it('should multiply value', function () {
        const objCopy: {a: number; b: number} = Obj.mapValues(obj, (v: number) => v * 2)
        expect(objCopy).deep.eq({a: 2, b: 4})
      })
    })

    describe('mapKeys', function () {
      const obj = {
        a: '1',
        b: '2',
      }

      it('should suffix key', function () {
        const objCopy = Obj.mapKeys(obj, (k, v) => v)
        expect(objCopy).deep.eq({1: '1', 2: '2'})
      })
    })
  })

  describe('sortByString', () => {
    it('should sort by string ascending (a-z)', () => {
      const data = {a: 3, b: 1, c: 2}
      const result = Obj.sortByString(data, (v, k) => k, 'a-z')
      expect(Object.keys(result)).to.deep.equal(['a', 'b', 'c'])
    })

    it('should sort by string descending (z-a)', () => {
      const data = {a: 3, b: 1, c: 2}
      const result = Obj.sortByString(data, (v, k) => k, 'z-a')
      expect(Object.keys(result)).to.deep.equal(['c', 'b', 'a'])
    })

    it('should handle undefined values correctly', () => {
      const data = {a: 'zzz', b: undefined as any, c: 'aaa'}
      const result = Obj.sortByString(data, v => v, 'a-z')
      expect(Object.keys(result)).to.deep.equal(['c', 'a', 'b'])
    })

    it('should not crash with all undefined sort keys', () => {
      const data = {a: 1, b: 2}
      const result = Obj.sortByString(data, () => undefined)
      expect(Object.keys(result)).to.deep.equal(['a', 'b'])
    })
  })

  describe('sortByNumber', () => {
    it('should sort by number ascending (0-9)', () => {
      const data = {a: {age: 3}, b: {age: 1}, c: {age: 2}}
      const result = Obj.sortByNumber(data, _ => _.age, '0-9')
      expect(Object.keys(result)).to.deep.equal(['b', 'c', 'a'])
    })

    it('should sort by number descending (9-0)', () => {
      const data = {a: 3, b: 1, c: 2}
      const result = Obj.sortByNumber(data, v => v, '9-0')
      expect(Object.keys(result)).to.deep.equal(['a', 'c', 'b'])
    })

    it('should handle undefined values correctly', () => {
      const data = {a: 3, b: undefined as any, c: 2}
      const result = Obj.sortByNumber(data, v => v, '0-9')
      expect(Object.keys(result)).to.deep.equal(['c', 'a', 'b'])
    })

    it('should not crash with all undefined sort keys', () => {
      const data = {a: 1, b: 2}
      const result = Obj.sortByNumber(data, () => undefined)
      expect(Object.keys(result)).to.deep.equal(['a', 'b'])
    })
  })
})
