"use strict";

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Store = require("flummox").Store;

var DragOperationStore = (function (_Store) {
  function DragOperationStore(flux) {
    _classCallCheck(this, DragOperationStore);

    _Store.call(this);

    var dragDropActionIds = flux.dragDropActionIds;
    var registryActionIds = flux.registryActionIds;

    this.register(dragDropActionIds.beginDrag, this.handleBeginDrag);
    this.register(dragDropActionIds.enter, this.handleEnter);
    this.register(dragDropActionIds.leave, this.handleLeave);
    this.register(dragDropActionIds.endDrag, this.handleEndDrag);
    this.register(dragDropActionIds.drop, this.handleDrop);
    this.register(registryActionIds.removeTarget, this.handleRemoveTarget);

    this.state = {
      itemType: null,
      item: null,
      sourceHandle: null,
      targetHandles: [],
      dropResult: null,
      didDrop: false
    };
  }

  _inherits(DragOperationStore, _Store);

  DragOperationStore.prototype.handleBeginDrag = function handleBeginDrag(_ref) {
    var itemType = _ref.itemType;
    var item = _ref.item;
    var sourceHandle = _ref.sourceHandle;

    this.setState({
      itemType: itemType,
      item: item,
      sourceHandle: sourceHandle,
      targetHandles: [],
      dropResult: false,
      didDrop: false
    });
  };

  DragOperationStore.prototype.handleEnter = function handleEnter(_ref) {
    var targetHandle = _ref.targetHandle;
    var targetHandles = this.state.targetHandles;

    this.setState({
      targetHandles: targetHandles.concat([targetHandle])
    });
  };

  DragOperationStore.prototype.handleLeave = function handleLeave(_ref) {
    var targetHandle = _ref.targetHandle;
    var targetHandles = this.state.targetHandles;

    var index = targetHandles.indexOf(targetHandle);

    this.setState({
      targetHandles: targetHandles.slice(0, index)
    });
  };

  DragOperationStore.prototype.handleRemoveTarget = function handleRemoveTarget(_ref) {
    var targetHandle = _ref.targetHandle;

    if (this.getTargetHandles().indexOf(targetHandle) > -1) {
      this.handleLeave({ targetHandle: targetHandle });
    }
  };

  DragOperationStore.prototype.handleDrop = function handleDrop(_ref) {
    var dropResult = _ref.dropResult;

    this.setState({
      dropResult: dropResult,
      didDrop: true,
      targetHandles: []
    });
  };

  DragOperationStore.prototype.handleEndDrag = function handleEndDrag() {
    this.setState({
      itemType: null,
      item: null,
      sourceHandle: null,
      targetHandles: [],
      dropResult: null,
      didDrop: false
    });
  };

  DragOperationStore.prototype.isDragging = function isDragging() {
    return Boolean(this.getItemType());
  };

  DragOperationStore.prototype.getItemType = function getItemType() {
    return this.state.itemType;
  };

  DragOperationStore.prototype.getSourceHandle = function getSourceHandle() {
    return this.state.sourceHandle;
  };

  DragOperationStore.prototype.getTargetHandles = function getTargetHandles() {
    return this.state.targetHandles;
  };

  DragOperationStore.prototype.getItem = function getItem() {
    return this.state.item;
  };

  DragOperationStore.prototype.getDropResult = function getDropResult() {
    return this.state.dropResult;
  };

  DragOperationStore.prototype.didDrop = function didDrop() {
    return this.state.didDrop;
  };

  return DragOperationStore;
})(Store);

module.exports = DragOperationStore;