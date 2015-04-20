import { Store } from 'flummox';

function areOffsetsEqual(offsetA, offsetB) {
  if (offsetA === offsetB) {
    return true;
  }

  return (
    offsetA &&
    offsetB &&
    offsetA.x === offsetB.x &&
    offsetA.y === offsetB.y
  );
}

export default class DragOffsetStore extends Store {
  constructor(flux) {
    super();

    const { dragDropActionIds } = flux;
    this.register(dragDropActionIds.beginDrag, this.handleBeginDrag);
    this.register(dragDropActionIds.hover, this.handleHover);
    this.register(dragDropActionIds.endDrag, this.handleEndDrag);
    this.register(dragDropActionIds.drop, this.handleDrop);

    this.state = {
      initialSourceClientOffset: null,
      initialClientOffset: null,
      clientOffset: null
    };
  }

  handleBeginDrag({ clientOffset, sourceClientOffset }) {
    this.setState({
      initialClientOffset: clientOffset,
      initialSourceClientOffset: sourceClientOffset,
      clientOffset
    });
  }

  handleHover({ clientOffset }) {
    const { clientOffset: prevClientOffset } = this.state;

    if (!areOffsetsEqual(clientOffset, prevClientOffset)) {
      this.setState({
        clientOffset
      });
    }
  }

  handleEndDrag() {
    this.setState({
      initialClientOffset: null,
      initialSourceClientOffset: null,
      clientOffset: null
    });
  }

  handleDrop() {
    this.setState({
      initialClientOffset: null,
      initialSourceClientOffset: null,
      clientOffset: null
    });
  }

  getInitialClientOffset() {
    return this.state.initialClientOffset;
  }

  getInitialSourceClientOffset() {
    return this.state.initialSourceClientOffset;
  }

  getClientOffset() {
    return this.state.clientOffset;
  }

  getDifferenceFromInitialOffset() {
    const { clientOffset, initialClientOffset } = this.state;
    if (!clientOffset || !initialClientOffset) {
      return null;
    }

    return {
      x: clientOffset.x - initialClientOffset.x,
      y: clientOffset.y - initialClientOffset.y
    };
  }
}
