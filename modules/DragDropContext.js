export default class DragDropContext {
  constructor(manager) {
    const flux = manager.getFlux();
    this.dragOperationStore = flux.getDragOperationStore();
  }

  addListener(...args) {
    this.dragOperationStore.addListener(...args);
  }

  removeListener(...args) {
    this.dragOperationStore.removeListener(...args);
  }

  isDragging() {
    return this.dragOperationStore.isDragging();
  }
}
