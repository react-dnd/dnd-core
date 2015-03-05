'use strict';

import expect from 'expect.js';
import Types from './Types';
import { NormalSource, NonDraggableSource } from './DragSources';
import {
  DragDropManager,
  TestBackend
} from '../modules';

describe('DragDropManager', () => {
  let manager;
  let backend;
  let context;

  beforeEach(() => {
    manager = new DragDropManager(TestBackend);

    context = manager.getContext();
    backend = manager.getBackend();
  });

  it('prevents drag when canDrag returns false', () => {
    const descriptor = manager.addSource(Types.FOO, new NonDraggableSource());
    backend.simulateBeginDrag(descriptor);
    expect(context.isDragging()).to.equal(false);
  });

  it('begins drag when canDrag returns true', () => {
    const descriptor = manager.addSource(Types.FOO, new NormalSource());
    backend.simulateBeginDrag(descriptor);
    expect(context.isDragging()).to.equal(true);
  });
});