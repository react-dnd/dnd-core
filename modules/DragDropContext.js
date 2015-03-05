export default class DragDropContext {
  constructor(manager) {
    const flux = manager.getFlux();
    this.dragOperationStore = flux.getDragOperationStore();
  }

  isDragging() {
    return this.dragOperationStore.isDragging();
  }
}