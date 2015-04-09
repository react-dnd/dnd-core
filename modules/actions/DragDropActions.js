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

  beginDrag(sourceIds, publishSource = true) {
    invariant(isArray(sourceIds), 'Expected sourceIds to be an array.');

    const monitor = this.manager.getMonitor();
    const registry = this.manager.getRegistry();
    invariant(
      !monitor.isDragging(),
      'Cannot call beginDrag while dragging.'
    );

    for (let i = 0; i < sourceIds.length; i++) {
      invariant(
        registry.getSource(sourceIds[i]),
        'Expected sourceIds to be registered.'
      );
    }

    let sourceId = null;
    for (let i = sourceIds.length - 1; i >= 0; i--) {
      if (monitor.canDrag(sourceIds[i])) {
        sourceId = sourceIds[i];
        break;
      }
    }
    if (sourceId === null) {
      return;
    }

    const source = registry.getSource(sourceId);
    const item = source.beginDrag(monitor, sourceId);
    invariant(isObject(item), 'Item must be an object.');

    registry.pinSource(sourceId);

    const itemType = registry.getSourceType(sourceId);
    return { itemType, item, sourceId, isSourcePublic: publishSource };
  }

  publishDragSource() {
    const monitor = this.manager.getMonitor();
    if (!monitor.isDragging()) {
      return;
    }

    return {};
  }

  hover(targetIds) {
    invariant(isArray(targetIds), 'Expected targetIds to be an array.');
    targetIds = targetIds.slice(0);

    const monitor = this.manager.getMonitor();
    const registry = this.manager.getRegistry();
    const draggedItemType = monitor.getItemType();

    const prevTargetIds = monitor.getTargetIds();
    let didChange = false;

    if (prevTargetIds.length !== targetIds.length) {
      didChange = true;
    }

    for (let i = 0; i < targetIds.length; i++) {
      const targetId = targetIds[i];
      invariant(
        targetIds.lastIndexOf(targetId) === i,
        'Expected targetIds to be unique in the passed array.'
      );

      const target = registry.getTarget(targetId);
      invariant(
        target,
        'Expected targetIds to be registered.'
      );

      const targetType = registry.getTargetType(targetId);
      if (matchesType(targetType, draggedItemType)) {
        target.hover(monitor, targetId);
      }

      if (!didChange && targetId !== prevTargetIds[i]) {
        didChange = true;
      }
    }

    if (!didChange) {
      return;
    }

    return { targetIds };
  }

  drop() {
    const monitor = this.manager.getMonitor();
    const registry = this.manager.getRegistry();
    invariant(
      monitor.isDragging(),
      'Cannot call drop while not dragging.'
    );

    const { drop: dropActionId } = this.getActionIds();
    const targetIds = monitor
      .getTargetIds()
      .filter(monitor.canDrop, monitor);

    targetIds.reverse();
    targetIds.forEach((targetId, index) => {
      const target = registry.getTarget(targetId);

      let dropResult = target.drop(monitor, targetId);
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

    const sourceId = monitor.getSourceId();
    const source = registry.getSource(sourceId, true);
    source.endDrag(monitor, sourceId);

    registry.unpinSource();

    return {};
  }
}