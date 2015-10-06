import xor from 'lodash/array/xor';
import intersection from 'lodash/array/intersection';
import { BEGIN_DRAG, PUBLISH_DRAG_SOURCE, HOVER, END_DRAG, DROP } from '../actions/dragDrop';
import { ADD_SOURCE, ADD_TARGET, REMOVE_SOURCE, REMOVE_TARGET } from '../actions/registry';

const NONE = [];
const ALL = [];

export default function dirtyHandlerIds(state = NONE, action, dragOperation) {
  switch (action.type) {
  case HOVER:
    return ALL;
  case ADD_SOURCE:
  case ADD_TARGET:
  case REMOVE_TARGET:
  case REMOVE_SOURCE:
    return NONE;
  case BEGIN_DRAG:
  case PUBLISH_DRAG_SOURCE:
  case END_DRAG:
  case DROP:
  default:
    return ALL;
  }
}

export function areDirty(state, handlerIds) {
  if (state === NONE) {
    return false;
  }

  if (state === ALL || typeof handlerIds === 'undefined') {
    return true;
  }

  return intersection(handlerIds, state).length > 0;
}
