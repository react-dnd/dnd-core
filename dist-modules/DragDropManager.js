"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Flux = _interopRequire(require("./Flux"));

var DragDropContext = _interopRequire(require("./DragDropContext"));

var HandlerRegistry = _interopRequire(require("./utils/HandlerRegistry"));

var DragDropManager = (function () {
  function DragDropManager(Backend) {
    _classCallCheck(this, DragDropManager);

    var flux = new Flux(this);

    this.flux = flux;
    this.registry = new HandlerRegistry(flux.registryActions);
    this.context = new DragDropContext(flux, this.registry);
    this.backend = new Backend(flux.dragDropActions);
  }

  DragDropManager.prototype.getContext = function getContext() {
    return this.context;
  };

  DragDropManager.prototype.getBackend = function getBackend() {
    return this.backend;
  };

  DragDropManager.prototype.getRegistry = function getRegistry() {
    return this.registry;
  };

  return DragDropManager;
})();

module.exports = DragDropManager;