'use strict';

import { Actions } from 'flummox'
import invariant from 'invariant';
import isObject from 'lodash/lang/isObject';

export default class DragDropActions extends Actions {
  constructor(flux) {
    super();
    this.getDragOperationStore = flux.getDragOperationStore.bind(flux);
  }

  beginDrag({ itemType, item, sourceHandle }) {
    invariant(itemType, 'Type must be specified.');
    invariant(isObject(item), 'Item must be an object.');
    invariant(
      !this.getDragOperationStore().isDragging(),
      'Cannot call beginDrag while already dragging.'
    );

    return { itemType, item, sourceHandle };
  }

  endDrag() {
    invariant(
      this.getDragOperationStore().isDragging(),
      'Cannot call endDrag while not dragging.'
    );

    return {};
  }

  drop({ dropResult }) {
    invariant(
      this.getDragOperationStore().isDragging(),
      'Cannot call drop while not dragging.'
    );

    invariant(
      typeof dropResult === 'undefined' || isObject(dropResult),
      'Drop result must either be an object or undefined.'
    );

    return { dropResult };
  }
}
