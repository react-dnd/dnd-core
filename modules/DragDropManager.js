'use strict';

import DragDropContext from './DragDropContext';
import Flux from './Flux';

export default class DragDropManager {
  constructor(Backend) {
    this.alt = new Flux();

    this.backend = new Backend(this.alt);
    this.context = new DragDropContext(this.alt);
  }

  getBackend() {
    return this.backend;
  }

  getContext() {
    return this.context;
  }

  addSource() {

  }

  addTarget() {

  }

  removeSource() {

  }

  removeTarget() {

  }
}