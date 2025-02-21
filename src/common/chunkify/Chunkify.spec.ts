import {expect} from 'chai'
import {chunkify} from './Chunkify'
import {getTime} from '../lazy/Lazy.spec'
import {sleep} from '../delay/Delay'

describe('chunkify', () => {
  it('should split data into chunks of the specified size and process without concurrency', async () => {
    let callCount = 0
    const t0 = getTime()

    const result = await chunkify({
      size: 2,
      data: [1, 2, 3, 4, 5],
      concurrency: 1,
      fn: async (d: number[]) => {
        await sleep(1000)
        callCount++
        return d.map(_ => _ * 2)
      },
    })

    expect(result).to.deep.equal([[2, 4], [6, 8], [10]])
    expect(callCount).to.equal(3)
    expect(getTime() - t0).to.deep.equal(3)
  })

  it('should split data into chunks of the specified size and process with concurrency', async () => {
    let callCount = 0
    const t0 = getTime()

    const result = await chunkify({
      size: 3,
      data: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      fn: async (d: number[]) => {
        await sleep(1000)
        callCount++
        return d.map(_ => _ * 2)
      },
      concurrency: 3,
    })

    expect(result).to.deep.equal([
      [2, 4, 6],
      [8, 10, 12],
      [14, 16, 18],
    ])
    expect(callCount).to.equal(3)
    expect(getTime() - t0).to.deep.equal(1)
  })

  it('should handle an empty data array', async () => {
    const data = []
    const size = 2

    const result = await chunkify({
      size: 2,
      data: [],
      fn: async d => d,
    })

    expect(result).to.deep.equal([])
  })

  it('should handle a size larger than the data array', async () => {
    const result = await chunkify({
      size: 10,
      data: [1, 2, 3],
      fn: async d => d.map(_ => _ * 2),
    })
    expect(result).to.deep.equal([[2, 4, 6]])
  })

  it('should process all chunks even if size is 1', async () => {
    let callCount = 0
    const result = await chunkify({
      size: 1,
      data: [1, 2, 3],
      fn: async d => {
        callCount++
        return d.map(_ => _ * 2)
      },
    })

    expect(result).to.deep.equal([[2], [4], [6]])

    expect(callCount).to.equal(3)
  })
})
