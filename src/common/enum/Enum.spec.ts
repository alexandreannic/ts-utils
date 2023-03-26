import {Enum} from './Enum'
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

interface Oblast {
  koboKey: string
  name: string
  iso: string
}

describe('Enum', function () {

  it('Should infer as string', function () {
    const x: string[] = Enum.values(Status)
  })

  it('Should type and get keys correctly', function () {
    const keys: readonly ('OK' | 'ERROR' | 'WARNING')[] = Enum.keys(Status)
    expect(keys).deep.eq(['OK', 'ERROR', 'WARNING'])
  })

  it('Should type and get values correctly', function () {
    const keys: readonly ('Ok' | 'Error' | 'Warning')[] = Enum.values(Status)
    expect(keys).deep.eq(['Ok', 'Error', 'Warning'])
  })

  it('Should type entries and get correctly', function () {
    const entries: (['OK', Status] | ['ERROR', Status] | ['WARNING', Status])[] = Enum.entries(Status)
    expect(entries).deep.eq([['OK', 'Ok'], ['ERROR', 'Error'], ['WARNING', 'Warning']])
  })

  it('Should get value and handle type correctly', function () {
    expect(Enum.getKeyByValue(Status, 'Warning')).eq('WARNING')
    expect(Enum.getKeyByValue(Status, 'unknown value')).to.undefined
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
      Enum.entries(t).map(([k, v]) => {
        const _k: keyof T = k
        const _v: T[keyof T] = v
      })
    }
  })

  it('Should correctly manage Partial<>', function () {
    const test = <T extends Record<any, any>>(t: T) => {
      Enum.entries(t).reduce<T>((acc, [k, v]) => {
        const test = acc[k]
        return acc
      }, {} as T)
    }
  })

  describe.only('transform', function () {

    it('should copy', function () {
      const obj = {
        a: '1',
        b: '2',
      }
      const objCopy: {a: string, b: string} = Enum.transform(obj, (k, v) => [k, v])
      expect(objCopy).deep.eq({a: '1', b: '2'})
    })

    it('should change keys', function () {
      const obj = {
        a: '1',
        b: '2',
      }
      const transformKey = (k: keyof typeof obj): 'aa' | 'ab' => 'a' + k as any
      const objCopy: {aa: string, ab: string,} = Enum.transform(obj, (k, v) => [transformKey(k), v])
      expect(objCopy).deep.eq({aa: '1', ab: '2'})
    })

    it('should change values', function () {
      const obj = {
        a: '1',
        b: '2',
      }
      const objCopy: {a: number, b: number,} = Enum.transform(obj, (k, v) => [k, parseInt(v)])
      expect(objCopy).deep.eq({a: 1, b: 2})
    })
  })


})
