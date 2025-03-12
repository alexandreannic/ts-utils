# ts-utils ![npm](https://img.shields.io/npm/v/@axanc/ts-utils)

## About

Lightweight TypeScript utility library offering a collection of essential functions to simplify common coding tasks. Designed for **a maximized type-safety**, efficiency, readability, and maintainability.

## Install

```
npm install --save @axanc/ts-utils
```

## Examples

Components from `browser/` and `node/` directory only works in their related environment.

- [Obj](#obj) – Utility functions for `Object` manipulation.
- [Seq](#seq) – Enhanced `Array`
- [Match](#match) – Type-safe pattern matching for `Enum` and string unions.
- [GroupsBy](#groupsby) – Groups an array of objects by multiple criteria and maps the results.
- [Chunkify](#chunkify) – Processes an array in batches with an asynchronous function, supporting concurrency control.
- [Lazy](#lazy) – Caches function results to prevent redundant calls.
- [Gzip](#gzip) – Compress and decompress files (Node.js only).
- [FileSplitter](#filesplitter) – Splits a large file into smaller chunks (Node.js only).


### Obj

TypeScript refuses to infer types from `Object` constructor functions. `Obj` implements the same method but infer keys and value to prevent annoying and unnecessary type casting.

```ts
// Get union string from keys
const input = {a: 1, b: 2}
Object.keys(input)        // → string[]
Obj.keys(input)           // → ('a' | 'b')[]
// Handle enum
enum Status { OK = 'Ok', ERROR = 'Error' }

Obj.values(Status)  // → Status[]
```

Additionally, it includes helper functions and can be used as a class constructor to enable method chaining.

```ts
const res = new Obj({ironman: 2, barman: 1, catwoman: 4, batman: 3})
  .sortManual(['catwoman', 'barman', 'ironman', 'batman'])  // Values are inferred
  .mapKeys(_ => _.toUpperCase())
  .mapValues(_ => _ + 1)
  .get() // → {BARMAN: 2, IRONMAN: 3, BATMAN: 4, CATWOMAN: 5}
```

### Seq

Enhance poor JavaScript `Array`.

```ts
const a = seq([
  {name: 'Dave', age: 35},
  {name: 'Charlie', age: 25},
  {name: 'Alice', age: 25},
])
a.distinct(_ => _.age)                // → [{name: 'Dave', age: 35}, {name: 'Bob', age: 30}]
a.sortByString(_ => _.name, 'z-a')    // → [{name: 'Alice', age: 25}, {name: 'Charlie', age: 25}, {name: 'Dave', age: 35}]
a.sortByNumber(_ => _.age, '0-9')     // → [{name: 'Charlie', age: 25}, {name: 'Alice', age: 25}, {name: 'Dave', age: 35}]
a.count(_ => _.age > 26)              // → 1
a.groupBy(_ => _.age)                 // → {25: [{name: 'Charlie', age: 25}, {name: 'Alice', age: 25}], 35: [{name: 'Dave', age: 35}]}
a.groupByFirst(_ => _.age)            // → {25: {name: 'Charlie', age: 25}, 35: {name: 'Dave', age: 35}}
a.groupByFirstAndApply(_ => _.age, _ => _.length) // →  {25: 2, 35: 1}
a.sum(_ => _.age)                     // → 85
a.head()                              // → {name: 'Dave', age: 35}
a.last()                              // → {name: 'Alice', age: 25}
a.reduceObject(_ => [_.name, _.age])  // → {Dave: 35, Charlie: 25, Alice: 25}
a.percent(_ => _.age === 35)          // → 33.33..%  
[1, 2].difference([1, 2, 3])          // → [3]
[1, 2].intersect([1, 2, 3])           // → [1, 2]
```

### Match

Simple and type-safe pattern matching. Fully infer `Enum` and strings union.

```ts
enum Enum {
  yes = 'yes',
  no = 'no',
  unknown = 'unknown',
}

const value = Enum.yes

const res: number = match(value)
  .cases({
    [Enum.yes]: 0,
  })
  .default(() => -1) // → number

match(value)
  .cases({
    // Cases can only contains keys of related type
    [Enum.yes]: () => 1,
    [Enum.no]: () => 2,
    [Enum.unknown]: () => 3,
  })
  .exhaustive() // .exhaustive can only be called if all cases are defined
```

### GroupsBy

Groups an array of objects by multiple criteria and maps the results.

```ts
const data = [
  {id: 1, category: 'A', type: 'X', value: 10},
  {id: 2, category: 'B', type: 'Y', value: 20},
  {id: 3, category: 'A', type: 'Y', value: 15},
  {id: 4, category: 'B', type: 'X', value: 25},
  {id: 5, category: 'A', type: 'X', value: 5},
]

const result = groupsBy({
  data,
  groups: [{by: item => item.category}, {by: item => item.type}],
  finalTransform: items => items.reduce((sum, item) => sum + item.value, 0),
})

// result → {
//   A: { X: 15, Y: 15 },
//   B: { X: 25, Y: 20 },
// }
```

### Chunkify

Processes an array of items in batches, applying an asynchronous function `fn` to each chunk.
It supports optional concurrency control for optimized parallel execution.

```ts
await chunkify({
  size: 10,
  data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  fn: async chunk => {
    await db.insert(chunk) // Simulate a database with a batch insert limit
    return chunk.map(_ => _ * 2)
  },
})
// → [[2, 4, 6, 8, 10], [12, 14, 16, 18, 20], [22, 24]]
```

### Lazy

Caches function results based on parameters to avoid redundant calls.

```ts
const findByUserId = lazy((id: number) => {
  return users.find(_ => _.id === id)
})
findByUserId(1) // Actual call
findByUserId(1) // Retrieved from cache
findByUserId(2) // Actual call
```

### Gzip

> [!IMPORTANT]  
> **Note:** Only available on Node environment.

```ts
await gunzipFile(`${fixturePath}/zipped.gz`)
await gzipFile(`${fixturePath}/notzipped`)
```

### FileSplitter

> [!IMPORTANT]  
> **Note:** Only available on Node environment.

```ts
const splitFiles = await fileSplitter({
  filepath: 'large.txt',
  maxFileSizeMB: 5,
  outputDirPath: '.', // Optional
})
```
