'use strict';

import { Actions } from 'flummox'
import invariant from 'invariant';
import isObject from 'lodash/lang/isObject';

export default class DragDropActions extends Actions {
  constructor(manager) {
    super();
    this.manager = manager;
  }

  beginDrag(sourceHandle) {
    const manager = this.manager;
    const context = manager.context;
    invariant(
      context.canDrag(sourceHandle),
      'Cannot call beginDrag now. Check context.canDrag(sourceHandle) first.'
    );

    const source = manager.getSource(sourceHandle);
    const item = source.beginDrag(context);
    invariant(isObject(item), 'Item must be an object.');

    const { type: itemType } = sourceHandle;
    return { itemType, item, sourceHandle };
  }

  drop(targetHandle) {
    const manager = this.manager;
    const context = manager.context;
    invariant(
      context.canDrop(targetHandle),
      'Cannot call drop now. Check context.canDrop(targetHandle) first.'
    );

    const target = manager.getTarget(targetHandle);

    let dropResult = target.drop(context);
    invariant(
      typeof dropResult === 'undefined' || isObject(dropResult),
      'Drop result must either be an object or undefined.'
    );
    if (typeof dropResult === 'undefined') {
      dropResult = true;
    }

    return { dropResult };
  }

  endDrag() {
    const manager = this.manager;
    const context = manager.context;
    invariant(
      context.canEndDrag(),
      'Cannot call endDrag now. Check context.canEndDrag() first.'
    );

    const source = manager.getDraggedSource();
    source.endDrag(context);

    return {};
  }
}