import Alt from 'alt';
import DragDropActions from './actions/DragDropActions';
import DragOperationStore from './stores/DragOperationStore';

export default class Flux extends Alt {
  constructor() {
    super();

    this.addActions('dragDropActions', DragDropActions);
    this.addStore('dragOperationStore', DragOperationStore);
  }

  getDragDropActions() {
    return this.getActions('dragDropActions');
  }

  getDragOperationStore() {
    return this.getStore('dragOperationStore');
  }
}