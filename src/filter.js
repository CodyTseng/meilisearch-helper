const {
  checkIsObject,
  checkIsArray,
  isObject,
  isArray,
  isDate,
  checkIsNumberOrDate,
} = require('./utils');

function buildMeiliSearchFilter(filterQuery) {
  checkIsObject(filterQuery, 'Expected an object');

  if (isArray(filterQuery)) {
    return filterQuery.map((f) => buildMeiliSearchFilter(f)).join(' AND ');
  }

  const filters = [];
  for (const [field, condition] of Object.entries(filterQuery)) {
    if (condition === undefined) {
      continue;
    }

    switch (field) {
      case '$or':
        filters.push(parseOrSelector(condition));
        break;
      case '$and':
        filters.push(parseAndSelector(condition));
        break;
      default:
        filters.push(parseQuerySelector(field, condition));
    }
  }
  return filters.join(' AND ');
}

function parseOrSelector(filterQueries) {
  checkIsArray(filterQueries, '$or must be an array');
  return `(${filterQueries
    .map((f) => buildMeiliSearchFilter(f))
    .join(' OR ')})`;
}

function parseAndSelector(filterQueries) {
  checkIsArray(filterQueries, '$and must be an array');
  return filterQueries.map((f) => buildMeiliSearchFilter(f)).join(' AND ');
}

function parseQuerySelector(field, condition) {
  if (!isObject(condition) || isDate(condition)) {
    return translateOperator(field, '$eq', condition);
  }

  if (isArray(condition)) {
    return translateOperator(field, '$in', condition);
  }

  return Object.entries(condition)
    .map(([operator, value]) => translateOperator(field, operator, value))
    .join(' AND ');
}

function translateOperator(field, operator, value) {
  switch (operator) {
    case '$eq':
      return translateEqualOperator(field, value);
    case '$ne':
      return translateNotEqualOperator(field, value);
    case '$gt':
      return translateGreaterThanOperator(field, value);
    case '$gte':
      return translateGreaterThanOrEqualOperator(field, value);
    case '$lt':
      return translateLessThanOperator(field, value);
    case '$lte':
      return translateLessThanOrEqualOperator(field, value);
    case '$in':
      return translateInOperator(field, value);
    case '$nin':
      return translateNotInOperator(field, value);
    case '$exists':
      return translateExistsOperator(field, value);
    case '$empty':
      return translateEmptyOperator(field, value);
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

function translateEqualOperator(field, value) {
  return value === null
    ? `${field} IS NULL`
    : `${field} = ${serializeValue(value)}`;
}

function translateNotEqualOperator(field, value) {
  return value === null
    ? `${field} IS NOT NULL`
    : `${field} != ${serializeValue(value)}`;
}

function translateGreaterThanOperator(field, value) {
  checkIsNumberOrDate(value, '$gt must be a number or a date');
  return `${field} > ${serializeValue(value)}`;
}

function translateGreaterThanOrEqualOperator(field, value) {
  checkIsNumberOrDate(value, '$gte must be a number or a date');
  return `${field} >= ${serializeValue(value)}`;
}

function translateLessThanOperator(field, value) {
  checkIsNumberOrDate(value, '$lt must be a number or a date');
  return `${field} < ${serializeValue(value)}`;
}

function translateLessThanOrEqualOperator(field, value) {
  checkIsNumberOrDate(value, '$lte must be a number or a date');
  return `${field} <= ${serializeValue(value)}`;
}

function translateInOperator(field, value) {
  checkIsArray(value, '$in must be an array');
  return `${field} IN [${value.map((v) => serializeValue(v)).join(', ')}]`;
}

function translateNotInOperator(field, value) {
  checkIsArray(value, '$nin must be an array');
  return `${field} NOT IN [${value.map((v) => serializeValue(v)).join(', ')}]`;
}

function translateExistsOperator(field, value) {
  return value ? `${field} EXISTS` : `${field} NOT EXISTS`;
}

function translateEmptyOperator(field, value) {
  return value ? `${field} IS EMPTY` : `${field} IS NOT EMPTY`;
}

function serializeValue(value) {
  if (isDate(value)) {
    return value.getTime();
  }
  return JSON.stringify(value);
}

module.exports = { buildMeiliSearchFilter };