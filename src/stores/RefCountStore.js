import { Store } from 'flummox';

export default class RefCountStore extends Store {
  constructor(flux) {
    super();

    const { registryActionIds } = flux;

    this.register(registryActionIds.addSource, this.addRef);
    this.register(registryActionIds.addTarget, this.addRef);
    this.register(registryActionIds.removeSource, this.removeRef);
    this.register(registryActionIds.removeTarget, this.removeRef);

    this.state = {
      refCount: 0
    };
  }

  addRef() {
    this.setState({
      refCount: this.state.refCount + 1
    });
  }

  removeRef() {
    this.setState({
      refCount: this.state.refCount - 1
    });
  }

  hasRefs() {
    return this.state.refCount > 0;
  }
}