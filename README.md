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
    { name: 'John', age: { $gt: 18 } },
    { name: 'Doe', age: { $gt: 20 } },
  ],
  isStudent: true,
});
// => (name = "John" AND age > 18 OR name = "Doe" AND age > 20) AND isStudent = true
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

### `buildMeiliSearchSort`

Build a [MeiliSearch sort](https://docs.meilisearch.com/references/search.html#sort) from an object.

```typescript
import { buildMeiliSearchSort } from 'meilisearch-helper';

type SortableAttributes = 'name' | 'age';

buildMeiliSearchSort<SortableAttributes>({
  name: 1,
  age: -1,
});
// => [ "name:asc", "age:desc" ]
```

More examples can be found in the [tests](./__test__/sort.test.js).

Supported directions:

- Ascending: `1`, `asc`, `ascending`
- Descending: `-1`, `desc`, `descending`

## License

MIT
