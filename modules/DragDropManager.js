import Flux from './Flux';
import DragDropMonitor from './DragDropMonitor';
import HandlerRegistry from './utils/HandlerRegistry'

export default class DragDropManager {
  constructor(Backend) {
    const flux = new Flux(this);

    this.flux = flux;
    this.registry = new HandlerRegistry(flux.registryActions);
    this.monitor = new DragDropMonitor(flux, this.registry);
    this.backend = new Backend(flux.dragDropActions);
  }

  getMonitor() {
    return this.monitor;
  }

  getBackend() {
    return this.backend;
  }

  getRegistry() {
    return this.registry;
  }
}