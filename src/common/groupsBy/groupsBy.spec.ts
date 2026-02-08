import {groupsBy} from './GroupsBy'
import {expect} from 'chai'

type Row = {
  country: string
  city: string
  category: string
  value: number
}

const data: Row[] = [
  {country: 'France', city: 'Paris', category: 'A', value: 10},
  {country: 'France', city: 'Paris', category: 'B', value: 20},
  {country: 'France', city: 'Lyon', category: 'A', value: 5},
  {country: 'Spain', city: 'Madrid', category: 'A', value: 7},
]

describe.only('groupsByFlat', () => {
  it('groups by one field', async () => {
    const res = await groupsBy({
      data,
      groups: [{by: r => r.country}],
      finalTransform: rows => rows.sum(r => r.value),
    })

    expect(res).to.deep.equal([
      {groups: ['France'], groupedData: 35},
      {groups: ['Spain'], groupedData: 7},
    ])
  })

  it('groups by two fields', async () => {
    const res = await groupsBy({
      data,
      groups: [{by: r => r.country}, {by: r => r.city}],
      finalTransform: rows => rows.sum(r => r.value),
    })

    expect(res).to.deep.equal([
      {groups: ['France', 'Lyon'], groupedData: 5},
      {groups: ['France', 'Paris'], groupedData: 30},
      {groups: ['Spain', 'Madrid'], groupedData: 7},
    ])
  })

  it('supports sorting', async () => {
    const res = await groupsBy({
      data,
      groups: [
        {
          by: r => r.country,
          sort: (a, b) => String(b).localeCompare(String(a)), // reverse
        },
      ],
      finalTransform: rows => rows.length,
    })

    expect(res.map(r => r.groups[0])).to.deep.equal(['Spain', 'France'])
  })

  it('supports async transform', async () => {
    const res = await groupsBy({
      data,
      groups: [{by: r => r.category}],
      finalTransform: async rows => {
        await new Promise(r => setTimeout(r, 10))
        return rows.length
      },
    })

    expect(res).to.deep.equal([
      {groups: ['A'], groupedData: 3},
      {groups: ['B'], groupedData: 1},
    ])
  })

  it('returns empty array for empty input', async () => {
    const res = await groupsBy({
      data: [],
      groups: [{by: (r: Row) => r.country}],
      finalTransform: rows => rows.length,
    })

    expect(res).to.deep.equal([])
  })
})
