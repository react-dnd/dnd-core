'use strict';

import expect from 'expect.js';
import Types from './types';
import { NormalSource, NonDraggableSource } from './sources';
import { NormalTarget, NonDroppableTarget, TargetWithNoDropResult } from './targets';
import { DragDropManager, TestBackend } from '..';

describe('DragDropContext', () => {
  let manager;
  let backend;
  let context;

  beforeEach(() => {
    manager = new DragDropManager(TestBackend);

    context = manager.getContext();
    backend = manager.getBackend();
  });

  describe('change event', () => {
    it('raises change event on beginDrag()', (done) => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);

      context.addChangeListener(done);
      backend.simulateBeginDrag(sourceHandle);
    });

    it('raises change event on endDrag()', (done) => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);
      const target = new NormalTarget();
      manager.addTarget(Types.FOO, target);

      backend.simulateBeginDrag(sourceHandle);
      context.addChangeListener(done);
      backend.simulateEndDrag();
    });

    it('raises change event when adding a source', (done) => {
      const source = new NormalSource();
      context.addChangeListener(done);
      manager.addSource(Types.FOO, source);
    });

    it('raises change event when adding a target', (done) => {
      const target = new NormalTarget();
      context.addChangeListener(done);
      manager.addTarget(Types.FOO, target);
    });

    it('raises change event when removing a source', (done) => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);

      context.addChangeListener(done);
      manager.removeSource(sourceHandle);
    });

    it('raises change event when removing a target', (done) => {
      const target = new NormalTarget();
      const targetHandle = manager.addTarget(Types.FOO, target);

      context.addChangeListener(done);
      manager.removeTarget(targetHandle);
    });
  });

  describe('state tracking', () => {
    it('returns true from canDrag unless already dragging or drag source opts out', () => {
      const sourceA = new NormalSource();
      const sourceAHandle = manager.addSource(Types.FOO, sourceA);
      const sourceB = new NormalSource();
      const sourceBHandle = manager.addSource(Types.FOO, sourceB);
      const sourceC = new NormalSource();
      const sourceCHandle = manager.addSource(Types.BAR, sourceC);
      const sourceD = new NonDraggableSource();
      const sourceDHandle = manager.addSource(Types.FOO, sourceD);
      const target = new NormalTarget();
      const targetHandle = manager.addTarget(Types.FOO, target);

      expect(context.canDrag(sourceAHandle)).to.equal(true);
      expect(context.canDrag(sourceBHandle)).to.equal(true);
      expect(context.canDrag(sourceCHandle)).to.equal(true);
      expect(context.canDrag(sourceDHandle)).to.equal(false);

      backend.simulateBeginDrag(sourceAHandle);
      expect(context.canDrag(sourceAHandle)).to.equal(false);
      expect(context.canDrag(sourceBHandle)).to.equal(false);
      expect(context.canDrag(sourceCHandle)).to.equal(false);
      expect(context.canDrag(sourceDHandle)).to.equal(false);

      backend.simulateDrop(targetHandle);
      expect(context.canDrag(sourceAHandle)).to.equal(false);
      expect(context.canDrag(sourceBHandle)).to.equal(false);
      expect(context.canDrag(sourceCHandle)).to.equal(false);
      expect(context.canDrag(sourceDHandle)).to.equal(false);

      backend.simulateEndDrag();
      expect(context.canDrag(sourceAHandle)).to.equal(true);
      expect(context.canDrag(sourceBHandle)).to.equal(true);
      expect(context.canDrag(sourceCHandle)).to.equal(true);
      expect(context.canDrag(sourceDHandle)).to.equal(false);

      backend.simulateBeginDrag(sourceAHandle);
      expect(context.canDrag(sourceAHandle)).to.equal(false);
      expect(context.canDrag(sourceBHandle)).to.equal(false);
      expect(context.canDrag(sourceCHandle)).to.equal(false);
      expect(context.canDrag(sourceDHandle)).to.equal(false);
    });

    it('returns true from canDrop if dragging and type matches, unless target opts out', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);
      const targetA = new NormalTarget();
      const targetAHandle = manager.addTarget(Types.FOO, targetA);
      const targetB = new NormalTarget();
      const targetBHandle = manager.addTarget(Types.FOO, targetB);
      const targetC = new NormalTarget();
      const targetCHandle = manager.addTarget(Types.BAR, targetC);
      const targetD = new NonDroppableTarget();
      const targetDHandle = manager.addTarget(Types.FOO, targetD);

      expect(context.canDrop(targetAHandle)).to.equal(false);
      expect(context.canDrop(targetBHandle)).to.equal(false);
      expect(context.canDrop(targetCHandle)).to.equal(false);
      expect(context.canDrop(targetDHandle)).to.equal(false);

      backend.simulateBeginDrag(sourceHandle);
      expect(context.canDrop(targetAHandle)).to.equal(true);
      expect(context.canDrop(targetBHandle)).to.equal(true);
      expect(context.canDrop(targetCHandle)).to.equal(false);
      expect(context.canDrop(targetDHandle)).to.equal(false);

      backend.simulateDrop(targetAHandle);
      expect(context.canDrop(targetAHandle)).to.equal(false);
      expect(context.canDrop(targetBHandle)).to.equal(false);
      expect(context.canDrop(targetCHandle)).to.equal(false);
      expect(context.canDrop(targetDHandle)).to.equal(false);

      backend.simulateEndDrag();
      expect(context.canDrop(targetAHandle)).to.equal(false);
      expect(context.canDrop(targetBHandle)).to.equal(false);
      expect(context.canDrop(targetCHandle)).to.equal(false);
      expect(context.canDrop(targetDHandle)).to.equal(false);

      backend.simulateBeginDrag(sourceHandle);
      expect(context.canDrop(targetAHandle)).to.equal(true);
      expect(context.canDrop(targetBHandle)).to.equal(true);
      expect(context.canDrop(targetCHandle)).to.equal(false);
      expect(context.canDrop(targetDHandle)).to.equal(false);
    });

    it('returns true from canEndDrag and isDragging only while dragging', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);
      const target = new NormalTarget();
      const targetHandle = manager.addTarget(Types.FOO, target);

      expect(context.canEndDrag()).to.equal(false);
      expect(context.isDragging()).to.equal(false);

      backend.simulateBeginDrag(sourceHandle);
      expect(context.canEndDrag()).to.equal(true);
      expect(context.isDragging()).to.equal(true);

      backend.simulateDrop(targetHandle);
      expect(context.canEndDrag()).to.equal(true);
      expect(context.isDragging()).to.equal(true);

      backend.simulateEndDrag();
      expect(context.canEndDrag()).to.equal(false);
      expect(context.isDragging()).to.equal(false);

      backend.simulateBeginDrag(sourceHandle);
      expect(context.canEndDrag()).to.equal(true);
      expect(context.isDragging()).to.equal(true);
    });

    it('keeps track of dragged source handle', () => {
      const sourceA = new NormalSource();
      const sourceAHandle = manager.addSource(Types.FOO, sourceA);
      const sourceB = new NormalSource();
      const sourceBHandle = manager.addSource(Types.FOO, sourceB);
      const target = new NormalTarget();
      const targetHandle = manager.addTarget(Types.FOO, target);

      expect(context.getDraggedSourceHandle()).to.equal(null);

      backend.simulateBeginDrag(sourceAHandle);
      expect(context.getDraggedSourceHandle()).to.equal(sourceAHandle);

      backend.simulateDrop(targetHandle);
      expect(context.getDraggedSourceHandle()).to.equal(sourceAHandle);

      backend.simulateEndDrag();
      expect(context.getDraggedSourceHandle()).to.equal(null);

      backend.simulateBeginDrag(sourceBHandle);
      expect(context.getDraggedSourceHandle()).to.equal(sourceBHandle);
    });

    it('keeps track of dragged item and type', () => {
      const sourceA = new NormalSource({ a: 123 });
      const sourceAHandle = manager.addSource(Types.FOO, sourceA);
      const sourceB = new NormalSource({ a: 456 });
      const sourceBHandle = manager.addSource(Types.BAR, sourceB);
      const target = new NormalTarget();
      const targetHandle = manager.addTarget(Types.FOO, target);

      expect(context.getDraggedItem()).to.equal(null);
      expect(context.getDraggedItemType()).to.equal(null);

      backend.simulateBeginDrag(sourceAHandle);
      expect(context.getDraggedItem().a).to.equal(123);
      expect(context.getDraggedItemType()).to.equal(Types.FOO);

      backend.simulateDrop(targetHandle);
      expect(context.getDraggedItem().a).to.equal(123);
      expect(context.getDraggedItemType()).to.equal(Types.FOO);

      backend.simulateEndDrag();
      expect(context.getDraggedItem()).to.equal(null);
      expect(context.getDraggedItemType()).to.equal(null);

      backend.simulateBeginDrag(sourceBHandle);
      expect(context.getDraggedItem().a).to.equal(456);
      expect(context.getDraggedItemType()).to.equal(Types.BAR);
    });

    it('keeps track of drop result and whether it occured', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);
      const targetA = new NormalTarget({ a: 123 });
      const targetAHandle = manager.addTarget(Types.FOO, targetA);
      const targetB = new TargetWithNoDropResult();
      const targetBHandle = manager.addTarget(Types.FOO, targetB);

      expect(context.didDrop()).to.equal(false);
      expect(context.getDropResult()).to.equal(null);

      backend.simulateBeginDrag(sourceHandle);
      expect(context.didDrop()).to.equal(false);
      expect(context.getDropResult()).to.equal(false);

      backend.simulateDrop(targetAHandle);
      expect(context.didDrop()).to.equal(true);
      expect(context.getDropResult().a).to.equal(123);

      backend.simulateEndDrag();
      expect(context.didDrop()).to.equal(false);
      expect(context.getDropResult()).to.equal(null);

      backend.simulateBeginDrag(sourceHandle);
      expect(context.didDrop()).to.equal(false);
      expect(context.getDropResult()).to.equal(false);

      backend.simulateDrop(targetBHandle);
      expect(context.didDrop()).to.equal(true);
      expect(context.getDropResult()).to.equal(true);

      backend.simulateEndDrag();
      expect(context.didDrop()).to.equal(false);
      expect(context.getDropResult()).to.equal(null);
    });
  });
});