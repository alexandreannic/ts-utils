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
    const test = (t: Partial<typeof status>) => {
      Enum.entries(t).map(([k, v]) => {
        const _k: keyof typeof status = k
        const _v: (typeof status)[keyof typeof status]= v
      })
    }
  })
})
