"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

module.exports = toKey;

var invariant = _interopRequire(require("invariant"));

function toKey(key) {
  if (typeof key === "string") {
    return "KEY_" + key;
  } else if (typeof key === "symbol") {
    return key;
  } else {
    invariant(false, "%s is neither string nor symbol");
  }
}