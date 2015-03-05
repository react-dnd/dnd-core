export default class DragDropContext {
  constructor(manager) {
    this.alt = manager.getAlt();
  }

  isDragging() {
    return this.alt.dragOperationStore.isDragging();
  }
}