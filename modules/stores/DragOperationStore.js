'use strict';

export default class DragOperationStore {
  constructor() {
    const actions = this.alt.getDragDropActions();
    this.bindActions(actions);

    this.draggedItemType = null;
  }

  beginDrag({ itemType }) {
    this.draggedItemType = itemType;
  }

  static getDraggedItemType() {
    const { draggedItemType } = this.getState();
    return draggedItemType;
  }

  static isDragging() {
    return Boolean(this.getDraggedItemType());
  }
};