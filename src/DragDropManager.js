import Flux from './Flux';
import DragDropMonitor from './DragDropMonitor';
import HandlerRegistry from './utils/HandlerRegistry';

export default class DragDropManager {
  constructor(createBackend) {
    const flux = new Flux(this);

    this.flux = flux;
    this.registry = new HandlerRegistry(flux.registryActions);
    this.monitor = new DragDropMonitor(flux, this.registry);
    this.backend = createBackend(this);

    flux.refCountStore.addListener('change', this.handleRefCountChange, this);
  }

  handleRefCountChange() {
    const shouldSetUp = this.flux.refCountStore.hasRefs();
    if (shouldSetUp && !this.isSetUp) {
      this.backend.setup();
      this.isSetUp = true;
    } else if (!shouldSetUp && this.isSetUp) {
      this.backend.teardown();
      this.isSetUp = false;
    }
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

  getActions() {
    return this.flux.dragDropActions;
  }
}