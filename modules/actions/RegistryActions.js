import { Actions } from 'flummox'

export default class RegistryActions extends Actions {
  addSource({ sourceHandle }) {
    return { sourceHandle };
  }

  addTarget({ targetHandle }) {
    return { targetHandle };
  }

  removeSource({ sourceHandle }) {
    return { sourceHandle };
  }

  removeTarget({ targetHandle }) {
    return { targetHandle };
  }
}