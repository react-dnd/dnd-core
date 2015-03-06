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
    return this._addHandler(HandlerRoles.SOURCE, type, source);
  }

  addTarget(type, source) {
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
    const path = makePath(handle);
    return getIn(this._handlers, path);
  }

  getTarget(handle) {
    const path = makePath(handle);
    return getIn(this._handlers, path);
  }

  removeSource(handle) {
    const path = makePath(handle);
    setIn(this._handlers, path, null);
  }

  removeTarget(handle) {
    const path = makePath(handle);
    setIn(this._handlers, path, null);
  }
}