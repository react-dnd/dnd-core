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

  beginDrag(sourceIds, {
    publishSource = true,
    clientOffset = null,
    getSourceClientOffset
  }: options = {}) {
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
      if (monitor.canDragSource(sourceIds[i])) {
        sourceId = sourceIds[i];
        break;
      }
    }
    if (sourceId === null) {
      return;
    }

    let sourceClientOffset = null;
    if (clientOffset) {
      invariant(
        typeof getSourceClientOffset === 'function',
        'When clientOffset is provided, getSourceClientOffset must be a function.'
      );
      sourceClientOffset = getSourceClientOffset(sourceId);
    }

    const source = registry.getSource(sourceId);
    const item = source.beginDrag(monitor, sourceId);
    invariant(isObject(item), 'Item must be an object.');

    registry.pinSource(sourceId);

    const itemType = registry.getSourceType(sourceId);
    return {
      itemType,
      item,
      sourceId,
      clientOffset,
      sourceClientOffset,
      isSourcePublic: publishSource
    };
  }

  publishDragSource() {
    const monitor = this.manager.getMonitor();
    if (!monitor.isDragging()) {
      return;
    }

    return {};
  }

  hover(targetIds, { clientOffset = null } = {}) {
    invariant(isArray(targetIds), 'Expected targetIds to be an array.');
    targetIds = targetIds.slice(0);

    const monitor = this.manager.getMonitor();
    const registry = this.manager.getRegistry();
    invariant(
      monitor.isDragging(),
      'Cannot call hover while not dragging.'
    );
    invariant(
      !monitor.didDrop(),
      'Cannot call hover after drop.'
    );

    const draggedItemType = monitor.getItemType();
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
    }

    return { targetIds, clientOffset };
  }

  drop() {
    const monitor = this.manager.getMonitor();
    const registry = this.manager.getRegistry();
    invariant(
      monitor.isDragging(),
      'Cannot call drop while not dragging.'
    );
    invariant(
      !monitor.didDrop(),
      'Cannot call drop twice during one drag operation.'
    );

    const { drop: dropActionId } = this.getActionIds();
    const targetIds = monitor
      .getTargetIds()
      .filter(monitor.canDropOnTarget, monitor);

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
          {} :
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