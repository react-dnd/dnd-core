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

  simulateBeginDrag(sourceHandle) {
    this.actions.beginDrag(sourceHandle);
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
