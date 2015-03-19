export default class TestBackend {
  constructor(actions) {
    this.actions = actions;
    this.isActive = undefined;
  }

  setup() {
    this.isActive = true;
  }

  teardown() {
    this.isActive = false;
  }

  simulateBeginDrag(sourceHandle, isSourcePublic) {
    this.actions.beginDrag(sourceHandle, isSourcePublic);
  }

  simulatePublishDragSource() {
    this.actions.publishDragSource();
  }

  simulateHover(targetHandles) {
    this.actions.hover(targetHandles);
  }

  simulateDrop() {
    this.actions.drop();
  }

  simulateEndDrag() {
    this.actions.endDrag();
  }
}
