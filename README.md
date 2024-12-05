# meilisearch-helper

[![codecov](https://codecov.io/gh/CodyTseng/meilisearch-helper/graph/badge.svg?token=3BNYXXCCJP)](https://codecov.io/gh/CodyTseng/meilisearch-helper)

> A helper library for meilisearch-js that provides convenient utility methods to simplify common operations and enhance your Meilisearch experience.

## Installation

```bash
npm install meilisearch-helper
```

## Usage

### Filter

There are two ways to build a [MeiliSearch filter](https://www.meilisearch.com/docs/learn/fine_tuning_results/filtering):

1. Use the `buildMeiliSearchFilter` function to build a filter from a MongoDB-style filter object.
2. Use the `MeiliSearchFilterBuilder` class to build a filter with a fluent API.

> Note:
> `CONTAINS` and `STARTS WITH` are experimental features. Use the experimental features endpoint to enable them. More details can be found in the [MeiliSearch documentation](https://www.meilisearch.com/docs/learn/filtering_and_sorting/filter_expression_reference#contains).

#### `buildMeiliSearchFilter`

```typescript
import { buildMeiliSearchFilter } from 'meilisearch-helper';

type FilterableAttributes = 'name' | 'age' | 'isStudent';

const filter = buildMeiliSearchFilter<FilterableAttributes>({
  $or: [
    { $or: [{ name: 'John' }, { name: 'Doe' }] },
    { $and: [{ age: { $gt: 18 } }, { isStudent: true }] },
  ],
  age: { $lt: 30 },
  $geoRadius: {
    lat: 45.472735,
    lng: 9.184019,
    distanceInMeters: 2000,
  },
});

console.log(filter);
// => ((name = "John" OR name = "Doe") OR age > 18 AND isStudent = true) AND age < 30 AND _geoRadius(45.472735, 9.184019, 2000)
```

Supported operators:

- `$eq`: Equal, e.g.
  - `{ name: { $eq: 'John' } }` => `name = "John"`
  - `{ name: 'John' }` => `name = "John"`
- `$ne`: Not equal, e.g.
  - `{ name: { $ne: 'John' } }` => `name != "John"`
- `$gt`: Greater than, e.g.
  - `{ age: { $gt: 18 } }` => `age > 18`
- `$gte`: Greater than or equal, e.g.
  - `{ age: { $gte: 18 } }` => `age >= 18`
- `$lt`: Less than, e.g.
  - `{ age: { $lt: 18 } }` => `age < 18`
- `$lte`: Less than or equal, e.g.
  - `{ age: { $lte: 18 } }` => `age <= 18`
- `$in`: In, e.g.
  - `{ name: { $in: ['John', 'Doe'] } }` => `name IN ["John", "Doe"]`
  - `{ name: ['John', 'Doe'] }` => `name IN ["John", "Doe"]`
- `$nin`: Not in, e.g.
  - `{ name: { $nin: ['John', 'Doe'] } }` => `name NOT IN ["John", "Doe"]`
- `$exists`: Exists, e.g.
  - `{ name: { $exists: true } }` => `name EXISTS`
  - `{ name: { $exists: false } }` => `name NOT EXISTS`
- `$empty`: Empty, e.g.
  - `{ name: { $empty: true } }` => `name IS EMPTY`
  - `{ name: { $empty: false } }` => `name IS NOT EMPTY`
- `$between`: Between, e.g.
  - `{ age: { $between: [18, 30] } }` => `age 18 TO 30`
- `$contains`: (Experimental) Contains, e.g.
  - `{ name: { $contains: 'John' } }` => `name CONTAINS "John"`
- `$notContains`: (Experimental) Not contains, e.g.
  - `{ name: { $notContains: 'John' } }` => `name NOT CONTAINS "John"`
- `$startsWith`: (Experimental) Starts with, e.g.
  - `{ name: { $startsWith: 'John' } }` => `name STARTS WITH "John"`
- `$notStartsWith`: (Experimental) Not starts with, e.g.
  - `{ name: { $notStartsWith: 'John' } }` => `name NOT STARTS WITH "John"`
- `$or`: Or, e.g.
  - `{ $or: [{ name: 'John' }, { name: 'Doe' }] }` => `(name = "John" OR name = "Doe")`
- `$and`: And, e.g.
  - `{ $and: [{ age: { $gt: 18 } }, { isStudent: true }] }` => `age > 18 AND isStudent = true`
- `$geoRadius`: Geo radius, e.g.
  - `{ $geoRadius: { lat: 45.472735, lng: 9.184019, distanceInMeters: 2000 } }` => `_geoRadius(45.472735, 9.184019, 2000)`
- `$geoBoundingBox`: Geo bounding box, e.g.
  - `{ $geoBoundingBox: { topRight: { lat: 45.472735, lng: 9.184019 }, bottomLeft: { lat: 45.472735, lng: 9.184019 } } }` => `_geoBoundingBox([45.472735, 9.184019], [45.472735, 9.184019])`

More examples can be found in the [tests](./__test__/filter.test.js).

#### `MeiliSearchFilterBuilder`

Simple example:

```typescript
import { MeiliSearchFilterBuilder } from 'meilisearch-helper';

type Person = {
  name: string;
  age: number;
  isStudent: boolean;
};
type FilterableAttributes = keyof Person;

function buildFilter(query: Partial<Person>) {
  let builder = new MeiliSearchFilterBuilder<FilterableAttributes>();

  if (query.name) {
    builder = builder.where('name', '=', query.name); // MeiliSearchFilterBuilder is immutable, you must re-assign!
  }

  if (query.age) {
    builder = builder.where('age', '=', query.age);
  }

  if (query.isStudent) {
    builder = builder.where('isStudent', '=', query.isStudent);
  }

  return builder.build();
}

console.log(buildFilter({ name: 'John', age: 20, isStudent: true }));
// => name = "John" AND age = 20 AND isStudent = true
```

Complex example:

```typescript
import { MeiliSearchFilterBuilder } from 'meilisearch-helper';

type FilterableAttributes = 'name' | 'age' | 'isStudent';

// eb is a function to build a simple filter expression, more details below
const filter = new MeiliSearchFilterBuilder<FilterableAttributes>()
  .where((eb) =>
    eb.or([
      eb.or([eb('name', '=', 'John'), eb('name', '=', 'Doe')]),
      eb.and([eb('age', '>', 18), eb('isStudent', '=', true)]),
    ]),
  )
  .where('age', '<', 30)
  .where((eb) => eb.geoRadius(45.472735, 9.184019, 2000))
  .build();

console.log(filter);
// => ((name = "John" OR name = "Doe") OR age > 18 AND isStudent = true) AND age < 30 AND _geoRadius(45.472735, 9.184019, 2000)
```

`eb` (expression builder): A function to build a simple filter expression.

- `eb(lhs: FilterableAttributes, operator: FilterBuilderOperator, rhs: BaseValueTypes | BaseValueTypes[]): string`: Build a simple filter expression.

```typescript
eb('age', '>', 18); // => age > 18
```

- `eb.or(expressions: string[]): string`: Combine multiple expressions with `OR`.

```typescript
eb.or([eb('age', '>', 18), 'isStudent = true']); // => (age > 18 OR isStudent = true)
```

- `eb.and(expressions: string[]): string`: Combine multiple expressions with `AND`

```typescript
eb.and([eb('age', '>', 18), 'isStudent = true']); // => age > 18 AND isStudent = true
```

- `eb.geoRadius(lat: number, lng: number, distanceInMeters: number): string`: Build a geo radius filter expression.

```typescript
eb.geoRadius(45.472735, 9.184019, 2000); // => _geoRadius(45.472735, 9.184019, 2000)
```

- `eb.geoBoundingBox(topRight: { lat: number; lng: number }, bottomLeft: { lat: number; lng: number }): string`: Build a geo bounding box filter expression.

```typescript
eb.geoBoundingBox(
  { lat: 45.472735, lng: 19.184019 },
  { lat: 25.472735, lng: 9.184019 },
); // => _geoBoundingBox([45.472735, 19.184019], [25.472735, 9.184019])
```

supported operators:

- `=`: Equal, e.g.
  - `.where('name', '=', 'John')` => `name = "John"`
- `!=`: Not equal, e.g.
  - `.where('name', '!=', 'John')` => `name != "John"`
- `>`: Greater than, e.g.
  - `.where('age', '>', 18)` => `age > 18`
- `>=`: Greater than or equal, e.g.
  - `.where('age', '>=', 18)` => `age >= 18`
- `<`: Less than, e.g.
  - `.where('age', '<', 18)` => `age < 18`
- `<=`: Less than or equal, e.g.
  - `.where('age', '<=', 18)` => `age <= 18`
- `in`: In, e.g.
  - `.where('name', 'in', ['John', 'Doe'])` => `name IN ["John", "Doe"]`
- `nin`: Not in, e.g.
  - `.where('name', 'nin', ['John', 'Doe'])` => `name NOT IN ["John", "Doe"]`
- `exists`: Exists, e.g.
  - `.where('name', 'exists', true)` => `name EXISTS` or `.where('name', 'exists', false)` => `name NOT EXISTS`
- `empty`: Empty, e.g.
  - `.where('name', 'empty', true)` => `name IS EMPTY` or `.where('name', 'empty', false)` => `name IS NOT EMPTY`
- `between`: Between, e.g.
  - `.where('age', 'between', [18, 30])` => `age 18 TO 30`
- `contains`: (Experimental) Contains, e.g.
  - `.where('name', 'contains', 'John')` => `name CONTAINS "John"`
- `notContains`: (Experimental) Not contains, e.g.
  - `.where('name', 'notContains', 'John')` => `name NOT CONTAINS "John"`
- `startsWith`: (Experimental) Starts with, e.g.
  - `.where('name', 'startsWith', 'John')` => `name STARTS WITH "John"`
- `notStartsWith`: (Experimental) Not starts with, e.g.
  - `.where('name', 'notStartsWith', 'John')` => `name NOT STARTS WITH "John"`

More examples can be found in the [tests](./__test__/filter-builder.test.js).

## Sort

### `buildMeiliSearchSort`

Build a [MeiliSearch sort](https://docs.meilisearch.com/references/search.html#sort) from an object.

```typescript
import { buildMeiliSearchSort } from 'meilisearch-helper';

type SortableAttributes = 'name' | 'age';

const sort = buildMeiliSearchSort<SortableAttributes>({
  name: 1,
  age: -1,
  _geoPoint: { lat: 48.8561446, lng: 2.2978204, direction: 1 },
});

console.log(sort);
// => [ "name:asc", "age:desc", "_geoPoint(48.8561446, 2.2978204):asc" ]
```

More examples can be found in the [tests](./__test__/sort.test.js).

Supported directions:

- Ascending: `1`, `asc`, `ascending`
- Descending: `-1`, `desc`, `descending`

## License

MIT
