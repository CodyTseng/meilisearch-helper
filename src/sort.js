const { checkIsObject, isArray } = require('./utils');

function buildMeiliSearchSort(sort) {
  if (sort == null) {
    return [];
  }

  checkIsObject(sort, 'Expected an object');

  if (isArray(sort)) {
    throw new Error('Expected an object');
  }

  return Object.entries(sort).map(
    ([field, direction]) => `${field}:${prepareDirection(direction)}`,
  );
}

function prepareDirection(direction) {
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
