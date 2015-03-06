export default class DragDropContext {
  constructor(manager) {
    const flux = manager.getFlux();
    this.dragOperationStore = flux.getDragOperationStore();
  }

  addChangeListener(listener) {
    this.dragOperationStore.addListener('change', listener);
  }

  removeChangeListener(listener) {
    this.dragOperationStore.removeListener('change', listener);
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
