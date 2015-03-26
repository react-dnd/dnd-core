import { Actions } from 'flummox';
import matchesType from '../utils/matchesType';
import invariant from 'invariant';
import isArray from 'lodash/lang/isArray';
import isObject from 'lodash/lang/isObject';

export default class DragDropActions extends Actions {
  constructor(manager) {
    super();
    this.manager = manager;
  }

  beginDrag(sourceHandle, isSourcePublic = true) {
    const monitor = this.manager.getMonitor();
    const registry = this.manager.getRegistry();
    invariant(
      !monitor.isDragging(),
      'Cannot call beginDrag while dragging.'
    );
    if (!monitor.canDrag(sourceHandle)) {
      return;
    }

    const source = registry.getSource(sourceHandle);
    const item = source.beginDrag(monitor, sourceHandle);
    invariant(isObject(item), 'Item must be an object.');

    registry.pinSource(sourceHandle);

    const itemType = registry.getSourceType(sourceHandle);
    return { itemType, item, sourceHandle, isSourcePublic };
  }

  publishDragSource() {
    const monitor = this.manager.getMonitor();
    if (!monitor.isDragging()) {
      return;
    }

    return {};
  }

  hover(targetHandles) {
    invariant(isArray(targetHandles), 'Target handles must be an array.');
    targetHandles = targetHandles.slice(0);

    const monitor = this.manager.getMonitor();
    const registry = this.manager.getRegistry();
    const draggedItemType = monitor.getItemType();

    const prevTargetHandles = monitor.getTargetHandles();
    let didChange = false;

    if (prevTargetHandles.length !== targetHandles.length) {
      didChange = true;
    }

    for (let i = 0; i < targetHandles.length; i++) {
      const targetHandle = targetHandles[i];
      invariant(
        targetHandles.lastIndexOf(targetHandle) === i,
        'Target handles should be unique in the passed array.'
      );

      const target = registry.getTarget(targetHandle);
      invariant(
        target,
        'All hovered target handles must be registered.'
      );

      const targetType = registry.getTargetType(targetHandle);
      if (matchesType(targetType, draggedItemType)) {
        target.hover(monitor, targetHandle);
      }

      if (!didChange && targetHandle !== prevTargetHandles[i]) {
        didChange = true;
      }
    }

    if (!didChange) {
      return;
    }

    return { targetHandles };
  }

  drop() {
    const monitor = this.manager.getMonitor();
    const registry = this.manager.getRegistry();
    invariant(
      monitor.isDragging(),
      'Cannot call drop while not dragging.'
    );

    const { drop: dropActionId } = this.getActionIds();
    const targetHandles = monitor
      .getTargetHandles()
      .filter(monitor.canDrop, monitor);

    targetHandles.reverse();
    targetHandles.forEach((targetHandle, index) => {
      const target = registry.getTarget(targetHandle);

      let dropResult = target.drop(monitor, targetHandle);
      invariant(
        typeof dropResult === 'undefined' || isObject(dropResult),
        'Drop result must either be an object or undefined.'
      );
      if (typeof dropResult === 'undefined') {
        dropResult = index === 0 ?
          true :
          monitor.getDropResult();
      }

      this.dispatch(dropActionId, { dropResult });
    });
  }

  endDrag() {
    const monitor = this.manager.getMonitor();
    const registry = this.manager.getRegistry();
    invariant(
      monitor.isDragging(),
      'Cannot call endDrag while not dragging.'
    );

    const sourceHandle = monitor.getSourceHandle();
    const source = registry.getSource(sourceHandle, true);
    source.endDrag(monitor, sourceHandle);

    registry.unpinSource();

    return {};
  }
}