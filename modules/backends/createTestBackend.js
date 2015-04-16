class TestBackend {
  constructor(manager) {
    this.actions = manager.getActions();
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

export default function createBackend(manager) {
  return new TestBackend(manager);
}