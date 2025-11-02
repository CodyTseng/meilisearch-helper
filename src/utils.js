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

function isFunction(fn) {
  return typeof fn === 'function';
}

function isString(str) {
  return typeof str === 'string';
}

function checkIsObject(obj, errMsg) {
  if (isObject(obj)) {
    return;
  }
  throw new Error(errMsg);
}

function checkIsArray(arr, errMsg) {
  if (isArray(arr)) {
    return;
  }
  throw new Error(errMsg);
}

function checkIsNumber(num, errMsg) {
  if (isNumber(num)) {
    return;
  }
  throw new Error(errMsg);
}

function checkIsComparableType(val, errMsg) {
  if (isNumberOrDate(val) || isString(val)) {
    return;
  }
  throw new Error(errMsg);
}

function checkIsString(str, errMsg) {
  if (isString(str)) {
    return;
  }
  throw new Error(errMsg);
}

module.exports = {
  isObject,
  isArray,
  isNumber,
  isDate,
  isFunction,
  isString,
  checkIsObject,
  checkIsArray,
  checkIsNumber,
  checkIsComparableType,
  checkIsString,
};
