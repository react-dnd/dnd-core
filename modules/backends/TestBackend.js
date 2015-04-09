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

  simulateBeginDrag(sourceIds, publishSource) {
    this.actions.beginDrag(sourceIds, publishSource);
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
