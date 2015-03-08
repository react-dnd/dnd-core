import { DropTarget } from '..';

export class NormalTarget extends DropTarget {
  constructor(dropResult) {
    this.didCallDrop = false;
    this.dropResult = dropResult || { foo: 'bar' };
  }

  drop() {
    this.didCallDrop = true;
    return this.dropResult;
  }
}

export class NonDroppableTarget extends DropTarget {
  constructor() {
    this.didCallDrop = false;
  }

  canDrop() {
    return false;
  }

  drop() {
    this.didCallDrop = true;
  }
}

export class TargetWithNoDropResult extends DropTarget {
}

export class BadResultTarget extends DropTarget {
  drop() {
    return 42;
  }
}