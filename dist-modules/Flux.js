"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Flummox = require("flummox").Flummox;

var DragDropActions = _interopRequire(require("./actions/DragDropActions"));

var RegistryActions = _interopRequire(require("./actions/RegistryActions"));

var DragOperationStore = _interopRequire(require("./stores/DragOperationStore"));

var Flux = (function (_Flummox) {
  function Flux(manager) {
    _classCallCheck(this, Flux);

    _Flummox.call(this);

    this.createActions("dragDropActions", DragDropActions, manager);
    this.dragDropActions = this.getActions("dragDropActions");
    this.dragDropActionIds = this.getActionIds("dragDropActions");

    this.createActions("registryActions", RegistryActions);
    this.registryActions = this.getActions("registryActions");
    this.registryActionIds = this.getActionIds("registryActions");

    this.createStore("dragOperationStore", DragOperationStore, this);
    this.dragOperationStore = this.getStore("dragOperationStore");
  }

  _inherits(Flux, _Flummox);

  return Flux;
})(Flummox);

module.exports = Flux;