import { Store } from 'flummox';
import xor from 'lodash/array/xor';
import without from 'lodash/array/without';
import intersection from 'lodash/array/intersection';

const ALL_DIRTY_WILDCARD = { __all__: true };

export default class DragOperationStore extends Store {
  constructor(flux) {
    super();

    const { dragDropActionIds, registryActionIds } = flux;
    this.register(dragDropActionIds.beginDrag, this.handleBeginDrag);
    this.register(dragDropActionIds.publishDragSource, this.handlePublishDragSource);
    this.register(dragDropActionIds.hover, this.handleHover);
    this.register(dragDropActionIds.endDrag, this.handleEndDrag);
    this.register(dragDropActionIds.drop, this.handleDrop);
    this.register(registryActionIds.removeTarget, this.handleRemoveTarget);

    this.dirtyHandlerIds = [];
    this.state = {
      itemType: null,
      item: null,
      sourceId: null,
      targetIds: [],
      dropResult: null,
      didDrop: false,
      isSourcePublic: null
    };
  }

  setState(nextState, dirtyHandlerIds = ALL_DIRTY_WILDCARD) {
    this.dirtyHandlerIds = dirtyHandlerIds;
    super.setState(nextState);
  }

  handleBeginDrag({ itemType, item, sourceId, isSourcePublic }) {
    this.setState({
      itemType,
      item,
      sourceId,
      isSourcePublic,
      dropResult: null,
      didDrop: false
    });
  }

  handlePublishDragSource() {
    this.setState({
      isSourcePublic: true
    });
  }

  handleHover({ targetIds }) {
    const { targetIds: prevTargetIds } = this.state;
    const dirtyHandlerIds = xor(targetIds, prevTargetIds);

    let didChange = false;
    if (dirtyHandlerIds.length === 0) {
      for (let i = 0; i < targetIds.length; i++) {
        if (targetIds[i] !== prevTargetIds[i]) {
          didChange = true;
          break;
        }
      }
    } else {
      didChange = true;
    }

    if (didChange) {
      this.setState({
        targetIds
      }, dirtyHandlerIds);
    }
  }

  handleRemoveTarget({ targetId }) {
    const { targetIds } = this.state;
    if (targetIds.indexOf(targetId) === -1) {
      return;
    }

    this.setState({
      targetIds: without(targetIds, targetId)
    }, []);
  }

  handleDrop({ dropResult }) {
    this.setState({
      dropResult,
      didDrop: true,
      targetIds: []
    });
  }

  handleEndDrag() {
    this.setState({
      itemType: null,
      item: null,
      sourceId: null,
      dropResult: null,
      didDrop: false,
      isSourcePublic: null,
      targetIds: []
    });
  }

  isDragging() {
    return Boolean(this.getItemType());
  }

  getItemType() {
    return this.state.itemType;
  }

  getSourceId() {
    return this.state.sourceId;
  }

  getTargetIds() {
    return this.state.targetIds.slice(0);
  }

  getItem() {
    return this.state.item;
  }

  getDropResult() {
    return this.state.dropResult;
  }

  didDrop() {
    return this.state.didDrop;
  }

  isSourcePublic() {
    return this.state.isSourcePublic;
  }

  areDirty(handlerIds) {
    if (this.dirtyHandlerIds === ALL_DIRTY_WILDCARD) {
      return true;
    }

    return intersection(
      handlerIds,
      this.dirtyHandlerIds
    ).length > 0;
  }
}
