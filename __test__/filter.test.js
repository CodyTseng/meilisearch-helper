const { describe, it, expect } = require('@jest/globals');
const { buildMeiliSearchFilter } = require('../src');

describe('filter', () => {
  it('should return a meilisearch filter string', () => {
    const date = new Date('2000-01-01');
    const timestamp = date.getTime();

    // equal
    expect(buildMeiliSearchFilter({ name: 'John' })).toBe('name = "John"');
    expect(buildMeiliSearchFilter({ name: { $eq: 'John' } })).toBe(
      'name = "John"',
    );
    expect(buildMeiliSearchFilter({ age: 18 })).toBe('age = 18');
    expect(buildMeiliSearchFilter({ age: { $eq: 18 } })).toBe('age = 18');
    expect(buildMeiliSearchFilter({ isStudent: true })).toBe(
      'isStudent = true',
    );
    expect(buildMeiliSearchFilter({ isStudent: { $eq: true } })).toBe(
      'isStudent = true',
    );
    expect(buildMeiliSearchFilter({ birth: date })).toBe(
      `birth = ${timestamp}`,
    );
    expect(buildMeiliSearchFilter({ birth: { $eq: date } })).toBe(
      `birth = ${timestamp}`,
    );
    expect(buildMeiliSearchFilter({ company: null })).toBe('company IS NULL');

    // not equal
    expect(buildMeiliSearchFilter({ name: { $ne: 'John' } })).toBe(
      'name != "John"',
    );
    expect(buildMeiliSearchFilter({ age: { $ne: 18 } })).toBe('age != 18');
    expect(buildMeiliSearchFilter({ isStudent: { $ne: true } })).toBe(
      'isStudent != true',
    );
    expect(buildMeiliSearchFilter({ birth: { $ne: date } })).toBe(
      `birth != ${timestamp}`,
    );
    expect(buildMeiliSearchFilter({ company: { $ne: null } })).toBe(
      'company IS NOT NULL',
    );

    // greater than
    expect(buildMeiliSearchFilter({ age: { $gt: 18 } })).toBe('age > 18');
    expect(buildMeiliSearchFilter({ birth: { $gt: date } })).toBe(
      `birth > ${timestamp}`,
    );
    expect(
      buildMeiliSearchFilter({
        age: {
          $gt: 18,
          $lt: undefined, // should be ignored
        },
      }),
    ).toBe('age > 18');

    // greater than or equal
    expect(buildMeiliSearchFilter({ age: { $gte: 18 } })).toBe('age >= 18');
    expect(buildMeiliSearchFilter({ birth: { $gte: date } })).toBe(
      `birth >= ${timestamp}`,
    );

    // less than
    expect(buildMeiliSearchFilter({ age: { $lt: 18 } })).toBe('age < 18');
    expect(buildMeiliSearchFilter({ birth: { $lt: date } })).toBe(
      `birth < ${timestamp}`,
    );

    // less than or equal
    expect(buildMeiliSearchFilter({ age: { $lte: 18 } })).toBe('age <= 18');
    expect(buildMeiliSearchFilter({ birth: { $lte: date } })).toBe(
      `birth <= ${timestamp}`,
    );

    // in
    expect(buildMeiliSearchFilter({ name: { $in: ['John', 'Doe'] } })).toBe(
      'name IN ["John", "Doe"]',
    );
    expect(buildMeiliSearchFilter({ name: ['John', 'Doe'] })).toBe(
      'name IN ["John", "Doe"]',
    );

    // not in
    expect(buildMeiliSearchFilter({ name: { $nin: ['John', 'Doe'] } })).toBe(
      'name NOT IN ["John", "Doe"]',
    );

    // exists
    expect(buildMeiliSearchFilter({ name: { $exists: true } })).toBe(
      'name EXISTS',
    );
    expect(buildMeiliSearchFilter({ name: { $exists: false } })).toBe(
      'name NOT EXISTS',
    );

    // empty
    expect(buildMeiliSearchFilter({ name: { $empty: true } })).toBe(
      'name IS EMPTY',
    );
    expect(buildMeiliSearchFilter({ name: { $empty: false } })).toBe(
      'name IS NOT EMPTY',
    );

    // and
    expect(
      buildMeiliSearchFilter({ $and: [{ name: 'John' }, { age: 18 }] }),
    ).toBe('name = "John" AND age = 18');
    expect(buildMeiliSearchFilter([{ name: 'John' }, { age: 18 }])).toBe(
      'name = "John" AND age = 18',
    );

    // between
    expect(buildMeiliSearchFilter({ age: { $between: [18, 30] } })).toBe(
      'age 18 TO 30',
    );

    // contains
    expect(buildMeiliSearchFilter({ name: { $contains: 'John' } })).toBe(
      'name CONTAINS "John"',
    );
    expect(buildMeiliSearchFilter({ name: { $notContains: 'John' } })).toBe(
      'name NOT CONTAINS "John"',
    );

    // startsWith
    expect(buildMeiliSearchFilter({ name: { $startsWith: 'John' } })).toBe(
      'name STARTS WITH "John"',
    );
    expect(buildMeiliSearchFilter({ name: { $notStartsWith: 'John' } })).toBe(
      'name NOT STARTS WITH "John"',
    );

    // or
    expect(
      buildMeiliSearchFilter({ $or: [{ name: 'John' }, { age: 18 }] }),
    ).toBe('(name = "John" OR age = 18)');

    // geo
    expect(
      buildMeiliSearchFilter({
        $geoRadius: {
          lat: 45.472735,
          lng: 9.184019,
          distanceInMeters: 2000,
        },
      }),
    ).toBe('_geoRadius(45.472735, 9.184019, 2000)');
    expect(
      buildMeiliSearchFilter({
        $geoRoundingBox: {
          topRight: {
            lat: 45.494181,
            lng: 9.214024,
          },
          bottomLeft: {
            lat: 45.449484,
            lng: 9.179175,
          },
        },
      }),
    ).toBe('_geoBoundingBox([45.494181, 9.214024], [45.449484, 9.179175])');

    // complex
    expect(
      buildMeiliSearchFilter({
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
      }),
    ).toBe(
      '((name = "John" OR name = "Doe") OR age > 18 AND isStudent = true) AND age < 30 AND _geoRadius(45.472735, 9.184019, 2000)',
    );
  });

  it('some special cases', () => {
    expect(buildMeiliSearchFilter({ name: undefined, age: { $gt: 18 } })).toBe(
      'age > 18',
    );
  });

  it('should throw an error', () => {
    expect(() =>
      buildMeiliSearchFilter({ name: { $unsupported: 'John' } }),
    ).toThrow('Unsupported operator: $unsupported');
    expect(() => buildMeiliSearchFilter({ age: { $gt: 'a' } })).toThrow(
      '$gt must be a number or a date',
    );
    expect(() => buildMeiliSearchFilter(undefined)).toThrow(
      'Expected an object',
    );
    expect(() => buildMeiliSearchFilter({ age: { $in: 'a' } })).toThrow(
      '$in must be an array',
    );
    expect(() => buildMeiliSearchFilter({ age: { $nin: 'a' } })).toThrow(
      '$nin must be an array',
    );
    expect(() => buildMeiliSearchFilter({ age: { $between: 1 } })).toThrow(
      '$between must be an array',
    );
    expect(() => buildMeiliSearchFilter({ age: { $between: [1] } })).toThrow(
      '$between must have two elements',
    );
    expect(() =>
      buildMeiliSearchFilter({ age: { $between: [1, 'a'] } }),
    ).toThrow('$between must be an array of numbers or dates');
    expect(() => buildMeiliSearchFilter({ name: { $contains: 1 } })).toThrow(
      '$contains must be a string',
    );
    expect(() => buildMeiliSearchFilter({ name: { $notContains: 1 } })).toThrow(
      '$notContains must be a string',
    );
    expect(() => buildMeiliSearchFilter({ name: { $startsWith: 1 } })).toThrow(
      '$startsWith must be a string',
    );
    expect(() =>
      buildMeiliSearchFilter({ name: { $notStartsWith: 1 } }),
    ).toThrow('$notStartsWith must be a string');
    expect(() => buildMeiliSearchFilter({ $or: 'a' })).toThrow(
      '$or must be an array',
    );
    expect(() => buildMeiliSearchFilter({ $and: 'a' })).toThrow(
      '$and must be an array',
    );
    expect(() => buildMeiliSearchFilter({ $geoRadius: 'a' })).toThrow(
      '$geoRadius must be an object',
    );
    expect(() => buildMeiliSearchFilter({ $geoRoundingBox: 'a' })).toThrow(
      '$geoBoundingBox must be an object',
    );
    expect(() => buildMeiliSearchFilter({ $geoRadius: { lat: 'a' } })).toThrow(
      '$geoRadius.lat must be a number',
    );
  });
});
