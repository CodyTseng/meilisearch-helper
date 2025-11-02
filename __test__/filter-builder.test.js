const { describe, it, expect } = require('@jest/globals');
const { MeiliSearchFilterBuilder } = require('../src');

describe('filter-builder', () => {
  it('should return a meilisearch filter string', () => {
    const builder = new MeiliSearchFilterBuilder();

    // normal condition
    expect(builder.where('name', '=', 'John').build()).toBe('name = "John"');
    expect(builder.where('age', '>', 18).build()).toBe('age > 18');
    expect(builder.where('age', '>=', 18).build()).toBe('age >= 18');
    expect(builder.where('age', '<', 18).build()).toBe('age < 18');
    expect(builder.where('age', '<=', 18).build()).toBe('age <= 18');
    expect(builder.where('age', '!=', 18).build()).toBe('age != 18');
    expect(builder.where('name', 'in', ['John', 'Doe']).build()).toBe(
      'name IN ["John", "Doe"]',
    );
    expect(builder.where('name', 'nin', ['John', 'Doe']).build()).toBe(
      'name NOT IN ["John", "Doe"]',
    );
    expect(builder.where('name', 'exists', true).build()).toBe('name EXISTS');
    expect(builder.where('name', 'exists', false).build()).toBe(
      'name NOT EXISTS',
    );
    expect(builder.where('name', 'empty', true).build()).toBe('name IS EMPTY');
    expect(builder.where('name', 'empty', false).build()).toBe(
      'name IS NOT EMPTY',
    );
    expect(builder.where('age', 'between', [18, 30]).build()).toBe(
      'age 18 TO 30',
    );
    expect(
      builder
        .where('createdAt', 'between', ['2025-11-01', '2015-11-02'])
        .build(),
    ).toBe('createdAt "2025-11-01" TO "2015-11-02"');
    expect(
      builder
        .where('createdAt', 'between', [
          new Date('2025-11-01'),
          new Date('2015-11-02').getTime(),
        ])
        .build(),
    ).toBe(
      `createdAt ${new Date('2025-11-01').getTime()} TO ${new Date('2015-11-02').getTime()}`,
    );
    expect(builder.where('name', 'contains', 'John').build()).toBe(
      'name CONTAINS "John"',
    );
    expect(builder.where('name', 'notContains', 'John').build()).toBe(
      'name NOT CONTAINS "John"',
    );
    expect(builder.where('name', 'startsWith', 'John').build()).toBe(
      'name STARTS WITH "John"',
    );
    expect(builder.where('name', 'notStartsWith', 'John').build()).toBe(
      'name NOT STARTS WITH "John"',
    );

    // and
    expect(
      builder.where('name', '=', 'John').where('age', '=', 18).build(),
    ).toBe('name = "John" AND age = 18');
    expect(
      builder
        .where((eb) => eb.and([eb('name', '=', 'John'), eb('age', '=', 18)]))
        .build(),
    ).toBe('name = "John" AND age = 18');

    // or
    expect(
      builder
        .where('name', '=', 'John')
        .where((eb) => eb.or([eb('age', '=', 18), eb('age', '=', 19)]))
        .build(),
    ).toBe('name = "John" AND (age = 18 OR age = 19)');

    // geo
    expect(
      builder.where((eb) => eb.geoRadius(48.870798, 2.316733, 1000)).build(),
    ).toBe('_geoRadius(48.870798, 2.316733, 1000)');
    expect(
      builder
        .where((eb) =>
          eb.geoBoundingBox(
            {
              lat: 45.494181,
              lng: 9.214024,
            },
            {
              lat: 45.449484,
              lng: 9.179175,
            },
          ),
        )
        .build(),
    ).toBe('_geoBoundingBox([45.494181, 9.214024], [45.449484, 9.179175])');

    // complex
    expect(
      builder
        .where((eb) =>
          eb.or([
            eb.or([eb('name', '=', 'John'), eb('name', '=', 'Doe')]),
            eb.and([eb('age', '>', 18), eb('isStudent', '=', true)]),
          ]),
        )
        .where('age', '<', 30)
        .where((eb) => eb.geoRadius(45.472735, 9.184019, 2000))
        .build(),
    ).toBe(
      '((name = "John" OR name = "Doe") OR age > 18 AND isStudent = true) AND age < 30 AND _geoRadius(45.472735, 9.184019, 2000)',
    );
  });

  it('should throw an error when invalid arguments are passed', () => {
    const builder = new MeiliSearchFilterBuilder();

    expect(() => builder.where('name', '=', 'John', 18)).toThrow(
      'Invalid arguments',
    );
  });
});
