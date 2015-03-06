'use strict';

import invariant from 'invariant';

export default class DragDropContext {
  constructor(manager) {
    this.manager = manager;
    this.dragOperationStore = manager.flux.dragOperationStore;
  }

  addChangeListener(listener) {
    this.dragOperationStore.addListener('change', listener);
  }

  removeChangeListener(listener) {
    this.dragOperationStore.removeListener('change', listener);
  }

  canDrag(sourceHandle) {
    const source = this.manager.getSource(sourceHandle);
    invariant(source, 'Expected to find a valid source.');

    if (this.isDragging()) {
      return false;
    }

    return source.canDrag();
  }

  canDrop(targetHandle) {
    const target = this.manager.getTarget(targetHandle);
    invariant(target, 'Expected to find a valid target.');

    if (!this.isDragging() || this.didDrop()) {
      return false;
    }

    const { type: targetType } = targetHandle;
    const draggedItemType = this.getDraggedItemType();

    return targetType === draggedItemType &&
           target.canDrop();
  }

  canEndDrag() {
    return this.isDragging();
  }

  isDragging() {
    return this.dragOperationStore.isDragging();
  }

  getDraggedSourceHandle() {
    return this.dragOperationStore.getDraggedSourceHandle();
  }

  getDraggedItemType() {
    return this.dragOperationStore.getDraggedItemType();
  }

  getDraggedItem() {
    return this.dragOperationStore.getDraggedItem();
  }

  getDropResult() {
    return this.dragOperationStore.getDropResult();
  }

  didDrop() {
    return this.dragOperationStore.didDrop();
  }
}