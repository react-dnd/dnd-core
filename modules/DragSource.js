export default class DragSource {
  canDrag() {
    return true;
  }

  isDragging(monitor, handle) {
    return handle === monitor.getSourceHandle();
  }

  endDrag() { }
}