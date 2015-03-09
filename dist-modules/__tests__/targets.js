"use strict";

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var DropTarget = require("..").DropTarget;

var NormalTarget = exports.NormalTarget = (function (_DropTarget) {
  function NormalTarget(dropResult) {
    _classCallCheck(this, NormalTarget);

    this.didCallDrop = false;
    this.dropResult = dropResult || { foo: "bar" };
  }

  _inherits(NormalTarget, _DropTarget);

  NormalTarget.prototype.drop = function drop() {
    this.didCallDrop = true;
    return this.dropResult;
  };

  return NormalTarget;
})(DropTarget);

var NonDroppableTarget = exports.NonDroppableTarget = (function (_DropTarget2) {
  function NonDroppableTarget() {
    _classCallCheck(this, NonDroppableTarget);

    this.didCallDrop = false;
  }

  _inherits(NonDroppableTarget, _DropTarget2);

  NonDroppableTarget.prototype.canDrop = function canDrop() {
    return false;
  };

  NonDroppableTarget.prototype.drop = function drop() {
    this.didCallDrop = true;
  };

  return NonDroppableTarget;
})(DropTarget);

var TargetWithNoDropResult = exports.TargetWithNoDropResult = (function (_DropTarget3) {
  function TargetWithNoDropResult() {
    _classCallCheck(this, TargetWithNoDropResult);

    this.didCallDrop = false;
  }

  _inherits(TargetWithNoDropResult, _DropTarget3);

  TargetWithNoDropResult.prototype.drop = function drop() {
    this.didCallDrop = true;
  };

  return TargetWithNoDropResult;
})(DropTarget);

var BadResultTarget = exports.BadResultTarget = (function (_DropTarget4) {
  function BadResultTarget() {
    _classCallCheck(this, BadResultTarget);

    if (_DropTarget4 != null) {
      _DropTarget4.apply(this, arguments);
    }
  }

  _inherits(BadResultTarget, _DropTarget4);

  BadResultTarget.prototype.drop = function drop() {
    return 42;
  };

  return BadResultTarget;
})(DropTarget);

var TransformResultTarget = exports.TransformResultTarget = (function (_DropTarget5) {
  function TransformResultTarget(transform) {
    _classCallCheck(this, TransformResultTarget);

    this.transform = transform;
    this.didCallDrop = false;
  }

  _inherits(TransformResultTarget, _DropTarget5);

  TransformResultTarget.prototype.drop = function drop(context) {
    this.didCallDrop = true;
    var dropResult = context.getDropResult();
    return this.transform(dropResult);
  };

  return TransformResultTarget;
})(DropTarget);

exports.__esModule = true;