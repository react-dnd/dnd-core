"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

module.exports = setIn;

var toKey = _interopRequire(require("./toKey"));

function setIn(obj, path, value) {
  while (path.length > 0) {
    var key = toKey(path.shift());
    if (path.length > 0) {
      obj = obj[key] = obj[key] || {};
    } else {
      obj = obj[key] = value;
    }
  }
}