const {
  formatComparisonCondition,
  formatGeoRadiusCondition,
  formatGeoBoundingBoxCondition,
} = require('./filter');
const { isFunction } = require('./utils');

class MeiliSearchFilterBuilder {
  constructor(filters = []) {
    this.filters = filters;
  }

  where(lhsOrCb, operator, rhs) {
    const newFilters = [...this.filters];

    if (arguments.length === 1 && isFunction(lhsOrCb)) {
      newFilters.push(lhsOrCb(expressionBuilder));
    } else if (arguments.length === 3) {
      newFilters.push(expressionBuilder(lhsOrCb, operator, rhs));
    } else {
      throw new Error('Invalid arguments');
    }

    return new MeiliSearchFilterBuilder(newFilters);
  }

  build() {
    return this.filters.join(' AND ');
  }
}

function expressionBuilder(lhs, operator, rhs) {
  return formatComparisonCondition(lhs, operator, rhs);
}

expressionBuilder.and = function (expressions) {
  return expressions.join(' AND ');
};

expressionBuilder.or = function (expressions) {
  return `(${expressions.join(' OR ')})`;
};

expressionBuilder.geoRadius = function (lat, lng, distanceInMeters) {
  return formatGeoRadiusCondition({
    lat,
    lng,
    distanceInMeters,
  });
};

expressionBuilder.geoBoundingBox = function (topRight, bottomLeft) {
  return formatGeoBoundingBoxCondition({
    topRight,
    bottomLeft,
  });
};

module.exports = { MeiliSearchFilterBuilder };
