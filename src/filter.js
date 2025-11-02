const {
  checkIsObject,
  checkIsArray,
  isObject,
  isArray,
  isDate,
  checkIsNumberOrDate,
  checkIsNumber,
  checkIsString,
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
        filters.push(formatOrGroup(condition));
        break;
      case '$and':
        filters.push(formatAndGroup(condition));
        break;
      case '$geoRadius':
        filters.push(formatGeoRadiusCondition(condition));
        break;
      case '$geoRoundingBox':
        filters.push(formatGeoBoundingBoxCondition(condition));
        break;
      default:
        filters.push(parseComparisonConditions(field, condition));
    }
  }
  return filters.join(' AND ');
}

function formatOrGroup(filterQueries) {
  checkIsArray(filterQueries, '$or must be an array');
  return `(${filterQueries
    .map((f) => buildMeiliSearchFilter(f))
    .join(' OR ')})`;
}

function formatAndGroup(filterQueries) {
  checkIsArray(filterQueries, '$and must be an array');
  return filterQueries.map((f) => buildMeiliSearchFilter(f)).join(' AND ');
}

function formatGeoRadiusCondition(condition) {
  checkIsObject(condition, '$geoRadius must be an object');

  const { lat, lng, distanceInMeters } = condition;
  checkIsNumber(lat, '$geoRadius.lat must be a number');
  checkIsNumber(lng, '$geoRadius.lng must be a number');
  checkIsNumber(
    distanceInMeters,
    '$geoRadius.distanceInMeters must be a number',
  );

  return `_geoRadius(${lat}, ${lng}, ${distanceInMeters})`;
}

function formatGeoBoundingBoxCondition(condition) {
  checkIsObject(condition, '$geoBoundingBox must be an object');

  const { topRight, bottomLeft } = condition;
  checkIsObject(topRight, '$geoBoundingBox.topRight must be an object');
  checkIsObject(bottomLeft, '$geoBoundingBox.bottomLeft must be an object');

  const { lat: lat1, lng: lng1 } = topRight;
  const { lat: lat2, lng: lng2 } = bottomLeft;
  checkIsNumber(lat1, '$geoBoundingBox.topRight.lat must be a number');
  checkIsNumber(lng1, '$geoBoundingBox.topRight.lng must be a number');
  checkIsNumber(lat2, '$geoBoundingBox.bottomLeft.lat must be a number');
  checkIsNumber(lng2, '$geoBoundingBox.bottomLeft.lng must be a number');

  return `_geoBoundingBox([${lat1}, ${lng1}], [${lat2}, ${lng2}])`;
}

function parseComparisonConditions(field, condition) {
  if (!isObject(condition) || isDate(condition)) {
    return formatComparisonCondition(field, '$eq', condition);
  }

  if (isArray(condition)) {
    return formatComparisonCondition(field, '$in', condition);
  }

  return Object.entries(condition)
    .filter(([, value]) => value !== undefined)
    .map(([operator, value]) =>
      formatComparisonCondition(field, operator, value),
    )
    .join(' AND ');
}

function formatComparisonCondition(field, operator, value) {
  switch (operator) {
    case '$eq':
    case '=':
      return formatEqualCondition(field, value);
    case '$ne':
    case '!=':
      return formatNotEqualCondition(field, value);
    case '$gt':
    case '>':
      return formatGreaterThanCondition(field, value);
    case '$gte':
    case '>=':
      return formatGreaterThanOrEqualCondition(field, value);
    case '$lt':
    case '<':
      return formatLessThanCondition(field, value);
    case '$lte':
    case '<=':
      return formatLessThanOrEqualCondition(field, value);
    case '$in':
    case 'in':
      return formatInCondition(field, value);
    case '$nin':
    case 'nin':
      return formatNotInCondition(field, value);
    case '$exists':
    case 'exists':
      return formatExistsCondition(field, value);
    case '$empty':
    case 'empty':
      return formatEmptyCondition(field, value);
    case '$between':
    case 'between':
      return formatBetweenCondition(field, value);
    case '$contains':
    case 'contains':
      return formatContainsCondition(field, value);
    case '$notContains':
    case 'notContains':
      return formatNotContainsCondition(field, value);
    case '$startsWith':
    case 'startsWith':
      return formatStartsWithCondition(field, value);
    case '$notStartsWith':
    case 'notStartsWith':
      return formatNotStartsWithCondition(field, value);
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

function formatEqualCondition(field, value) {
  return value === null
    ? `${field} IS NULL`
    : `${field} = ${serializeValue(value)}`;
}

function formatNotEqualCondition(field, value) {
  return value === null
    ? `${field} IS NOT NULL`
    : `${field} != ${serializeValue(value)}`;
}

function formatGreaterThanCondition(field, value) {
  checkIsNumberOrDate(value, '$gt must be a number or a date');
  return `${field} > ${serializeValue(value)}`;
}

function formatGreaterThanOrEqualCondition(field, value) {
  checkIsNumberOrDate(value, '$gte must be a number or a date');
  return `${field} >= ${serializeValue(value)}`;
}

function formatLessThanCondition(field, value) {
  checkIsNumberOrDate(value, '$lt must be a number or a date');
  return `${field} < ${serializeValue(value)}`;
}

function formatLessThanOrEqualCondition(field, value) {
  checkIsNumberOrDate(value, '$lte must be a number or a date');
  return `${field} <= ${serializeValue(value)}`;
}

function formatInCondition(field, value) {
  checkIsArray(value, '$in must be an array');
  return `${field} IN [${value.map((v) => serializeValue(v)).join(', ')}]`;
}

function formatNotInCondition(field, value) {
  checkIsArray(value, '$nin must be an array');
  return `${field} NOT IN [${value.map((v) => serializeValue(v)).join(', ')}]`;
}

function formatExistsCondition(field, value) {
  return value ? `${field} EXISTS` : `${field} NOT EXISTS`;
}

function formatEmptyCondition(field, value) {
  return value ? `${field} IS EMPTY` : `${field} IS NOT EMPTY`;
}

function formatBetweenCondition(field, value) {
  checkIsArray(value, '$between must be an array');
  if (value.length !== 2) {
    throw new Error('$between must have two elements');
  }
  const type = (val) => Object.prototype.toString.call(val).slice(8, -1);
  const [from, to] = value;
  if (type(from) !== type(to)) {
    throw new Error('$between must be an array of numbers, dates or strings');
  }
  return `${field} ${serializeValue(value[0])} TO ${serializeValue(value[1])}`;
}

function formatContainsCondition(field, value) {
  checkIsString(value, '$contains must be a string');
  return `${field} CONTAINS ${serializeValue(value)}`;
}

function formatNotContainsCondition(field, value) {
  checkIsString(value, '$notContains must be a string');
  return `${field} NOT CONTAINS ${serializeValue(value)}`;
}

function formatStartsWithCondition(field, value) {
  checkIsString(value, '$startsWith must be a string');
  return `${field} STARTS WITH ${serializeValue(value)}`;
}

function formatNotStartsWithCondition(field, value) {
  checkIsString(value, '$notStartsWith must be a string');
  return `${field} NOT STARTS WITH ${serializeValue(value)}`;
}

function serializeValue(value) {
  if (isDate(value)) {
    return value.getTime();
  }
  return JSON.stringify(value);
}

module.exports = {
  buildMeiliSearchFilter,
  formatComparisonCondition,
  formatGeoRadiusCondition,
  formatGeoBoundingBoxCondition,
};
