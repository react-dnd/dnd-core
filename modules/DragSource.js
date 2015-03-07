export default class DragSource {
  canDrag() {
    return true;
  }

  isDragging(context) {
    return context.isDraggedSource(this);
  }

  endDrag() { }
}