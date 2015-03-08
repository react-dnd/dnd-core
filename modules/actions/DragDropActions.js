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
    const item = source.beginDrag(context, sourceHandle);
    invariant(isObject(item), 'Item must be an object.');

    registry.pinSource(sourceHandle);

    const { type: itemType } = sourceHandle;
    return { itemType, item, sourceHandle };
  }

  enter(targetHandle) {
    const { context } = this.manager;
    const targetHandles = context.getTargetHandles();
    invariant(
      targetHandles.indexOf(targetHandle) === -1,
      'Cannot enter the same target twice.'
    );

    return { targetHandle };
  }

  leave(targetHandle) {
    const { context } = this.manager;
    const targetHandles = context.getTargetHandles();
    invariant(
      targetHandles.indexOf(targetHandle) !== -1,
      'Cannot leave a target that was not entered.'
    );

    return { targetHandle };
  }

  drop() {
    const { context, registry } = this.manager;
    invariant(
      context.isDragging(),
      'Cannot call drop while not dragging.'
    );

    const targetHandles = context.getTargetHandles();
    if (!targetHandles.length) {
      return;
    }
    const targetHandle = targetHandles[targetHandles.length - 1];
    if (!context.canDrop(targetHandle)) {
      return;
    }

    const target = registry.getTarget(targetHandle);
    let dropResult = target.drop(context, targetHandle);
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
    const { context, registry } = this.manager;
    invariant(
      context.isDragging(),
      'Cannot call endDrag while not dragging.'
    );

    const sourceHandle = context.getSourceHandle();
    const source = registry.getSource(sourceHandle, true);
    source.endDrag(context, sourceHandle);

    registry.unpinSource();

    return {};
  }
}