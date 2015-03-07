export default class TestBackend {
  constructor(actions) {
    this.actions = actions;
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
};
