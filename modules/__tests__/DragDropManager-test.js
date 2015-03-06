'use strict';

import expect from 'expect.js';
import Types from './types';
import { NormalSource, NonDraggableSource } from './sources';
import { NormalTarget, NonDroppableTarget, TargetWithNoDropResult } from './targets';
import { DragDropManager, TestBackend } from '..';

describe('DragDropManager', () => {
  let manager;
  let backend;

  beforeEach(() => {
    manager = new DragDropManager(TestBackend);
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
    it('throws in beginDrag() if canDrag() returns false', () => {
      const source = new NonDraggableSource();
      const sourceHandle = manager.addSource(Types.FOO, source);
      expect(() => backend.simulateBeginDrag(sourceHandle)).to.throwError();
    });

    it('begins drag if canDrag() returns true', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);
      expect(() => backend.simulateBeginDrag(sourceHandle)).to.not.throwError();
    });

    it('throws in beginDrag() if it is called twice during one operation', () => {
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
      expect(source.endDragArgument.foo).to.equal('bar');
    });

    it('passes true to endDrag() by default if dropped on a target', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);
      const target = new TargetWithNoDropResult();
      const targetHandle = manager.addTarget(Types.FOO, target);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateDrop(targetHandle);
      backend.simulateEndDrag();
      expect(source.endDragArgument).to.equal(true);
    });

    it('passes false to endDrag() if dropped outside a target', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateEndDrag();
      expect(source.endDragArgument).to.equal(false);
    });

    it('throws in endDrag() if it is called outside a drag operation', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);
      expect(() => backend.simulateEndDrag(sourceHandle)).to.throwError();
    });

    it('throws in drop() if canDrop() returns false', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);
      const target = new NonDroppableTarget();
      const targetHandle = manager.addTarget(Types.FOO, target);

      backend.simulateBeginDrag(sourceHandle);
      expect(() => backend.simulateDrop(targetHandle)).to.throwError();
    });

    it('throws in drop() if it is called outside a drag operation', () => {
      const target = new NormalTarget();
      const targetHandle = manager.addTarget(Types.BAR, target);
      expect(() => backend.simulateDrop(targetHandle)).to.throwError();
    });

    it('throws in drop() if target has a different type', () => {
      const source = new NormalSource();
      const sourceHandle = manager.addSource(Types.FOO, source);
      const target = new NormalTarget();
      const targetHandle = manager.addTarget(Types.BAR, target);

      backend.simulateBeginDrag(sourceHandle);
      expect(() => backend.simulateDrop(targetHandle)).to.throwError();
    });
  });
});