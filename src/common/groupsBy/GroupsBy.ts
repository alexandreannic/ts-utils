import {seq, Seq} from '../seq/Seq'
import {Obj} from '../obj/Obj'

type GroupByKey = string | number

type GroupDef<T, Prev extends any[]> = {
  by: (item: T, groups: Prev) => GroupByKey
  sort?: (a: GroupByKey, b: GroupByKey) => number
}

type ExtractGroups<G extends readonly any[]> = {
  [K in keyof G]: G[K] extends GroupDef<any, any> ? ReturnType<G[K]['by']> : never
}

type GroupsByRow<G extends readonly any[], R> = {
  groups: ExtractGroups<G>
  groupedData: R
}

export async function groupsBy<T, G extends readonly GroupDef<T, any[]>[], R>(params: {
  data: T[]
  groups: G
  finalTransform: (rows: Seq<T>, groups: ExtractGroups<G>) => Promise<R> | R
}): Promise<GroupsByRow<G, R>[]> {
  const {data, groups, finalTransform} = params

  const rows: GroupsByRow<G, R>[] = []

  const recurse = async (rowsData: T[], depth: number, collected: GroupByKey[]) => {
    // LEAF
    if (depth === groups.length) {
      const result = await finalTransform(seq(rowsData), collected as any)

      rows.push({
        groups: [...collected] as ExtractGroups<G>,
        groupedData: result,
      })

      return
    }

    const group = groups[depth]

    const grouped = seq(rowsData).groupBy(row => group.by(row, collected))

    const ordered = new Obj(grouped)
      .sort(([a], [b]) => (group.sort ? group.sort(a, b) : String(a).localeCompare(String(b))))
      .get()

    for (const [key, subset] of Object.entries(ordered)) {
      await recurse(subset, depth + 1, [...collected, key])
    }
  }

  await recurse(data, 0, [])

  return rows
}
