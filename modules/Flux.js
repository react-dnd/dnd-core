import Alt from 'alt';
import DragDropActions from './actions/DragDropActions';
import DragOperationStore from './stores/DragOperationStore';

export default class Flux extends Alt {
  constructor() {
    super();

    this.dragDropActions = this.createActions(DragDropActions);
    this.dragOperationStore = this.createStore(DragOperationStore);
  }
}