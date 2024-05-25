const { checkIsObject, isArray, checkIsNumber } = require('./utils');

function buildMeiliSearchSort(sort) {
  if (sort == null) {
    return [];
  }

  checkIsObject(sort, 'Expected an object');

  if (isArray(sort)) {
    throw new Error('Expected an object');
  }

  return Object.entries(sort).map(([field, direction]) =>
    field === '_geoPoint'
      ? parseGeoPointSort(direction)
      : `${field}:${prepareDirection(direction)}`,
  );
}

function parseGeoPointSort(obj) {
  checkIsObject(obj, '_geoPoint must be an object');

  const { lat, lng, direction } = obj;
  checkIsNumber(lat, 'lat must be a number');
  checkIsNumber(lng, 'lng must be a number');

  return `_geoPoint(${lat}, ${lng}):${prepareDirection(direction)}`;
}

function prepareDirection(direction = 1) {
  const value = `${direction}`.toLowerCase();
  switch (value) {
    case 'ascending':
    case 'asc':
    case '1':
      return 'asc';
    case 'descending':
    case 'desc':
    case '-1':
      return 'desc';
    default:
      throw new Error(`Invalid direction: ${direction}`);
  }
}

module.exports = { buildMeiliSearchSort };
