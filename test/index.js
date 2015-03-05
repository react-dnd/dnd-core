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
  let context;

  beforeEach(() => {
    manager = new DragDropManager(TestBackend);
    context = manager.getContext();
  });

  it('prevents drag when canDrag returns false', () => {
    let sourceId = manager.addSource(Types.FOO, new NonDraggableSource());
    TestBackend.simulateBeginDrag(sourceId);
    expect(context.isDragging()).to.equal(false);
  });

  it('begins drag when canDrag returns true', () => {
    let sourceId = manager.addSource(Types.FOO, new NormalSource());
    TestBackend.simulateBeginDrag(sourceId);
    expect(context.isDragging()).to.equal(true);
  });
});