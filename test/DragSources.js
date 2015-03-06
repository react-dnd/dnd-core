export class NormalSource {
  canDrag() {
    return true;
  }

  beginDrag() {
    return {
      baz: 42
    };
  }

  endDrag(data) {
    this.data = data;
  }
};

export class NonDraggableSource {
  canDrag() {
    return false;
  }
};
