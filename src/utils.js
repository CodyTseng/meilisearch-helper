function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

function isArray(obj) {
  return Array.isArray(obj);
}

function isDate(obj) {
  return obj instanceof Date;
}

function isNumber(n) {
  return typeof n === 'number';
}

function isNumberOrDate(obj) {
  return typeof obj === 'number' || isDate(obj);
}

function checkIsObject(obj, errMsg) {
  if (isObject(obj)) {
    return;
  }
  throw new Error(errMsg);
}

function checkIsArray(obj, errMsg) {
  if (isArray(obj)) {
    return;
  }
  throw new Error(errMsg);
}

function checkIsNumber(obj, errMsg) {
  if (isNumber(obj)) {
    return;
  }
  throw new Error(errMsg);
}

function checkIsNumberOrDate(obj, errMsg) {
  if (isNumberOrDate(obj)) {
    return;
  }
  throw new Error(errMsg);
}

module.exports = {
  isObject,
  isArray,
  isDate,
  checkIsObject,
  checkIsArray,
  checkIsNumber,
  checkIsNumberOrDate,
};
