import { DropTarget } from '..';

export class NormalTarget extends DropTarget {
  constructor(dropResult) {
    this.dropResult = dropResult || { foo: 'bar' };
  }

  drop() {
    return this.dropResult;
  }
}

export class NonDroppableTarget extends DropTarget {
  canDrop() {
    return false;
  }
}

export class TargetWithNoDropResult extends DropTarget {
}

export class BadResultTarget extends DropTarget {
  drop() {
    return 42;
  }
}