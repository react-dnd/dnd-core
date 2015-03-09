"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var invariant = _interopRequire(require("invariant"));

var DragDropContext = (function () {
  function DragDropContext(flux, registry) {
    _classCallCheck(this, DragDropContext);

    this.dragOperationStore = flux.dragOperationStore;
    this.registry = registry;
  }

  DragDropContext.prototype.addChangeListener = function addChangeListener(listener, context) {
    this.dragOperationStore.addListener("change", listener, context);
  };

  DragDropContext.prototype.removeChangeListener = function removeChangeListener(listener, context) {
    this.dragOperationStore.removeListener("change", listener, context);
  };

  DragDropContext.prototype.canDrag = function canDrag(sourceHandle) {
    var source = this.registry.getSource(sourceHandle);
    invariant(source, "Expected to find a valid source.");

    if (this.isDragging()) {
      return false;
    }

    return source.canDrag(this, sourceHandle);
  };

  DragDropContext.prototype.canDrop = function canDrop(targetHandle) {
    var target = this.registry.getTarget(targetHandle);
    invariant(target, "Expected to find a valid target.");

    if (!this.isDragging() || this.didDrop()) {
      return false;
    }

    var targetType = targetHandle.type;

    var draggedItemType = this.getItemType();

    return targetType === draggedItemType && target.canDrop(this, targetHandle);
  };

  DragDropContext.prototype.isDragging = function isDragging(sourceHandle) {
    var isDragging = this.dragOperationStore.isDragging();
    if (!isDragging || typeof sourceHandle === "undefined") {
      return isDragging;
    }

    var sourceType = sourceHandle.type;

    var draggedItemType = this.getItemType();
    if (sourceType !== draggedItemType) {
      return false;
    }

    var source = this.registry.getSource(sourceHandle, true);
    if (!source) {
      return false;
    }

    return source.isDragging(this, sourceHandle);
  };

  DragDropContext.prototype.isOver = function isOver(targetHandle) {
    var shallow = arguments[1] === undefined ? false : arguments[1];

    var targetHandles = this.getTargetHandles();
    if (!targetHandles.length) {
      return false;
    }

    var index = targetHandles.indexOf(targetHandle);
    if (shallow) {
      return index === targetHandles.length - 1;
    } else {
      return index > -1;
    }
  };

  DragDropContext.prototype.getItemType = function getItemType() {
    return this.dragOperationStore.getItemType();
  };

  DragDropContext.prototype.getItem = function getItem() {
    return this.dragOperationStore.getItem();
  };

  DragDropContext.prototype.getSourceHandle = function getSourceHandle() {
    return this.dragOperationStore.getSourceHandle();
  };

  DragDropContext.prototype.getTargetHandles = function getTargetHandles() {
    return this.dragOperationStore.getTargetHandles();
  };

  DragDropContext.prototype.getDropResult = function getDropResult() {
    return this.dragOperationStore.getDropResult();
  };

  DragDropContext.prototype.didDrop = function didDrop() {
    return this.dragOperationStore.didDrop();
  };

  return DragDropContext;
})();

module.exports = DragDropContext;