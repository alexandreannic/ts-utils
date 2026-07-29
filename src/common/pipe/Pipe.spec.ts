import {expect} from 'chai'
import {pipe} from './Pipe'

describe('Pipe', function() {
  it('get returns the wrapped value', function() {
    const value = pipe({
      name: 'John',
      age: 42,
    }).get()

    expect(value).deep.eq({
      name: 'John',
      age: 42,
    })
  })

  it('map transforms the value', function() {
    const result = pipe(10)
      .map(x => x * 2)
      .get()

    expect(result).eq(20)
  })

  it('map can chain multiple transformations', function() {
    const result = pipe(10)
      .map(x => x * 2)
      .map(x => x.toString())
      .map(x => `value:${x}`)
      .get()

    expect(result).eq('value:20')
  })

  it('map preserves object transformations', function() {
    const result = pipe({
      firstName: 'John',
      lastName: 'Doe',
    })
      .map(user => ({
        ...user,
        fullName: `${user.firstName} ${user.lastName}`,
      }))
      .get()

    expect(result).deep.eq({
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
    })
  })

  it('tap executes side effects and keeps the same value', function() {
    let calledWith: number | undefined

    const result = pipe(42)
      .tap(value => {
        calledWith = value
      })
      .get()

    expect(calledWith).eq(42)
    expect(result).eq(42)
  })

  it('tap can be chained with map', function() {
    const logs: number[] = []

    const result = pipe(1)
      .tap(x => logs.push(x))
      .map(x => x + 1)
      .tap(x => logs.push(x))
      .get()

    expect(logs).deep.eq([1, 2])
    expect(result).eq(2)
  })

  it('chain unwraps another Pipe', function() {
    const result = pipe(10)
      .chain(value => pipe(value * 2))
      .chain(value => pipe(value.toString()))
      .get()

    expect(result).eq('20')
  })

  it('when applies transformation when condition is true', function() {
    const result = pipe(10)
      .when(true, value => value * 2)
      .get()

    expect(result).eq(20)
  })

  it('when does nothing when condition is false', function() {
    const result = pipe(10)
      .when(false, value => value * 2)
      .get()

    expect(result).eq(10)
  })

  it('match returns the first matching case', function() {
    const result = pipe(10)
      .match(
        [
          [
            value => value < 0,
            () => 'negative',
          ],
          [
            value => value > 0,
            () => 'positive',
          ],
        ],
        () => 'zero',
      )
      .get()

    expect(result).eq('positive')
  })

  it('match falls back to otherwise', function() {
    const result = pipe(0)
      .match(
        [
          [
            value => value < 0,
            () => 'negative',
          ],
          [
            value => value > 0,
            () => 'positive',
          ],
        ],
        () => 'zero',
      )
      .get()

    expect(result).eq('zero')
  })

  it('match can transform object values', function() {
    const result = pipe({
      status: 'success',
    })
      .match(
        [
          [
            value => value.status === 'success',
            () => ({ok: true}),
          ],
          [
            value => value.status === 'error',
            () => ({ok: false}),
          ],
        ],
        () => ({ok: false}),
      )
      .get()

    expect(result).deep.eq({
      ok: true,
    })
  })

  it('supports nested Pipe values', function() {
    const result = pipe(pipe(42))
      .map(value => value.get())
      .get()

    expect(result).eq(42)
  })
})
