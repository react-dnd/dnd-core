import { Store } from 'flummox';
import without from 'lodash/array/without';

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

  handleBeginDrag({ itemType, item, sourceId, isSourcePublic }) {
    this.setState({
      itemType,
      item,
      sourceId,
      isSourcePublic,
      dropResult: false,
      didDrop: false
    });
  }

  handlePublishDragSource() {
    this.setState({ isSourcePublic: true });
  }

  handleHover({ targetIds }) {
    this.setState({ targetIds });
  }

  handleRemoveTarget({ targetId }) {
    const { targetIds } = this.state;
    if (targetIds.indexOf(targetId) > -1) {
      this.setState({
        targetIds: without(targetIds, targetId)
      });
    }
  }

  handleDrop({ dropResult }) {
    this.setState({
      dropResult,
      didDrop: true
    });
  }

  handleEndDrag() {
    this.setState({
      itemType: null,
      item: null,
      sourceId: null,
      dropResult: null,
      didDrop: false,
      isSourcePublic: null
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
}
