'use strict';

import Flux from './Flux';
import keyMirror from 'keymirror';
import DragDropContext from './DragDropContext';
import getNextUniqueId from './utils/getNextUniqueId';
import getIn from './utils/getIn';
import setIn from './utils/setIn';

const HandlerRoles = keyMirror({
  SOURCE: null,
  TARGET: null
});

function makePath({ role, type, id }: descriptor) {
  return [role, type, id];
}

export default class DragDropManager {
  constructor(Backend) {
    this._flux = new Flux();
    this._handlers = {};

    this._backend = new Backend(this);
    this._context = new DragDropContext(this);
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
    return this._addHandler(HandlerRoles.SOURCE, type, source);
  }

  addTarget(type, source) {
    return this._addHandler(HandlerRoles.TARGET, type, source);
  }

  _addHandler(role, type, handler) {
    const id = getNextUniqueId().toString();
    const descriptor = { role, type, id };
    const path = makePath(descriptor);

    setIn(this._handlers, path, handler);
    return descriptor;
  }

  getSource(descriptor) {
    const path = makePath(descriptor);
    return getIn(this._handlers, path);
  }

  getTarget(descriptor) {
    const path = makePath(descriptor);
    return getIn(this._handlers, path);
  }

  removeSource(descriptor) {
    const path = makePath(descriptor);
    setIn(this._handlers, path, null);
  }

  removeTarget(descriptor) {
    const path = makePath(descriptor);
    setIn(this._handlers, path, null);
  }
}