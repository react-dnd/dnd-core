import invariant from 'invariant';
import keyMirror from 'keymirror';
import isArray from 'lodash/lang/isArray';
import getNextUniqueId from './getNextUniqueId';

const HandlerRoles = keyMirror({
  SOURCE: null,
  TARGET: null
});

const HANDLE_SEPARATOR = '🐲';
const TYPE_SEPARATOR = '💧';

function parseHandle(handle) {
  let [type, role, id] = handle.split(HANDLE_SEPARATOR);
  if (type.indexOf(TYPE_SEPARATOR) > -1) {
    type = type.split(TYPE_SEPARATOR);
  }
  return { type, role, id };
}

function makeHandle({ type, role, id }) {
  if (isArray(type)) {
    type = type.join(TYPE_SEPARATOR);
  }
  return [type, role, id].join(HANDLE_SEPARATOR);
}

function validateSourceContract(source) {
  invariant(typeof source.canDrag === 'function', 'Expected canDrag to be a function.');
  invariant(typeof source.beginDrag === 'function', 'Expected beginDrag to be a function.');
  invariant(typeof source.endDrag === 'function', 'Expected endDrag to be a function.');
}

function validateTargetContract(target) {
  invariant(typeof target.drop === 'function', 'Expected beginDrag to be a function.');
}

function validateSourceHandle(handle) {
  const { role } = parseHandle(handle);
  invariant(role === HandlerRoles.SOURCE, 'Expected to receive a source handle');
}

function validateTargetHandle(handle) {
  const { role } = parseHandle(handle);
  invariant(role === HandlerRoles.TARGET, 'Expected to receive a target handle');
}

function validateType(type, allowArray) {
  if (allowArray && isArray(type)) {
    type.forEach(t => validateType(t, false));
    return;
  }

  invariant(
    typeof type === 'string',
    allowArray ?
      'Type can only be a string or an array of them.' :
      'Type can only be a string.'
  );
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
    validateType(type, true);
    validateTargetContract(target);

    const targetHandle = this.addHandler(HandlerRoles.TARGET, type, target);
    validateTargetHandle(targetHandle);

    this.actions.addTarget(targetHandle);
    return targetHandle;
  }

  addHandler(role, type, handler) {
    const id = getNextUniqueId().toString();
    const handle = makeHandle({ role, type, id });

    this.handlers[handle] = handler;
    return handle;
  }

  getSource(sourceHandle, includePinned) {
    validateSourceHandle(sourceHandle);

    const isPinned = includePinned && sourceHandle === this.pinnedSourceHandle;
    const source = isPinned ? this.pinnedSource : this.handlers[sourceHandle];

    return source;
  }

  getTarget(targetHandle) {
    validateTargetHandle(targetHandle);
    return this.handlers[targetHandle];
  }

  getSourceType(sourceHandle) {
    validateSourceHandle(sourceHandle);
    const { type } = parseHandle(sourceHandle);
    return type;
  }

  getTargetType(targetHandle) {
    validateTargetHandle(targetHandle);
    const { type } = parseHandle(targetHandle);
    return type;
  }

  removeSource(sourceHandle) {
    validateSourceHandle(sourceHandle);
    invariant(this.getSource(sourceHandle), 'Cannot remove a source that was not added.');

    this.handlers[sourceHandle] = null;
    this.actions.removeSource(sourceHandle);
  }

  removeTarget(targetHandle) {
    validateTargetHandle(targetHandle);
    invariant(this.getTarget(targetHandle), 'Cannot remove a target that was not added.');

    this.handlers[targetHandle] = null;
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