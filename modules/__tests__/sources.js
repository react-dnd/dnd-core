export class NormalSource {
  constructor(item) {
    this.item = item || { baz: 42 };
  }

  canDrag() {
    return true;
  }

  beginDrag() {
    return this.item;
  }

  endDrag(endDragArgument) {
    this.endDragArgument = endDragArgument;
  }
};

export class NonDraggableSource {
  canDrag() {
    return false;
  }

  beginDrag() {
    return {};
  }

  endDrag() {
  }
};
