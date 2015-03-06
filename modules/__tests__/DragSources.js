export class NormalSource {
  canDrag() {
    return true;
  }

  beginDrag() {
    return {
      baz: 42
    };
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
