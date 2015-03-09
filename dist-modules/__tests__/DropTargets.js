"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var NormalTarget = exports.NormalTarget = (function () {
  function NormalTarget(dropResult) {
    _classCallCheck(this, NormalTarget);

    this.dropResult = dropResult || { foo: "bar" };
  }

  NormalTarget.prototype.canDrop = function canDrop() {
    return true;
  };

  NormalTarget.prototype.drop = function drop() {
    return this.dropResult;
  };

  return NormalTarget;
})();

;

var NonDroppableTarget = exports.NonDroppableTarget = (function () {
  function NonDroppableTarget() {
    _classCallCheck(this, NonDroppableTarget);
  }

  NonDroppableTarget.prototype.canDrop = function canDrop() {
    return false;
  };

  NonDroppableTarget.prototype.drop = function drop() {};

  return NonDroppableTarget;
})();

var TargetWithNoDropResult = exports.TargetWithNoDropResult = (function () {
  function TargetWithNoDropResult() {
    _classCallCheck(this, TargetWithNoDropResult);
  }

  TargetWithNoDropResult.prototype.canDrop = function canDrop() {
    return true;
  };

  TargetWithNoDropResult.prototype.drop = function drop() {};

  return TargetWithNoDropResult;
})();

;
exports.__esModule = true;