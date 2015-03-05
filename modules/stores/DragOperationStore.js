'use strict';

export default class DragOperationStore {
  constructor() {
    this.bindActions(this.alt.dragDropActions);

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