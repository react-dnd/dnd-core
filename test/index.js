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
    context.addListener('change', () => {
      expect(context.isDragging()).to.equal(true);
      done();
    });

    const descriptor = manager.addSource(Types.FOO, new NormalSource());
    backend.simulateBeginDrag(descriptor);
  });

  it('raises change events on drop', (done) => {
    const descriptor = manager.addSource(Types.FOO, new NormalSource());
    backend.simulateBeginDrag(descriptor);
    expect(context.isDragging()).to.equal(true);

    context.addListener('change', () => {
      expect(context.isDragging()).to.equal(false);
      done();
    });

    const target = manager.addTarget(Types.FOO, new NormalTarget());
    backend.simulateDrop(descriptor, target);
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
    const descriptor = manager.addSource(Types.FOO, new NonDraggableSource());
    backend.simulateBeginDrag(descriptor);
    expect(context.isDragging()).to.equal(false);
  });

  it('begins drag when canDrag returns true', () => {
    const descriptor = manager.addSource(Types.FOO, new NormalSource());
    backend.simulateBeginDrag(descriptor);
    expect(context.isDragging()).to.equal(true);
  });

  it('dropping a valid target provides drop data to endDrag', () => {
    const t = new NormalTarget();
    const s = new NormalSource();
    const sourceDescriptor = manager.addSource(Types.FOO, s);
    const targetDescriptor = manager.addTarget(Types.FOO, t);

    backend.simulateBeginDrag(sourceDescriptor);
    expect(context.isDragging()).to.equal(true);
    backend.simulateDrop(sourceDescriptor, targetDescriptor);
    expect(context.isDragging()).to.equal(false);
    expect(s.data.foo).to.equal('bar');
  });

  it('dropping an invalid target calls endDrag', () => {
    const s = new NormalSource();
    const sourceDescriptor = manager.addSource(Types.FOO, s);
    const targetDescriptor = manager.addTarget(Types.FOO, null);

    backend.simulateBeginDrag(sourceDescriptor);
    expect(context.isDragging()).to.equal(true);
    backend.simulateDrop(sourceDescriptor, targetDescriptor);
    expect(context.isDragging()).to.equal(false); // TODO: more explict way to see?
    expect(s.data).to.equal(undefined);
  });

});
