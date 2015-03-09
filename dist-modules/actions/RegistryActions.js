"use strict";

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Actions = require("flummox").Actions;

var RegistryActions = (function (_Actions) {
  function RegistryActions() {
    _classCallCheck(this, RegistryActions);

    if (_Actions != null) {
      _Actions.apply(this, arguments);
    }
  }

  _inherits(RegistryActions, _Actions);

  RegistryActions.prototype.addSource = function addSource(sourceHandle) {
    return { sourceHandle: sourceHandle };
  };

  RegistryActions.prototype.addTarget = function addTarget(targetHandle) {
    return { targetHandle: targetHandle };
  };

  RegistryActions.prototype.removeSource = function removeSource(sourceHandle) {
    return { sourceHandle: sourceHandle };
  };

  RegistryActions.prototype.removeTarget = function removeTarget(targetHandle) {
    return { targetHandle: targetHandle };
  };

  return RegistryActions;
})(Actions);

module.exports = RegistryActions;