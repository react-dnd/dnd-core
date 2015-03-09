"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var invariant = _interopRequire(require("invariant"));

var keyMirror = _interopRequire(require("keymirror"));

var getIn = _interopRequire(require("./getIn"));

var setIn = _interopRequire(require("./setIn"));

var getNextUniqueId = _interopRequire(require("./getNextUniqueId"));

var HandlerRoles = keyMirror({
  SOURCE: null,
  TARGET: null
});

function validateSourceContract(source) {
  invariant(typeof source.canDrag === "function", "Expected canDrag to be a function.");
  invariant(typeof source.beginDrag === "function", "Expected beginDrag to be a function.");
  invariant(typeof source.endDrag === "function", "Expected endDrag to be a function.");
}

function validateTargetContract(target) {
  invariant(typeof target.drop === "function", "Expected beginDrag to be a function.");
}

function validateSourceHandle(handle) {
  invariant(handle.role === HandlerRoles.SOURCE, "Expected to receive a source handle");
}

function validateTargetHandle(handle) {
  invariant(handle.role === HandlerRoles.TARGET, "Expected to receive a target handle");
}

function validateType(type) {
  invariant(typeof type === "string" || typeof type === "symbol", "Type can only be a string or a symbol.");
}

function makePath(_ref) {
  var role = _ref.role;
  var type = _ref.type;
  var id = _ref.id;

  return [role, type, id];
}

var HandlerRegistry = (function () {
  function HandlerRegistry(actions) {
    _classCallCheck(this, HandlerRegistry);

    this.actions = actions;

    this.handlers = {};
    this.pinnedSourceHandle = null;
    this.pinnedSource = null;
  }

  HandlerRegistry.prototype.addSource = function addSource(type, source) {
    validateType(type);
    validateSourceContract(source);

    var sourceHandle = this.addHandler(HandlerRoles.SOURCE, type, source);
    validateSourceHandle(sourceHandle);

    this.actions.addSource(sourceHandle);
    return sourceHandle;
  };

  HandlerRegistry.prototype.addTarget = function addTarget(type, target) {
    validateType(type);
    validateTargetContract(target);

    var targetHandle = this.addHandler(HandlerRoles.TARGET, type, target);
    validateTargetHandle(targetHandle);

    this.actions.addTarget(targetHandle);
    return targetHandle;
  };

  HandlerRegistry.prototype.addHandler = function addHandler(role, type, handler) {
    var id = getNextUniqueId().toString();
    var handle = { role: role, type: type, id: id };
    var path = makePath(handle);

    setIn(this.handlers, path, handler);
    return handle;
  };

  HandlerRegistry.prototype.getSource = function getSource(sourceHandle, includePinned) {
    validateSourceHandle(sourceHandle);

    var path = makePath(sourceHandle);
    var isPinned = includePinned && sourceHandle === this.pinnedSourceHandle;
    var source = isPinned ? this.pinnedSource : getIn(this.handlers, path);

    return source;
  };

  HandlerRegistry.prototype.getTarget = function getTarget(targetHandle) {
    validateTargetHandle(targetHandle);

    var path = makePath(targetHandle);
    return getIn(this.handlers, path);
  };

  HandlerRegistry.prototype.removeSource = function removeSource(sourceHandle) {
    validateSourceHandle(sourceHandle);
    invariant(this.getSource(sourceHandle), "Cannot remove a source that was not added.");

    var path = makePath(sourceHandle);
    setIn(this.handlers, path, null);
    this.actions.removeSource(sourceHandle);
  };

  HandlerRegistry.prototype.removeTarget = function removeTarget(targetHandle) {
    validateTargetHandle(targetHandle);
    invariant(this.getTarget(targetHandle), "Cannot remove a target that was not added.");

    var path = makePath(targetHandle);
    setIn(this.handlers, path, null);
    this.actions.removeTarget(targetHandle);
  };

  HandlerRegistry.prototype.pinSource = function pinSource(handle) {
    var source = this.getSource(handle);
    invariant(source, "Cannot pin a source that was not added.");

    this.pinnedSourceHandle = handle;
    this.pinnedSource = source;
  };

  HandlerRegistry.prototype.unpinSource = function unpinSource() {
    invariant(this.pinnedSource, "No source is pinned at the time.");

    this.pinnedSourceHandle = null;
    this.pinnedSource = null;
  };

  return HandlerRegistry;
})();

module.exports = HandlerRegistry;