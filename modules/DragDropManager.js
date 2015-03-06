'use strict';

import Flux from './Flux';
import DragDropContext from './DragDropContext';
import HandlerRegistry from './utils/HandlerRegistry'

export default class DragDropManager {
  constructor(Backend) {
    const flux = new Flux(this);

    this.registry = new HandlerRegistry();
    this.flux = flux;
    this.context = new DragDropContext(this);
    this.backend = new Backend(flux.dragDropActions);

    this.context.addChangeListener(this.updateDraggedSource, this);
    this.updateDraggedSource();
  }

  dispose() {
    this.context.removeChangeListener(this.updateDraggedSource, this);
  }

  getContext() {
    return this.context;
  }

  getBackend() {
    return this.backend;
  }

  addSource(type, source) {
    return this.registry.addSource(type, source);
  }

  addTarget(type, target) {
    return this.registry.addTarget(type, target);
  }

  getSource(handle) {
    return this.registry.getSource(handle);
  }

  getTarget(handle) {
    return this.registry.getTarget(handle);
  }

  removeSource(handle) {
    this.registry.removeSource(handle);
  }

  removeTarget(handle) {
    this.registry.removeTarget(handle);
  }

  getDraggedSource() {
    return this.draggedSource;
  }

  updateDraggedSource() {
    const handle = this.context.getDraggedSourceHandle();
    if (handle) {
      this.draggedSource = this.getSource(handle);
    } else {
      this.draggedSource = null;
    }
  }
}