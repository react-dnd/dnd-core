'use strict';

import { Store } from 'flummox';

export default class DragOperationStore extends Store {
  constructor(flux) {
    super();

    const actionIds = flux.getDragDropActionIds();

    this.register(actionIds.beginDrag, this.handleBeginDrag);
    this.register(actionIds.endDrag, this.handleEndDrag);

    this.state = {
      draggedItemType: null
    };
  }

  handleBeginDrag({ itemType }) {
    this.setState({
      draggedItemType: itemType
    });
  }

  handleEndDrag() {
    this.setState({
      draggedItemType: null
    });
  }

  getDraggedItemType() {
    const { draggedItemType } = this.state;
    return draggedItemType;
  }

  isDragging() {
    return Boolean(this.getDraggedItemType());
  }
};
