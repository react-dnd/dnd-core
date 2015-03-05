export default class DragDropContext {
  constructor(alt) {
    this.dragOperationStore = alt.getDragOperationStore();
  }

  isDragging() {
    return this.dragOperationStore.isDragging();
  }
}