'use strict';

export default class TestBackend {
  constructor(actions) {
    this.actions = actions;
  }

  simulateBeginDrag(sourceHandle) {
    this.actions.beginDrag(sourceHandle);
  }

  simulateDrop(targetHandle) {
    this.actions.drop(targetHandle);
  }

  simulateEndDrag() {
    this.actions.endDrag();
  }
};
