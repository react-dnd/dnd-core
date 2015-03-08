import Flux from './Flux';
import DragDropContext from './DragDropContext';
import HandlerRegistry from './utils/HandlerRegistry'

export default class DragDropManager {
  constructor(Backend) {
    const flux = new Flux(this);

    this.flux = flux;
    this.registry = new HandlerRegistry(flux.registryActions);
    this.context = new DragDropContext(flux, this.registry);
    this.backend = new Backend(flux.dragDropActions);
  }

  getContext() {
    return this.context;
  }

  getBackend() {
    return this.backend;
  }

  getRegistry() {
    return this.registry;
  }
}