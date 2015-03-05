'use strict';

import { Flummox } from 'flummox';
import DragDropActions from './actions/DragDropActions';
import DragOperationStore from './stores/DragOperationStore';

export default class Flux extends Flummox {
  constructor() {
    super();

    this.createActions('dragDropActions', DragDropActions);
    this.createStore('dragOperationStore', DragOperationStore, this);
  }

  getDragDropActions() {
    return this.getActions('dragDropActions');
  }

  getDragDropActionIds() {
    return this.getActionIds('dragDropActions');
  }

  getDragOperationStore() {
    return this.getStore('dragOperationStore');
  }
}