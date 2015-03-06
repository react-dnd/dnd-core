'use strict';

import Flux from './Flux';
import invariant from 'invariant';
import keyMirror from 'keymirror';
import DragDropContext from './DragDropContext';
import getNextUniqueId from './utils/getNextUniqueId';
import getIn from './utils/getIn';
import setIn from './utils/setIn';

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

function validateType(type) {
  invariant(
    typeof type === 'string' || typeof type === 'symbol',
    'Type can only be a string or a symbol.'
  );
}

function makePath({ role, type, id }: handle) {
  return [role, type, id];
}

export default class DragDropManager {
  constructor(Backend) {
    this._flux = new Flux();
    this._context = new DragDropContext(this);
    this._backend = new Backend(this);

    this._handlers = {};
  }

  getFlux() {
    return this._flux;
  }

  getBackend() {
    return this._backend;
  }

  getContext() {
    return this._context;
  }

  addSource(type, source) {
    validateType(type);
    validateSourceContract(source);

    return this._addHandler(HandlerRoles.SOURCE, type, source);
  }

  addTarget(type, source) {
    validateType(type);
    validateTargetContract(source);

    return this._addHandler(HandlerRoles.TARGET, type, source);
  }

  _addHandler(role, type, handler) {
    const id = getNextUniqueId().toString();
    const handle = { role, type, id };
    const path = makePath(handle);

    setIn(this._handlers, path, handler);
    return handle;
  }

  getSource(handle) {
    invariant(handle.role === HandlerRoles.SOURCE, 'Expected to receive a source handle');

    const path = makePath(handle);
    return getIn(this._handlers, path);
  }

  getTarget(handle) {
    invariant(handle.role === HandlerRoles.TARGET, 'Expected to receive a target handle');

    const path = makePath(handle);
    return getIn(this._handlers, path);
  }

  removeSource(handle) {
    invariant(this.getSource(handle), 'Cannot remove a source that was not added.');
    invariant(handle.role === HandlerRoles.SOURCE, 'Expected to receive a source handle');

    const path = makePath(handle);
    setIn(this._handlers, path, null);
  }

  removeTarget(handle) {
    invariant(this.getTarget(handle), 'Cannot remove a target that was not added.');
    invariant(handle.role === HandlerRoles.TARGET, 'Expected to receive a target handle');

    const path = makePath(handle);
    setIn(this._handlers, path, null);
  }
}