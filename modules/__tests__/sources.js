'use strict';

import { DragSource } from '..';

export class NormalSource extends DragSource {
  constructor(item) {
    this.item = item || { baz: 42 };
  }

  beginDrag() {
    return this.item;
  }

  endDrag(context) {
    this.recordedDropResult = context.getDropResult();
  }
}

export class NonDraggableSource extends DragSource {
  canDrag() {
    return false;
  }

  beginDrag() {
    return {};
  }
}