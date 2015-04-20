import invariant from 'invariant';
import matchesType from './utils/matchesType';
import isArray from 'lodash/lang/isArray';

export default class DragDropMonitor {
  constructor(flux, registry) {
    this.dragOperationStore = flux.dragOperationStore;
    this.dragOffsetStore = flux.dragOffsetStore;
    this.registry = registry;
  }

  subscribeToStateChange(listener, {
    handlerIds = null
  }: options = {}) {
    invariant(
      typeof listener === 'function',
      'listener must be a function.'
    );

    const { dragOperationStore } = this;

    let handleChange = listener;
    if (handlerIds) {
      invariant(
        isArray(handlerIds),
        'handlerIds, when specified, must be an array of strings.'
      );
      handleChange = function () {
        if (dragOperationStore.areDirty(handlerIds)) {
          listener();
        }
      };
    }

    dragOperationStore.addListener('change', handleChange);

    return function dispose() {
      dragOperationStore.removeListener('change', handleChange);
    };
  }

  subscribeToOffsetChange(listener) {
    invariant(
      typeof listener === 'function',
      'listener must be a function.'
    );

    const { dragOffsetStore } = this;
    dragOffsetStore.addListener('change', listener);

    return function dispose() {
      dragOffsetStore.removeListener('change', listener);
    };
  }

  canDragSource(sourceId) {
    const source = this.registry.getSource(sourceId);
    invariant(source, 'Expected to find a valid source.');

    if (this.isDragging()) {
      return false;
    }

    return source.canDrag(this, sourceId);
  }

  canDropOnTarget(targetId) {
    const target = this.registry.getTarget(targetId);
    invariant(target, 'Expected to find a valid target.');

    if (!this.isDragging() || this.didDrop()) {
      return false;
    }

    const targetType = this.registry.getTargetType(targetId);
    const draggedItemType = this.getItemType();
    return matchesType(targetType, draggedItemType) &&
           target.canDrop(this, targetId);
  }

  isDragging() {
    return this.dragOperationStore.isDragging();
  }

  isDraggingSource(sourceId) {
    const source = this.registry.getSource(sourceId, true);
    invariant(source, 'Expected to find a valid source.');

    if (!this.isDragging() || !this.isSourcePublic()) {
      return false;
    }

    const sourceType = this.registry.getSourceType(sourceId);
    const draggedItemType = this.getItemType();
    if (sourceType !== draggedItemType) {
      return false;
    }

    return source.isDragging(this, sourceId);
  }

  isOverTarget(targetId, {
    shallow = false
  }: options = {}) {
    if (!this.isDragging()) {
      return false;
    }

    const targetType = this.registry.getTargetType(targetId);
    const draggedItemType = this.getItemType();
    if (!matchesType(targetType, draggedItemType)) {
      return false;
    }

    const targetIds = this.getTargetIds();
    if (!targetIds.length) {
      return false;
    }

    const index = targetIds.indexOf(targetId);
    if (shallow) {
      return index === targetIds.length - 1;
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

  getSourceId() {
    return this.dragOperationStore.getSourceId();
  }

  getTargetIds() {
    return this.dragOperationStore.getTargetIds();
  }

  getDropResult() {
    return this.dragOperationStore.getDropResult();
  }

  didDrop() {
    return this.dragOperationStore.didDrop();
  }

  isSourcePublic() {
    return this.dragOperationStore.isSourcePublic();
  }

  getInitialClientOffset() {
    return this.dragOffsetStore.getInitialClientOffset();
  }

  getInitialSourceClientOffset() {
    return this.dragOffsetStore.getInitialSourceClientOffset();
  }

  getSourceClientOffset() {
    return this.dragOffsetStore.getSourceClientOffset();
  }

  getClientOffset() {
    return this.dragOffsetStore.getClientOffset();
  }

  getDifferenceFromInitialOffset() {
    return this.dragOffsetStore.getDifferenceFromInitialOffset();
  }
}