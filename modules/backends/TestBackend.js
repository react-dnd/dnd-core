'use strict';

export default class TestBackend {
  constructor(manager) {
    this.manager = manager;
    this.actions = manager.getAlt().dragDropActions;
  }

  simulateBeginDrag(descriptor) {
    const dragSource = this.manager.getSource(descriptor);
    if (!dragSource.canDrag()) {
      return;
    }

    this.actions.beginDrag({
      itemType: descriptor.type,
      item: dragSource.beginDrag()
    });
  }
};