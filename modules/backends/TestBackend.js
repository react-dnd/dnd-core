export default class TestBackend {
  constructor(actions) {
    this.actions = actions;
  }

  setup() {
    this.didCallSetup = true;
  }

  teardown() {
    this.didCallTeardown = true;
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
