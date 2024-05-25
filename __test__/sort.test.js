const { buildMeiliSearchSort } = require('../src');

describe('sort', () => {
  it('should return a meilisearch sort array', () => {
    // ascending
    expect(buildMeiliSearchSort({ name: 1 })).toStrictEqual(['name:asc']);
    expect(buildMeiliSearchSort({ name: 'asc' })).toStrictEqual(['name:asc']);
    expect(buildMeiliSearchSort({ name: 'ascending' })).toStrictEqual([
      'name:asc',
    ]);

    // descending
    expect(buildMeiliSearchSort({ name: -1 })).toStrictEqual(['name:desc']);
    expect(buildMeiliSearchSort({ name: 'desc' })).toStrictEqual(['name:desc']);
    expect(buildMeiliSearchSort({ name: 'descending' })).toStrictEqual([
      'name:desc',
    ]);

    // multiple fields
    expect(buildMeiliSearchSort({ name: 1, age: -1 })).toStrictEqual([
      'name:asc',
      'age:desc',
    ]);
    expect(buildMeiliSearchSort({ age: -1, name: 1 })).toStrictEqual([
      'age:desc',
      'name:asc',
    ]);

    // undefined / null
    expect(buildMeiliSearchSort()).toStrictEqual([]);
    expect(buildMeiliSearchSort(null)).toStrictEqual([]);
  });

  it('should throw an error if sort is not an object', () => {
    expect(() => buildMeiliSearchSort('name')).toThrow('Expected an object');
    expect(() => buildMeiliSearchSort(['name'])).toThrow('Expected an object');
  });

  it('should throw an error if direction is invalid', () => {
    expect(() => buildMeiliSearchSort({ name: 'invalid' })).toThrow(
      'Invalid direction: invalid',
    );
  });
});
