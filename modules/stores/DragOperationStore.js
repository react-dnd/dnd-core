'use strict';

import { Store } from 'flummox';

export default class DragOperationStore extends Store {
  constructor(flux) {
    super();

    const actionIds = flux.getDragDropActionIds();
    this.register(actionIds.beginDrag, this.handleBeginDrag);

    this.state = {
      draggedItemType: null
    };
  }

  handleBeginDrag({ itemType }) {
    this.setState({
      draggedItemType: itemType
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