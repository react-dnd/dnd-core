export class NormalSource {
  canDrag() {
    return true;
  }

  beginDrag() {
    return {
      baz: 42
    };
  }
};

export class NonDraggableSource {
  canDrag() {
    return false;
  }
};
