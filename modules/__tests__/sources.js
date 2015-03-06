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
  constructor(number) {
    this.number = number;
  }

  beginDrag() {
    return {
      number: this.number
    };
  }
}

export class NumberPredicateMirrorSource extends DragSource {
  constructor(predicate) {
    this.predicate = predicate;
  }

  canDrag() {
    return false;
  }

  isDragging(context) {
    const item = context.getDraggedItem();
    return this.predicate(item.number);
  }

  beginDrag() {
    return {};
  }
}