import { Actions } from 'flummox'
import invariant from 'invariant';
import isObject from 'lodash/lang/isObject';

export default class DragDropActions extends Actions {
  constructor(manager) {
    super();
    this.manager = manager;
  }

  beginDrag(sourceHandle) {
    const { context, registry } = this.manager;
    invariant(
      !context.isDragging(),
      'Cannot call beginDrag while dragging.'
    );
    if (!context.canDrag(sourceHandle)) {
      return;
    }

    const source = registry.getSource(sourceHandle);
    const item = source.beginDrag(context);
    invariant(isObject(item), 'Item must be an object.');

    registry.setActiveSource(sourceHandle);
    const { type: itemType } = sourceHandle;
    return { itemType, item, sourceHandle };
  }

  enter(targetHandle) {
    const { registry } = this.manager;
    registry.pushActiveTarget(targetHandle);
  }

  leave(targetHandle) {
    const { registry } = this.manager;
    registry.popActiveTarget(targetHandle);
  }

  drop() {
    const { context, registry } = this.manager;
    const targetHandles = registry.getActiveTargetHandles();
    invariant(
      targetHandles.length > 0,
      'Cannot call drop before any targets have entered.'
    );

    const targetHandle = targetHandles[targetHandles.length - 1];
    invariant(
      context.canDrop(targetHandle),
      'Cannot call drop now. Check context.canDrop(targetHandle) first.'
    );

    const target = registry.getTarget(targetHandle);
    let dropResult = target.drop(context);
    invariant(
      typeof dropResult === 'undefined' || isObject(dropResult),
      'Drop result must either be an object or undefined.'
    );
    if (typeof dropResult === 'undefined') {
      dropResult = true;
    }

    registry.clearActiveTarget();

    return { dropResult };
  }

  endDrag() {
    const { context, registry } = this.manager;
    invariant(
      context.isDragging(),
      'Cannot call endDrag while not dragging.'
    );

    const source = registry.getActiveSource();
    source.endDrag(context);

    registry.clearActiveSource();
    registry.clearActiveTarget();

    return {};
  }
}