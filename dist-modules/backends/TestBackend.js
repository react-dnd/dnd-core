"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var TestBackend = (function () {
  function TestBackend(actions) {
    _classCallCheck(this, TestBackend);

    this.actions = actions;
  }

  TestBackend.prototype.simulateBeginDrag = function simulateBeginDrag(sourceHandle) {
    this.actions.beginDrag(sourceHandle);
  };

  TestBackend.prototype.simulateEnter = function simulateEnter(targetHandle) {
    this.actions.enter(targetHandle);
  };

  TestBackend.prototype.simulateLeave = function simulateLeave(targetHandle) {
    this.actions.leave(targetHandle);
  };

  TestBackend.prototype.simulateDrop = function simulateDrop() {
    this.actions.drop();
  };

  TestBackend.prototype.simulateEndDrag = function simulateEndDrag() {
    this.actions.endDrag();
  };

  return TestBackend;
})();

module.exports = TestBackend;