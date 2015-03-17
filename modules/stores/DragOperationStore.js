import { Store } from 'flummox';

export default class DragOperationStore extends Store {
  constructor(flux) {
    super();

    const { dragDropActionIds, registryActionIds } = flux;
    this.register(dragDropActionIds.beginDrag, this.handleBeginDrag);
    this.register(dragDropActionIds.enter, this.handleEnter);
    this.register(dragDropActionIds.leave, this.handleLeave);
    this.register(dragDropActionIds.endDrag, this.handleEndDrag);
    this.register(dragDropActionIds.drop, this.handleDrop);
    this.register(registryActionIds.removeTarget, this.handleRemoveTarget);

    this.state = {
      itemType: null,
      item: null,
      sourceHandle: null,
      targetHandles: [],
      dropResult: null,
      didDrop: false
    };
  }

  handleBeginDrag({ itemType, item, sourceHandle }) {
    this.setState({
      itemType,
      item,
      sourceHandle,
      targetHandles: [],
      dropResult: false,
      didDrop: false
    });
  }

  handleEnter({ targetHandle }) {
    const { targetHandles } = this.state;
    this.setState({
      targetHandles: targetHandles.concat([targetHandle])
    });
  }

  handleLeave({ targetHandle }) {
    const { targetHandles } = this.state;
    const index = targetHandles.indexOf(targetHandle);

    this.setState({
      targetHandles: targetHandles.slice(0, index)
    });
  }

  handleRemoveTarget({ targetHandle }) {
    if (this.getTargetHandles().indexOf(targetHandle) > -1) {
      this.handleLeave({ targetHandle });
    }
  }

  handleDrop({ dropResult }) {
    this.setState({
      dropResult,
      didDrop: true,
      targetHandles: []
    });
  }

  handleEndDrag() {
    this.setState({
      itemType: null,
      item: null,
      sourceHandle: null,
      targetHandles: [],
      dropResult: null,
      didDrop: false
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
    return this.state.targetHandles;
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
}
