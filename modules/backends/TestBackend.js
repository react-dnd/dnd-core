'use strict';

export default class TestBackend {
  constructor(manager) {
    const flux = manager.getFlux();

    this.manager = manager;
    this.context = manager.getContext();
    this.actions = flux.getDragDropActions();
  }

  simulateBeginDrag(sourceHandle) {
    const source = this.manager.getSource(sourceHandle);
    if (!source.canDrag()) {
      return;
    }

    this.actions.beginDrag({
      sourceHandle: sourceHandle,
      itemType: sourceHandle.type,
      item: source.beginDrag()
    });
  }

  simulateDrop(targetHandle) {
    const target = this.manager.getTarget(targetHandle);
    if (!target.canDrop()) {
      return;
    }

    const dropResult = target.drop();
    this.actions.drop({ dropResult });
  }

  simulateEndDrag() {
    const didDrop = this.context.didDrop();
    const dropResult = this.context.getDropResult();
    const sourceHandle = this.context.getDraggedSourceHandle();
    const source = this.manager.getSource(sourceHandle);

    this.actions.endDrag();
    source.endDrag(didDrop ?
      dropResult || true :
      false
    );
  }
};
