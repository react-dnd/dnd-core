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

export default class DragDropManager {
  constructor(Backend) {
    const flux = new Flux(this);

    this.handlers = {};
    this.flux = flux;
    this.context = new DragDropContext(this);
    this.backend = new Backend(flux.dragDropActions);

    this.context.addChangeListener(this._updateDraggedSource, this);
    this._updateDraggedSource();
  }

  dispose() {
    this.context.removeChangeListener(this._updateDraggedSource, this);
  }

  _updateDraggedSource() {
    const handle = this.context.getDraggedSourceHandle();
    if (handle) {
      this.draggedSource = this.getSource(handle);
    } else {
      this.draggedSource = null;
    }
  }

  getContext() {
    return this.context;
  }

  getBackend() {
    return this.backend;
  }

  addSource(type, source) {
    validateType(type);
    validateSourceContract(source);

    const handle = this._addHandler(HandlerRoles.SOURCE, type, source);
    validateSourceHandle(handle);
    return handle;
  }

  addTarget(type, source) {
    validateType(type);
    validateTargetContract(source);

    const handle = this._addHandler(HandlerRoles.TARGET, type, source);
    validateTargetHandle(handle);
    return handle;
  }

  getDraggedSource() {
    return this.draggedSource;
  }

  getSource(handle) {
    validateSourceHandle(handle);

    const path = makePath(handle);
    return getIn(this.handlers, path);
  }

  getTarget(handle) {
    validateTargetHandle(handle);

    const path = makePath(handle);
    return getIn(this.handlers, path);
  }

  removeSource(handle) {
    validateSourceHandle(handle);
    invariant(this.getSource(handle), 'Cannot remove a source that was not added.');

    const path = makePath(handle);
    setIn(this.handlers, path, null);
  }

  removeTarget(handle) {
    validateTargetHandle(handle);
    invariant(this.getTarget(handle), 'Cannot remove a target that was not added.');

    const path = makePath(handle);
    setIn(this.handlers, path, null);
  }

  _addHandler(role, type, handler) {
    const id = getNextUniqueId().toString();
    const handle = { role, type, id };
    const path = makePath(handle);

    setIn(this.handlers, path, handler);
    return handle;
  }
}