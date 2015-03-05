'use strict';

export default class TestBackend {
  constructor(alt) {
    this.actions = alt.getDragDropActions();
  }

  simulateBeginDrag(itemType) {
    this.actions.beginDrag({ itemType });
  }
};