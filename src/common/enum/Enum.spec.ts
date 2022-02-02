import {Enum} from './Enum'
import {expect} from 'chai'

enum Status {
  OK = 'Ok',
  ERROR = 'Error',
  WARNING = 'Warning',
}

enum XX {
  OK = 'Ok',
  ERROR = 'Error',
  WARNING = 'Warning',
}


describe('Enum', function () {
  it('Should type and get keys correctly', function () {
    const keys: readonly ('OK' | 'ERROR' | 'WARNING')[] = Enum.keys(Status)
    expect(keys).deep.eq(['OK', 'ERROR', 'WARNING'])
  })

  it('Should type and get values correctly', function () {
    const keys: readonly ('Ok' | 'Error' | 'Warning')[] = Enum.values(Status)
    expect(keys).deep.eq(['Ok', 'Error', 'Warning'])
  })

  it('Should type entries and get correctly', function () {
    const entries: (['OK', Status] | ['ERROR', Status] | ['WARNING', 'Warning'])[] = Enum.entries(Status)
    expect(entries).deep.eq([['OK', 'Ok'], ['ERROR', 'Error'], ['WARNING', 'Warning']])
  })

  it('Should get value and handle type correctly', function () {
    expect(Enum.getKeyByValue(Status, 'Warning')).eq('WARNING')
    expect(Enum.getKeyByValue(Status, 'unknown value')).to.undefined
  })
})

