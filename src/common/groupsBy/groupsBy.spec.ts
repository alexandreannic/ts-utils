import {expect} from 'chai'
import {groupsBy} from './groupsBy'

describe.only('groupsBy', () => {
  it('should group data by a single key', () => {
    const data = [
      {id: 1, category: 'A', value: 10},
      {id: 2, category: 'B', value: 20},
      {id: 3, category: 'A', value: 15},
      {id: 4, category: 'B', value: 25},
    ]

    const result = groupsBy({
      data,
      groups: [{by: (item) => item.category}],
      finalTransform: (items) => items.reduce((sum, item) => sum + item.value, 0),
    })

    expect(result.groups).to.deep.equal({
      A: 25,
      B: 45,
    })
  })

  it('should group data by multiple keys', () => {
    const data = [
      {id: 1, category: 'A', type: 'X', value: 10},
      {id: 2, category: 'B', type: 'Y', value: 20},
      {id: 3, category: 'A', type: 'Y', value: 15},
      {id: 4, category: 'B', type: 'X', value: 25},
      {id: 5, category: 'A', type: 'X', value: 5},
    ]

    const result = groupsBy({
      data,
      groups: [
        {by: (item) => item.category},
        {by: (item) => item.type},
      ],
      finalTransform: (items) => items.reduce((sum, item) => sum + item.value, 0),
    })

    expect(result.groups).to.deep.equal({
      A: {
        X: 15,
        Y: 15,
      },
      B: {
        X: 25,
        Y: 20,
      },
    })
  })

  it('should sort grouped keys if sorting function is provided', () => {
    const data = [
      {id: 1, category: 'B', value: 10},
      {id: 2, category: 'A', value: 20},
    ]

    const result = groupsBy({
      data,
      groups: [{by: (item) => item.category, sort: (a, b) => a.localeCompare(b)}],
      finalTransform: (items) => items.length,
    })

    expect(Object.keys(result.groups)).to.deep.equal(['A', 'B'])
  })

  it('should return empty groups when given an empty dataset', () => {
    const result = groupsBy({
      data: [],
      groups: [{by: (item: any) => item.category}],
      finalTransform: (items: any) => items.length,
    })

    expect(result.groups).to.deep.equal({})
  })
})
