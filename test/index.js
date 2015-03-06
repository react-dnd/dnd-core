'use strict';

import expect from 'expect.js';
import Types from './Types';
import { NormalSource, NonDraggableSource } from './DragSources';
import { NormalTarget } from './DropTargets';
import {
  DragDropManager,
  TestBackend
} from '../modules';

describe('DragDropContext', () => {
  let manager;
  let backend;
  let context;

  beforeEach(() => {
    manager = new DragDropManager(TestBackend);

    context = manager.getContext();
    backend = manager.getBackend();
  });

  it('raises change events on drag', (done) => {
    const source = new NormalSource();
    const sourceId = manager.addSource(Types.FOO, source);

    context.addListener('change', () => {
      expect(context.isDragging()).to.equal(true);
      done();
    });
    backend.simulateBeginDrag(sourceId);
  });

  it('raises change events on drop', (done) => {
    const source = new NormalSource();
    const sourceId = manager.addSource(Types.FOO, source);
    const target = new NormalTarget();
    const targetId = manager.addTarget(Types.FOO, target);

    backend.simulateBeginDrag(sourceId);
    expect(context.isDragging()).to.equal(true);

    context.addListener('change', () => {
      expect(context.isDragging()).to.equal(false);
      done();
    });

    backend.simulateDrop(sourceId, targetId);
  });
});

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
    const source = new NonDraggableSource();
    const sourceId = manager.addSource(Types.FOO, source);

    backend.simulateBeginDrag(sourceId);
    expect(context.isDragging()).to.equal(false);
  });

  it('begins drag when canDrag returns true', () => {
    const source = new NormalSource();
    const sourceId = manager.addSource(Types.FOO, source);

    backend.simulateBeginDrag(sourceId);
    expect(context.isDragging()).to.equal(true);
  });

  it('dropping a valid target provides drop data to endDrag', () => {
    const source = new NormalSource();
    const sourceId = manager.addSource(Types.FOO, source);
    const target = new NormalTarget();
    const targetId = manager.addTarget(Types.FOO, target);

    backend.simulateBeginDrag(sourceId);
    expect(context.isDragging()).to.equal(true);
    backend.simulateDrop(sourceId, targetId);
    expect(context.isDragging()).to.equal(false);
    expect(source.data.foo).to.equal('bar');
  });

  it('dropping an invalid target calls endDrag', () => {
    const source = new NormalSource();
    const sourceId = manager.addSource(Types.FOO, source);

    backend.simulateBeginDrag(sourceId);
    expect(context.isDragging()).to.equal(true);
    backend.simulateDrop(sourceId, null);
    expect(context.isDragging()).to.equal(false); // TODO: more explict way to see?
    expect(source.data).to.equal(undefined);
  });

});
