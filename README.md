# meilisearch-helper

[![codecov](https://codecov.io/gh/CodyTseng/meilisearch-helper/graph/badge.svg?token=3BNYXXCCJP)](https://codecov.io/gh/CodyTseng/meilisearch-helper)

> A helper library for meilisearch-js that provides convenient utility methods to simplify common operations and enhance your Meilisearch experience.

## Installation

```bash
npm install meilisearch-helper
```

## API

### `buildMeiliSearchFilter`

Build a [MeiliSearch filter](https://www.meilisearch.com/docs/learn/fine_tuning_results/filtering) from a MongoDB-style filter object.

```typescript
import { buildMeiliSearchFilter } from 'meilisearch-helper';

type FilterableAttributes = 'name' | 'age' | 'isStudent';

buildMeiliSearchFilter<FilterableAttributes>({
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
// => ((name = "John" OR name = "Doe") OR age > 18 AND isStudent = true) AND age < 30 AND _geoRadius(45.472735, 9.184019, 2000)
```

More examples can be found in the [tests](./__test__/filter.test.js).

Supported operators:

- `$eq`: Equal - `=`
- `$ne`: Not equal - `!=`
- `$gt`: Greater than - `>`
- `$gte`: Greater than or equal - `>=`
- `$lt`: Less than - `<`
- `$lte`: Less than or equal - `<=`
- `$in`: In - `IN`
- `$nin`: Not in - `NOT IN`
- `$exists`: Exists - `EXISTS`
- `$empty`: Empty - `EMPTY`
- `$or`: Or - `OR`
- `$and`: And - `AND`
- `$geoRadius`: Geo radius - `_geoRadius`
- `$geoBoundingBox`: Geo bounding box - `_geoBoundingBox`

### `buildMeiliSearchSort`

Build a [MeiliSearch sort](https://docs.meilisearch.com/references/search.html#sort) from an object.

```typescript
import { buildMeiliSearchSort } from 'meilisearch-helper';

type SortableAttributes = 'name' | 'age';

buildMeiliSearchSort<SortableAttributes>({
  name: 1,
  age: -1,
  _geoPoint: { lat: 48.8561446, lng: 2.2978204, direction: 1 },
});
// => [ "name:asc", "age:desc", "_geoPoint(48.8561446, 2.2978204):asc" ]
```

More examples can be found in the [tests](./__test__/sort.test.js).

Supported directions:

- Ascending: `1`, `asc`, `ascending`
- Descending: `-1`, `desc`, `descending`

## License

MIT
