export class NormalTarget {
  canDrop() {
    return true;
  }

  drop() {
    return {
      foo: 'bar'
    };
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
