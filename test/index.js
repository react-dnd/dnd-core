'use strict';

import expect from 'expect.js';
import Types from './Types';
import { NormalSource, NonDraggableSource } from './DragSources';
import { NormalTarget, TargetWithNoDropResult } from './DropTargets';
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

  it('raises change events on beginDrag()', (done) => {
    const source = new NormalSource();
    const sourceHandle = manager.addSource(Types.FOO, source);

    context.addChangeListener(() => {
      expect(context.isDragging()).to.equal(true);
      done();
    });
    backend.simulateBeginDrag(sourceHandle);
  });

  it('raises change events on endDrag()', (done) => {
    const source = new NormalSource();
    const sourceHandle = manager.addSource(Types.FOO, source);
    const target = new NormalTarget();
    manager.addTarget(Types.FOO, target);

    backend.simulateBeginDrag(sourceHandle);
    expect(context.isDragging()).to.equal(true);

    context.addChangeListener(() => {
      expect(context.isDragging()).to.equal(false);
      done();
    });
    backend.simulateEndDrag();
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

  it('prevents drag when canDrag() returns false', () => {
    const source = new NonDraggableSource();
    const sourceHandle = manager.addSource(Types.FOO, source);

    backend.simulateBeginDrag(sourceHandle);
    expect(context.isDragging()).to.equal(false);
  });

  it('begins drag when canDrag() returns true', () => {
    const source = new NormalSource();
    const sourceHandle = manager.addSource(Types.FOO, source);

    backend.simulateBeginDrag(sourceHandle);
    expect(context.isDragging()).to.equal(true);
  });

  it('dropping on a target passes drop() return value to endDrag()', () => {
    const source = new NormalSource();
    const sourceHandle = manager.addSource(Types.FOO, source);
    const target = new NormalTarget();
    const targetHandle = manager.addTarget(Types.FOO, target);

    backend.simulateBeginDrag(sourceHandle);
    expect(context.isDragging()).to.equal(true);

    backend.simulateDrop(targetHandle);
    backend.simulateEndDrag();
    expect(context.isDragging()).to.equal(false);
    expect(source.endDragArgument.foo).to.equal('bar');
  });

  it('dropping on a target passes true to endDrag() by default', () => {
    const source = new NormalSource();
    const sourceHandle = manager.addSource(Types.FOO, source);
    const target = new TargetWithNoDropResult();
    const targetHandle = manager.addTarget(Types.FOO, target);

    backend.simulateBeginDrag(sourceHandle);
    expect(context.isDragging()).to.equal(true);

    backend.simulateDrop(targetHandle);
    backend.simulateEndDrag();
    expect(context.isDragging()).to.equal(false);
    expect(source.endDragArgument).to.equal(true);
  });

  it('dropping outside a target passes false to endDrag()', () => {
    const source = new NormalSource();
    const sourceHandle = manager.addSource(Types.FOO, source);

    backend.simulateBeginDrag(sourceHandle);
    expect(context.isDragging()).to.equal(true);

    backend.simulateEndDrag();
    expect(context.isDragging()).to.equal(false);
    expect(source.endDragArgument).to.equal(false);
  });
});
