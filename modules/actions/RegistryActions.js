import { Actions } from 'flummox';

export default class RegistryActions extends Actions {
  addSource(sourceId) {
    return { sourceId };
  }

  addTarget(targetId) {
    return { targetId };
  }

  removeSource(sourceId) {
    return { sourceId };
  }

  removeTarget(targetId) {
    return { targetId };
  }
}
