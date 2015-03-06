'use strict';

export default class TestBackend {
  constructor(manager) {
    this.manager = manager;

    const flux = manager.getFlux();
    this.actions = flux.getDragDropActions();

    this.context = manager.getContext();
  }

  simulateDrop(src, dest) {
    const source = this.manager.getSource(src);
    const target = this.manager.getTarget(dest);

    if (!this.manager.getContext().isDragging()) {
      throw `Can't drop what is not being dragged`;
    }

    if (target) {
      const data = target.drop();

      if (typeof data !== 'null') { // let the parent have it?
        source.endDrag(data);
      }
    }

    this.actions.endDrag();
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
