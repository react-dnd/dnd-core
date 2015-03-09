"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var DropTarget = (function () {
  function DropTarget() {
    _classCallCheck(this, DropTarget);
  }

  DropTarget.prototype.canDrop = function canDrop() {
    return true;
  };

  DropTarget.prototype.drop = function drop() {};

  return DropTarget;
})();

module.exports = DropTarget;