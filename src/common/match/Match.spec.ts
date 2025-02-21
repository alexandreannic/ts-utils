import {expect} from 'chai'
import {match} from './Match'

describe.only('Match', function () {
  type UnionString = 'yes' | 'no' | 'unknown'

  enum Enum {
    yes = 'yes',
    no = 'no',
    unknown = 'unknown',
  }

  it('Should works when all cases are set', function () {
    const value = 'yes' as UnionString
    const port: number = match(value)
      .cases({
        yes: 1,
        no: 2,
        unknown: 3,
      })
      .exhaustive()
    expect(port).to.eq(1)
  })

  it('Should fall in the default case function', function () {
    const value = 'no' as UnionString
    const port = match(value)
      .cases({
        yes: 1,
      })
      .default(() => 3)
    expect(port).to.eq(3)
  })

  it('Should set undefined', function () {
    const value: Enum | undefined = undefined as any
    const res = match(value)
      .cases({
        [Enum.no]: 1,
        [Enum.yes]: 2,
        [Enum.unknown]: 3,
      })
      .default(-1)
    expect(res).to.eq(-1)
  })

  it('Should throw an error', function () {
    const value = 'something else' as Enum
    try {
      match(value)
        .cases({
          [Enum.unknown]: 'a',
          [Enum.no]: 'b',
          [Enum.yes]: 'c',
        })
        .exhaustive()
      expect(false).eq(true)
    } catch (e: any) {
      expect(true).eq(true)
    }
  })

  it('Should fall in the default case function', function () {
    const value = 'something else' as Enum
    const port = match(value)
      .cases({
        [Enum.yes]: () => 1,
        [Enum.no]: () => 2,
        [Enum.unknown]: () => 3,
      })
      .default(() => undefined)
    expect(port).to.eq(undefined)
  })

  it('Should handle undefined cases', function () {
    const value = Enum.yes as Enum
    const port = match(value)
      .cases({
        [Enum.yes]: undefined,
        [Enum.no]: () => 2,
        [Enum.unknown]: () => 3,
      })
      .default(() => '')
    expect(port).to.eq(undefined)
  })

  it('Should handle fn cases', function () {
    const value = Enum.yes as Enum
    const port = match(value)
      .cases({
        [Enum.yes]: () => 1,
        [Enum.no]: () => 2,
        [Enum.unknown]: () => 3,
      })
      .default(() => '')
    expect(port).to.eq(1)
  })

  it('Should handle value default', function () {
    const value = 'something else' as Enum
    const port = match(value)
      .cases({
        [Enum.yes]: () => 1,
        [Enum.no]: () => 2,
        [Enum.unknown]: () => 3,
      })
      .default('')
    expect(port).to.eq('')
  })
})
