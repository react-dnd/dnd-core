import invariant from 'invariant';
import isArray from 'lodash/lang/isArray';

function matchesType(targetType, draggedItemType) {
  if (isArray(targetType)) {
    return targetType.some(t => t === draggedItemType);
  } else {
    return targetType === draggedItemType;
  }
}

export default class DragDropMonitor {
  constructor(flux, registry) {
    this.dragOperationStore = flux.dragOperationStore;
    this.registry = registry;
  }

  addChangeListener(listener, context) {
    this.dragOperationStore.addListener('change', listener, context);
  }

  removeChangeListener(listener, context) {
    this.dragOperationStore.removeListener('change', listener, context);
  }

  canDrag(sourceHandle) {
    const source = this.registry.getSource(sourceHandle);
    invariant(source, 'Expected to find a valid source.');

    if (this.isDragging()) {
      return false;
    }

    return source.canDrag(this, sourceHandle);
  }

  canDrop(targetHandle) {
    const target = this.registry.getTarget(targetHandle);
    invariant(target, 'Expected to find a valid target.');

    if (!this.isDragging() || this.didDrop()) {
      return false;
    }

    const { type: targetType } = targetHandle;
    const draggedItemType = this.getItemType();

    return matchesType(targetType, draggedItemType) &&
           target.canDrop(this, targetHandle);
  }

  isDragging(sourceHandle) {
    const isDragging = this.dragOperationStore.isDragging();
    if (!isDragging || typeof sourceHandle === 'undefined') {
      return isDragging;
    }

    const { type: sourceType } = sourceHandle;
    const draggedItemType = this.getItemType();
    if (sourceType !== draggedItemType) {
      return false;
    }

    let source = this.registry.getSource(sourceHandle, true);
    if (!source) {
      return false;
    }

    return source.isDragging(this, sourceHandle);
  }

  isOver(targetHandle, shallow = false) {
    const targetHandles = this.getTargetHandles();
    if (!targetHandles.length) {
      return false;
    }

    const index = targetHandles.indexOf(targetHandle);
    if (shallow) {
      return index === targetHandles.length - 1;
    } else {
      return index > -1;
    }
  }

  getItemType() {
    return this.dragOperationStore.getItemType();
  }

  getItem() {
    return this.dragOperationStore.getItem();
  }

  getSourceHandle() {
    return this.dragOperationStore.getSourceHandle();
  }

  getTargetHandles() {
    return this.dragOperationStore.getTargetHandles();
  }

  getDropResult() {
    return this.dragOperationStore.getDropResult();
  }

  didDrop() {
    return this.dragOperationStore.didDrop();
  }
}