import invariant from 'invariant';
import keyMirror from 'keymirror';
import getIn from './getIn';
import setIn from './setIn';
import getNextUniqueId from './getNextUniqueId';

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

export default class HandlerRegistry {
  constructor(actions) {
    this.actions = actions;

    this.handlers = {};
    this.pinnedSourceHandle = null;
    this.pinnedSource = null;
  }

  addSource(type, source) {
    validateType(type);
    validateSourceContract(source);

    const sourceHandle = this.addHandler(HandlerRoles.SOURCE, type, source);
    validateSourceHandle(sourceHandle);

    this.actions.addSource(sourceHandle);
    return sourceHandle;
  }

  addTarget(type, target) {
    validateType(type);
    validateTargetContract(target);

    const targetHandle = this.addHandler(HandlerRoles.TARGET, type, target);
    validateTargetHandle(targetHandle);

    this.actions.addTarget(targetHandle);
    return targetHandle;
  }

  addHandler(role, type, handler) {
    const id = getNextUniqueId().toString();
    const handle = { role, type, id };
    const path = makePath(handle);

    setIn(this.handlers, path, handler);
    return handle;
  }

  getSource(sourceHandle, includePinned) {
    validateSourceHandle(sourceHandle);

    const path = makePath(sourceHandle);
    const isPinned = includePinned && sourceHandle === this.pinnedSourceHandle;
    const source = isPinned ? this.pinnedSource : getIn(this.handlers, path);

    return source;
  }

  getTarget(targetHandle) {
    validateTargetHandle(targetHandle);

    const path = makePath(targetHandle);
    return getIn(this.handlers, path);
  }

  removeSource(sourceHandle) {
    validateSourceHandle(sourceHandle);
    invariant(this.getSource(sourceHandle), 'Cannot remove a source that was not added.');

    const path = makePath(sourceHandle);
    setIn(this.handlers, path, null);
    this.actions.removeSource(sourceHandle);
  }

  removeTarget(targetHandle) {
    validateTargetHandle(targetHandle);
    invariant(this.getTarget(targetHandle), 'Cannot remove a target that was not added.');

    const path = makePath(targetHandle);
    setIn(this.handlers, path, null);
    this.actions.removeTarget(targetHandle);
  }

  pinSource(handle) {
    const source = this.getSource(handle);
    invariant(source, 'Cannot pin a source that was not added.');

    this.pinnedSourceHandle = handle;
    this.pinnedSource = source;
  }

  unpinSource() {
    invariant(this.pinnedSource, 'No source is pinned at the time.');

    this.pinnedSourceHandle = null;
    this.pinnedSource = null;
  }
}