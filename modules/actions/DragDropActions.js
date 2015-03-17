import { Actions } from 'flummox'
import invariant from 'invariant';
import isObject from 'lodash/lang/isObject';

export default class DragDropActions extends Actions {
  constructor(manager) {
    super();
    this.manager = manager;
  }

  beginDrag(sourceHandle) {
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

    const { type: itemType } = sourceHandle;
    return { itemType, item, sourceHandle };
  }

  enter(targetHandle) {
    const monitor = this.manager.getMonitor();
    invariant(
      monitor.isDragging(),
      'Cannot call enter while not dragging.'
    );

    const targetHandles = monitor.getTargetHandles();
    invariant(
      targetHandles.indexOf(targetHandle) === -1,
      'Cannot enter the same target twice.'
    );

    return { targetHandle };
  }

  leave(targetHandle) {
    const monitor = this.manager.getMonitor();
    invariant(
      monitor.isDragging(),
      'Cannot call leave while not dragging.'
    );

    const targetHandles = monitor.getTargetHandles();
    invariant(
      targetHandles.indexOf(targetHandle) !== -1,
      'Cannot leave a target that was not entered.'
    );

    return { targetHandle };
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