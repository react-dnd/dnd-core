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

  simulateEnter(targetHandle) {
    this.actions.enter(targetHandle);
  }

  simulateLeave(targetHandle) {
    this.actions.leave(targetHandle);
  }

  simulateDrop() {
    this.actions.drop();
  }

  simulateEndDrag() {
    this.actions.endDrag();
  }
}
