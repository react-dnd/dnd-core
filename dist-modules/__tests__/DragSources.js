"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var NormalSource = exports.NormalSource = (function () {
  function NormalSource(item) {
    _classCallCheck(this, NormalSource);

    this.item = item || { baz: 42 };
  }

  NormalSource.prototype.canDrag = function canDrag() {
    return true;
  };

  NormalSource.prototype.beginDrag = function beginDrag() {
    return this.item;
  };

  NormalSource.prototype.endDrag = function endDrag(endDragArgument) {
    this.endDragArgument = endDragArgument;
  };

  return NormalSource;
})();

;

var NonDraggableSource = exports.NonDraggableSource = (function () {
  function NonDraggableSource() {
    _classCallCheck(this, NonDraggableSource);
  }

  NonDraggableSource.prototype.canDrag = function canDrag() {
    return false;
  };

  NonDraggableSource.prototype.beginDrag = function beginDrag() {
    return {};
  };

  NonDraggableSource.prototype.endDrag = function endDrag() {};

  return NonDraggableSource;
})();

;
exports.__esModule = true;