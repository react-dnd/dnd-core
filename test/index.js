'use strict';

import expect from 'expect.js';
import Types from './Types';
import { NormalSource, NonDraggableSource } from './DragSources';
import { NormalTarget, NonDroppableTarget, TargetWithNoDropResult } from './DropTargets';
import { DragDropManager, TestBackend } from '../modules';

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

  describe('handler registration', () => {
    it('registers and unregisters drag sources', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);
      expect(manager.getSource(sourceHandle)).to.equal(source);

      manager.removeSource(sourceHandle);
      expect(manager.getSource(sourceHandle)).to.equal(null);
      expect(() => manager.removeSource(sourceHandle)).to.throwError();
    });

    it('registers and unregisters drop targets', () => {
      const target = new NormalTarget();
      const targetHandle = manager.addTarget(Types.FOO, target);
      expect(manager.getTarget(targetHandle)).to.equal(target);

      manager.removeTarget(targetHandle);
      expect(manager.getTarget(targetHandle)).to.equal(null);
      expect(() => manager.removeTarget(targetHandle)).to.throwError();
    });

    it('knows the difference between sources and targets', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);
      const target = new NormalTarget();
      const targetHandle = manager.addTarget(Types.FOO, target);

      expect(() => manager.getSource(targetHandle)).to.throwError();
      expect(() => manager.getTarget(sourceHandle)).to.throwError();
      expect(() => manager.removeSource(targetHandle)).to.throwError();
      expect(() => manager.removeTarget(sourceHandle)).to.throwError();
    });

    it('throws on invalid type', () => {
      const source = new NormalSource();
      const target = new NormalTarget();

      expect(() => manager.addSource(null, source)).to.throwError();
      expect(() => manager.addSource(undefined, source)).to.throwError();
      expect(() => manager.addSource(23, source)).to.throwError();
      expect(() => manager.addTarget(null, target)).to.throwError();
      expect(() => manager.addTarget(undefined, target)).to.throwError();
      expect(() => manager.addTarget(23, target)).to.throwError();
    });
  });

  describe('drag source and target contract', () => {
    it('throws if calling beginDrag() when canDrag() returns false', () => {
      const source = new NonDraggableSource();
      const sourceHandle = manager.addSource(Types.FOO, source);

      expect(context.canDrag(sourceHandle)).to.equal(false);
      expect(() => backend.simulateBeginDrag(sourceHandle)).to.throwError();
    });

    it('begins drag if canDrag() returns true', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);

      expect(context.canDrag(sourceHandle)).to.equal(true);
      backend.simulateBeginDrag(sourceHandle);

      expect(context.isDragging()).to.equal(true);
      expect(context.didDrop()).to.equal(false);
    });

    it('throws if beginDrag() is called twice during one operation', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);

      backend.simulateBeginDrag(sourceHandle);
      expect(() => backend.simulateBeginDrag(sourceHandle)).to.throwError();
    });

    it('lets beginDrag() be called again in a next operation', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateEndDrag(sourceHandle);
      expect(() => backend.simulateBeginDrag(sourceHandle)).to.not.throwError();
    });

    it('passes drop() return value to endDrag() if dropped on a target', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);
      const target = new NormalTarget();
      const targetHandle = manager.addTarget(Types.FOO, target);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateDrop(targetHandle);
      backend.simulateEndDrag();
      expect(context.isDragging()).to.equal(false);
      expect(context.didDrop()).to.equal(false);
      expect(source.endDragArgument.foo).to.equal('bar');
    });

    it('passes true to endDrag() by default if dropped on a target', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);
      const target = new TargetWithNoDropResult();
      const targetHandle = manager.addTarget(Types.FOO, target);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateDrop(targetHandle);
      expect(context.didDrop()).to.equal(true);

      backend.simulateEndDrag();
      expect(context.isDragging()).to.equal(false);
      expect(context.didDrop()).to.equal(false);
      expect(source.endDragArgument).to.equal(true);
    });

    it('passes false to endDrag() if dropped outside a target', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateEndDrag();
      expect(context.isDragging()).to.equal(false);
      expect(source.endDragArgument).to.equal(false);
    });

    it('throws if endDrag() is called outside a drag operation', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);

      expect(() => backend.simulateEndDrag(sourceHandle)).to.throwError();
    });

    it('throws if dropping when canDrop() returns false', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);
      const target = new NonDroppableTarget();
      const targetHandle = manager.addTarget(Types.FOO, target);

      backend.simulateBeginDrag(sourceHandle);
      expect(context.canDrop(targetHandle)).to.equal(false);
      expect(() => backend.simulateDrop(targetHandle)).to.throwError();
    });

    it('throws if dropping when outside a drag operation', () => {
      const target = new NormalTarget();
      const targetHandle = manager.addTarget(Types.BAR, target);

      expect(context.canDrop(targetHandle)).to.equal(false);
      expect(() => backend.simulateDrop(targetHandle)).to.throwError();
    });

    it('throws if dropping when target has a different type', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);
      const target = new NormalTarget();
      const targetHandle = manager.addTarget(Types.BAR, target);

      backend.simulateBeginDrag(sourceHandle);
      expect(context.canDrop(targetHandle)).to.equal(false);
      expect(() => backend.simulateDrop(targetHandle)).to.throwError();
    });
  });
});
