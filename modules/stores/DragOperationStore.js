'use strict';

import { Store } from 'flummox';

export default class DragOperationStore extends Store {
  constructor(flux) {
    super();

    const actionIds = flux.getDragDropActionIds();

    this.register(actionIds.beginDrag, this.handleBeginDrag);
    this.register(actionIds.endDrag, this.handleEndDrag);
    this.register(actionIds.drop, this.handleDrop);

    this.state = {
      draggedItemType: null,
      draggedItem: null,
      draggedSourceHandle: null,
      dropResult: null,
      didDrop: false
    };
  }

  handleBeginDrag({ itemType, item, sourceHandle }) {
    this.setState({
      draggedItemType: itemType,
      draggedItem: item,
      draggedSourceHandle: sourceHandle,
      didDrop: false
    });
  }

  handleDrop({ dropResult }) {
    this.setState({
      dropResult,
      didDrop: true
    });
  }

  handleEndDrag() {
    this.setState({
      draggedItemType: null,
      draggedItem: null,
      draggedSourceHandle: null,
      dropResult: null,
      didDrop: false
    });
  }

  isDragging() {
    return Boolean(this.getDraggedItemType());
  }

  getDraggedItemType() {
    return this.state.draggedItemType;
  }

  getDraggedSourceHandle() {
    return this.state.draggedSourceHandle;
  }

  getDraggedItem() {
    return this.state.draggedItem;
  }

  getDropResult() {
    return this.state.dropResult;
  }

  didDrop() {
    return this.state.didDrop;
  }
};
