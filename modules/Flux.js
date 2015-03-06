'use strict';

import { Flummox } from 'flummox';
import DragDropActions from './actions/DragDropActions';
import DragOperationStore from './stores/DragOperationStore';

export default class Flux extends Flummox {
  constructor(manager) {
    super();

    this.createActions('dragDropActions', DragDropActions, manager);
    this.dragDropActions = this.getActions('dragDropActions');
    this.dragDropActionIds = this.getActionIds('dragDropActions');

    this.createStore('dragOperationStore', DragOperationStore, this);
    this.dragOperationStore = this.getStore('dragOperationStore');
  }
}