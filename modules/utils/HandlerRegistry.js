import invariant from 'invariant';
import keyMirror from 'keymirror';
import isArray from 'lodash/lang/isArray';
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
  invariant(typeof target.canDrop === 'function', 'Expected canDrop to be a function.');
  invariant(typeof target.hover === 'function', 'Expected hover to be a function.');
  invariant(typeof target.drop === 'function', 'Expected beginDrag to be a function.');
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

function getNextHandlerId(role) {
  const id = getNextUniqueId().toString();
  switch (role) {
  case HandlerRoles.SOURCE:
    return `S${id}`;
  case HandlerRoles.TARGET:
    return `T${id}`;
  default:
    invariant(false, `Unknown role: ${role}`);
  }
}

function parseRoleFromHandlerId(handlerId) {
  switch (handlerId[0]) {
  case 'S':
    return HandlerRoles.SOURCE;
  case 'T':
    return HandlerRoles.TARGET;
  default:
    invariant(false, `Cannot parse handler ID: ${handlerId}`);
  }
}

export default class HandlerRegistry {
  constructor(actions) {
    this.actions = actions;

    this.types = {};
    this.handlers = {};

    this.pinnedSourceId = null;
    this.pinnedSource = null;
  }

  addSource(type, source) {
    validateType(type);
    validateSourceContract(source);

    const sourceId = this.addHandler(HandlerRoles.SOURCE, type, source);
    this.actions.addSource(sourceId);
    return sourceId;
  }

  addTarget(type, target) {
    validateType(type, true);
    validateTargetContract(target);

    const targetId = this.addHandler(HandlerRoles.TARGET, type, target);
    this.actions.addTarget(targetId);
    return targetId;
  }

  addHandler(role, type, handler) {
    if (process.env.NODE_ENV !== 'production') {
      invariant(!this.containsHandler(handler), 'Cannot add the same handler instance twice.');
    }

    const id = getNextHandlerId(role);
    this.types[id] = type;
    this.handlers[id] = handler;

    return id;
  }

  containsHandler(handler) {
    return Object.keys(this.handlers).some(key => this.handlers[key] === handler);
  }

  getSource(sourceId, includePinned) {
    invariant(this.isSourceId(sourceId), 'Expected a valid source ID.');

    const isPinned = includePinned && sourceId === this.pinnedSourceId;
    const source = isPinned ? this.pinnedSource : this.handlers[sourceId];

    return source;
  }

  getTarget(targetId) {
    invariant(this.isTargetId(targetId), 'Expected a valid target ID.');
    return this.handlers[targetId];
  }

  getSourceType(sourceId) {
    invariant(this.isSourceId(sourceId), 'Expected a valid source ID.');
    return this.types[sourceId];
  }

  getTargetType(targetId) {
    invariant(this.isTargetId(targetId), 'Expected a valid target ID.');
    return this.types[targetId];
  }

  isSourceId(handlerId) {
    const role = parseRoleFromHandlerId(handlerId);
    return role === HandlerRoles.SOURCE;
  }

  isTargetId(handlerId) {
    const role = parseRoleFromHandlerId(handlerId);
    return role === HandlerRoles.TARGET;
  }

  removeSource(sourceId) {
    invariant(this.getSource(sourceId), 'Expected an existing source.');

    delete this.handlers[sourceId];
    delete this.types[sourceId];

    this.actions.removeSource(sourceId);
  }

  removeTarget(targetId) {
    invariant(this.getTarget(targetId), 'Expected an existing target.');

    delete this.handlers[targetId];
    delete this.types[targetId];

    this.actions.removeTarget(targetId);
  }

  pinSource(sourceId) {
    const source = this.getSource(sourceId);
    invariant(source, 'Expected an existing source.');

    this.pinnedSourceId = sourceId;
    this.pinnedSource = source;
  }

  unpinSource() {
    invariant(this.pinnedSource, 'No source is pinned at the time.');

    this.pinnedSourceId = null;
    this.pinnedSource = null;
  }
}