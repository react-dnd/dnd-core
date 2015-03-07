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

export class BadItemSource extends DragSource {
  beginDrag() {
    return 42;
  }
}

export class NumberSource extends DragSource {
  constructor(number, allowDrag) {
    this.number = number;
    this.allowDrag = allowDrag;
  }

  canDrag() {
    return this.allowDrag;
  }

  isDragging(context) {
    const item = context.getDraggedItem();
    return item.number === this.number;
  }

  beginDrag() {
    return {
      number: this.number
    };
  }
}