export class NormalTarget {
  constructor(dropResult) {
    this.dropResult = dropResult || { foo: 'bar' };
  }

  canDrop() {
    return true;
  }

  drop() {
    return this.dropResult;
  }
};

export class NonDroppableTarget {
  canDrop() {
    return false;
  }

  drop() {
  }
}

export class TargetWithNoDropResult {
  canDrop() {
    return true;
  }

  drop() {
  }
};
