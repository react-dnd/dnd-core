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
      sourceHandle: null,
      targetHandles: [],
      dropResult: null,
      didDrop: false,
      isSourcePublic: null
    };
  }

  handleBeginDrag({ itemType, item, sourceHandle, isSourcePublic }) {
    this.setState({
      itemType,
      item,
      sourceHandle,
      isSourcePublic,
      dropResult: false,
      didDrop: false
    });
  }

  handlePublishDragSource() {
    this.setState({ isSourcePublic: true });
  }

  handleHover({ targetHandles }) {
    this.setState({ targetHandles });
  }

  handleRemoveTarget({ targetHandle }) {
    const { targetHandles } = this.state;
    if (targetHandles.indexOf(targetHandle) > -1) {
      this.setState({
        targetHandles: without(targetHandles, targetHandle)
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
      sourceHandle: null,
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

  getSourceHandle() {
    return this.state.sourceHandle;
  }

  getTargetHandles() {
    return this.state.targetHandles.slice(0);
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
