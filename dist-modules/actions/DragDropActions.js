"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Actions = require("flummox").Actions;

var invariant = _interopRequire(require("invariant"));

var isObject = _interopRequire(require("lodash/lang/isObject"));

var DragDropActions = (function (_Actions) {
  function DragDropActions(manager) {
    _classCallCheck(this, DragDropActions);

    _Actions.call(this);
    this.manager = manager;
  }

  _inherits(DragDropActions, _Actions);

  DragDropActions.prototype.beginDrag = function beginDrag(sourceHandle) {
    var _manager = this.manager;
    var context = _manager.context;
    var registry = _manager.registry;

    invariant(!context.isDragging(), "Cannot call beginDrag while dragging.");
    if (!context.canDrag(sourceHandle)) {
      return;
    }

    var source = registry.getSource(sourceHandle);
    var item = source.beginDrag(context, sourceHandle);
    invariant(isObject(item), "Item must be an object.");

    registry.pinSource(sourceHandle);

    var itemType = sourceHandle.type;

    return { itemType: itemType, item: item, sourceHandle: sourceHandle };
  };

  DragDropActions.prototype.enter = function enter(targetHandle) {
    var context = this.manager.context;

    invariant(context.isDragging(), "Cannot call enter while not dragging.");

    var targetHandles = context.getTargetHandles();
    invariant(targetHandles.indexOf(targetHandle) === -1, "Cannot enter the same target twice.");

    return { targetHandle: targetHandle };
  };

  DragDropActions.prototype.leave = function leave(targetHandle) {
    var context = this.manager.context;

    invariant(context.isDragging(), "Cannot call leave while not dragging.");

    var targetHandles = context.getTargetHandles();
    invariant(targetHandles.indexOf(targetHandle) !== -1, "Cannot leave a target that was not entered.");

    return { targetHandle: targetHandle };
  };

  DragDropActions.prototype.drop = function drop() {
    var _this = this;

    var _manager = this.manager;
    var context = _manager.context;
    var registry = _manager.registry;

    invariant(context.isDragging(), "Cannot call drop while not dragging.");

    var _getActionIds = this.getActionIds();

    var dropActionId = _getActionIds.drop;

    var targetHandles = context.getTargetHandles().filter(context.canDrop, context);

    targetHandles.reverse();
    targetHandles.forEach(function (targetHandle, index) {
      var target = registry.getTarget(targetHandle);

      var dropResult = target.drop(context, targetHandle);
      invariant(typeof dropResult === "undefined" || isObject(dropResult), "Drop result must either be an object or undefined.");
      if (typeof dropResult === "undefined") {
        dropResult = index === 0 ? true : context.getDropResult();
      }

      _this.dispatch(dropActionId, { dropResult: dropResult });
    });
  };

  DragDropActions.prototype.endDrag = function endDrag() {
    var _manager = this.manager;
    var context = _manager.context;
    var registry = _manager.registry;

    invariant(context.isDragging(), "Cannot call endDrag while not dragging.");

    var sourceHandle = context.getSourceHandle();
    var source = registry.getSource(sourceHandle, true);
    source.endDrag(context, sourceHandle);

    registry.unpinSource();

    return {};
  };

  return DragDropActions;
})(Actions);

module.exports = DragDropActions;