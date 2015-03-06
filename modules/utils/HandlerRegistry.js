'use strict';

import invariant from 'invariant';
import keyMirror from 'keymirror';
import getIn from './getIn';
import setIn from './setIn';
import getNextUniqueId from './getNextUniqueId';
import EventEmitter from 'eventemitter3';

const HandlerRoles = keyMirror({
  SOURCE: null,
  TARGET: null
});

function validateSourceContract(source) {
  invariant(typeof source.canDrag === 'function', 'Expected canDrag to be a function.');
  invariant(typeof source.beginDrag === 'function', 'Expected beginDrag to be a function.');
  invariant(typeof source.endDrag === 'function', 'Expected endDrag to be a function.');
}

function validateTargetContract(target) {
  invariant(typeof target.drop === 'function', 'Expected beginDrag to be a function.');
}

function validateSourceHandle(handle) {
  invariant(handle.role === HandlerRoles.SOURCE, 'Expected to receive a source handle');
}

function validateTargetHandle(handle) {
  invariant(handle.role === HandlerRoles.TARGET, 'Expected to receive a target handle');
}

function validateType(type) {
  invariant(
    typeof type === 'string' || typeof type === 'symbol',
    'Type can only be a string or a symbol.'
  );
}

function makePath({ role, type, id }: handle) {
  return [role, type, id];
}

export default class HandlerRegistry extends EventEmitter {
  constructor() {
    this.handlers = {};
    this.pinned = {};
  }

  addSource(type, source) {
    validateType(type);
    validateSourceContract(source);

    const handle = this.addHandler(HandlerRoles.SOURCE, type, source);
    validateSourceHandle(handle);

    this.emit('change');
    return handle;
  }

  addTarget(type, target) {
    validateType(type);
    validateTargetContract(target);

    const handle = this.addHandler(HandlerRoles.TARGET, type, target);
    validateTargetHandle(handle);

    this.emit('change');
    return handle;
  }

  addHandler(role, type, handler) {
    const id = getNextUniqueId().toString();
    const handle = { role, type, id };
    const path = makePath(handle);

    setIn(this.handlers, path, handler);
    return handle;
  }

  getSource(handle) {
    validateSourceHandle(handle);

    const path = makePath(handle);
    return getIn(this.handlers, path);
  }

  getPinnedSource(handle) {
    validateSourceHandle(handle);

    const path = makePath(handle);
    return getIn(this.pinned, path);
  }

  getTarget(handle) {
    validateTargetHandle(handle);

    const path = makePath(handle);
    return getIn(this.handlers, path);
  }

  pinSource(handle) {
    const path = makePath(handle);
    const handler = this.getSource(handle);
    invariant(handler, 'Cannot pin a source that was not added.');

    setIn(this.pinned, path, handler);
  }

  unpinSource(handle) {
    validateSourceHandle(handle);
    invariant(this.getPinnedSource(handle), 'Cannot unpin a source that was not pinned.');

    const path = makePath(handle);
    setIn(this.pinned, path, null);
  }

  removeSource(handle) {
    validateSourceHandle(handle);
    invariant(this.getSource(handle), 'Cannot remove a source that was not added.');

    const path = makePath(handle);
    setIn(this.handlers, path, null);
    this.emit('change');
  }

  removeTarget(handle) {
    validateTargetHandle(handle);
    invariant(this.getTarget(handle), 'Cannot remove a target that was not added.');

    const path = makePath(handle);
    setIn(this.handlers, path, null);
    this.emit('change');
  }
}