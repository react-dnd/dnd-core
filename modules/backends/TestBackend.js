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

  simulateBeginDrag(sourceId, isSourcePublic) {
    this.actions.beginDrag(sourceId, isSourcePublic);
  }

  simulatePublishDragSource() {
    this.actions.publishDragSource();
  }

  simulateHover(targetIds) {
    this.actions.hover(targetIds);
  }

  simulateDrop() {
    this.actions.drop();
  }

  simulateEndDrag() {
    this.actions.endDrag();
  }
}
