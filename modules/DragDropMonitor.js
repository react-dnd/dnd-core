import invariant from 'invariant';
import matchesType from './utils/matchesType';

export default class DragDropMonitor {
  constructor(flux, registry) {
    this.dragOperationStore = flux.dragOperationStore;
    this.registry = registry;
  }

  addChangeListener(listener) {
    this.dragOperationStore.addListener('change', listener);
  }

  removeChangeListener(listener) {
    this.dragOperationStore.removeListener('change', listener);
  }

  canDrag(sourceId) {
    const source = this.registry.getSource(sourceId);
    invariant(source, 'Expected to find a valid source.');

    if (this.isDragging()) {
      return false;
    }

    return source.canDrag(this, sourceId);
  }

  canDrop(targetId) {
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

  isDragging(sourceId) {
    const isDragging = this.dragOperationStore.isDragging();
    if (!isDragging || typeof sourceId === 'undefined') {
      return isDragging;
    }

    const sourceType = this.registry.getSourceType(sourceId);
    const draggedItemType = this.getItemType();
    if (sourceType !== draggedItemType) {
      return false;
    }

    if (!this.isSourcePublic()) {
      return false;
    }

    let source = this.registry.getSource(sourceId, true);
    if (!source) {
      return false;
    }

    return source.isDragging(this, sourceId);
  }

  isOver(targetId, shallow = false) {
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
}