"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

module.exports = getIn;

var toKey = _interopRequire(require("./toKey"));

var isObject = _interopRequire(require("lodash/lang/isObject"));

function getIn(obj, path) {
  while (path.length > 0) {
    var key = toKey(path.shift());
    if (isObject(obj[key])) {
      obj = obj[key];
    } else {
      return null;
    }
  }

  return obj;
}