"use strict";

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var DragSource = require("..").DragSource;

var NormalSource = exports.NormalSource = (function (_DragSource) {
  function NormalSource(item) {
    _classCallCheck(this, NormalSource);

    this.item = item || { baz: 42 };
    this.didCallBeginDrag = false;
  }

  _inherits(NormalSource, _DragSource);

  NormalSource.prototype.beginDrag = function beginDrag() {
    this.didCallBeginDrag = true;
    return this.item;
  };

  NormalSource.prototype.endDrag = function endDrag(context) {
    this.recordedDropResult = context.getDropResult();
  };

  return NormalSource;
})(DragSource);

var NonDraggableSource = exports.NonDraggableSource = (function (_DragSource2) {
  function NonDraggableSource() {
    _classCallCheck(this, NonDraggableSource);

    this.didCallBeginDrag = false;
  }

  _inherits(NonDraggableSource, _DragSource2);

  NonDraggableSource.prototype.canDrag = function canDrag() {
    return false;
  };

  NonDraggableSource.prototype.beginDrag = function beginDrag() {
    this.didCallBeginDrag = true;
    return {};
  };

  return NonDraggableSource;
})(DragSource);

var BadItemSource = exports.BadItemSource = (function (_DragSource3) {
  function BadItemSource() {
    _classCallCheck(this, BadItemSource);

    if (_DragSource3 != null) {
      _DragSource3.apply(this, arguments);
    }
  }

  _inherits(BadItemSource, _DragSource3);

  BadItemSource.prototype.beginDrag = function beginDrag() {
    return 42;
  };

  return BadItemSource;
})(DragSource);

var NumberSource = exports.NumberSource = (function (_DragSource4) {
  function NumberSource(number, allowDrag) {
    _classCallCheck(this, NumberSource);

    this.number = number;
    this.allowDrag = allowDrag;
  }

  _inherits(NumberSource, _DragSource4);

  NumberSource.prototype.canDrag = function canDrag() {
    return this.allowDrag;
  };

  NumberSource.prototype.isDragging = function isDragging(context) {
    var item = context.getItem();
    return item.number === this.number;
  };

  NumberSource.prototype.beginDrag = function beginDrag() {
    return {
      number: this.number
    };
  };

  return NumberSource;
})(DragSource);

exports.__esModule = true;