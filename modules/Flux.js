import { Flummox } from 'flummox';
import DragDropActions from './actions/DragDropActions';
import RegistryActions from './actions/RegistryActions';
import DragOperationStore from './stores/DragOperationStore';
import RefCountStore from './stores/RefCountStore';

export default class Flux extends Flummox {
  constructor(manager) {
    super();

    this.dragDropActions =
      this.createActions('dragDropActions', DragDropActions, manager);
    this.dragDropActionIds = this.getActionIds('dragDropActions');

    this.registryActions =
      this.createActions('registryActions', RegistryActions);
    this.registryActionIds = this.getActionIds('registryActions');

    this.dragOperationStore =
      this.createStore('dragOperationStore', DragOperationStore, this);

    this.refCountStore =
      this.createStore('refCountStore', RefCountStore, this);
  }
}
