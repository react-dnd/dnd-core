import { DragSource } from '..';

export class NormalSource extends DragSource {
  constructor(item) {
    this.item = item || { baz: 42 };
  }

  beginDrag() {
    return this.item;
  }

  endDrag(endDragArgument) {
    this.endDragArgument = endDragArgument;
  }
};

export class NonDraggableSource extends DragSource {
  canDrag() {
    return false;
  }

  beginDrag() {
    return {};
  }
};
