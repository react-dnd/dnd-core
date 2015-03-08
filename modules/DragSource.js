export default class DragSource {
  canDrag() {
    return true;
  }

  isDragging(context, handle) {
    return handle === context.getDraggedSourceHandle();
  }

  endDrag() { }
}