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
  constructor() {
    this.didCallDrop = false;
  }

  drop() {
    this.didCallDrop = true;
  }
}

export class BadResultTarget extends DropTarget {
  drop() {
    return 42;
  }
}

export class TransformResultTarget extends DropTarget {
  constructor(transform) {
    this.transform = transform;
    this.didCallDrop = false;
  }

  drop(context) {
    this.didCallDrop = true;
    const dropResult = context.getDropResult();
    return this.transform(dropResult);
  }
}