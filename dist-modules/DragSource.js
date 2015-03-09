"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var DragSource = (function () {
  function DragSource() {
    _classCallCheck(this, DragSource);
  }

  DragSource.prototype.canDrag = function canDrag() {
    return true;
  };

  DragSource.prototype.isDragging = function isDragging(context, handle) {
    return handle === context.getSourceHandle();
  };

  DragSource.prototype.endDrag = function endDrag() {};

  return DragSource;
})();

module.exports = DragSource;