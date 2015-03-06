'use strict';

import expect from 'expect.js';
import Types from './types';
import { NormalSource, NonDraggableSource, BadItemSource } from './sources';
import { NormalTarget, NonDroppableTarget, TargetWithNoDropResult, BadResultTarget } from './targets';
import { DragDropManager, TestBackend } from '..';

describe('DragDropManager', () => {
  let manager;
  let backend;
  let registry;

  beforeEach(() => {
    manager = new DragDropManager(TestBackend);
    backend = manager.getBackend();
    registry = manager.getRegistry();
  });

  describe('handler registration', () => {
    it('registers and unregisters drag sources', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      expect(registry.getSource(sourceHandle)).to.equal(source);

      registry.removeSource(sourceHandle);
      expect(registry.getSource(sourceHandle)).to.equal(null);
      expect(() => registry.removeSource(sourceHandle)).to.throwError();
    });

    it('registers and unregisters drop targets', () => {
      const target = new NormalTarget();
      const targetHandle = registry.addTarget(Types.FOO, target);
      expect(registry.getTarget(targetHandle)).to.equal(target);

      registry.removeTarget(targetHandle);
      expect(registry.getTarget(targetHandle)).to.equal(null);
      expect(() => registry.removeTarget(targetHandle)).to.throwError();
    });

    it('knows the difference between sources and targets', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      const target = new NormalTarget();
      const targetHandle = registry.addTarget(Types.FOO, target);

      expect(() => registry.getSource(targetHandle)).to.throwError();
      expect(() => registry.getTarget(sourceHandle)).to.throwError();
      expect(() => registry.removeSource(targetHandle)).to.throwError();
      expect(() => registry.removeTarget(sourceHandle)).to.throwError();
    });

    it('throws on invalid type', () => {
      const source = new NormalSource();
      const target = new NormalTarget();

      expect(() => registry.addSource(null, source)).to.throwError();
      expect(() => registry.addSource(undefined, source)).to.throwError();
      expect(() => registry.addSource(23, source)).to.throwError();
      expect(() => registry.addTarget(null, target)).to.throwError();
      expect(() => registry.addTarget(undefined, target)).to.throwError();
      expect(() => registry.addTarget(23, target)).to.throwError();
    });
  });

  describe('drag source and target contract', () => {
    it('throws in beginDrag() if canDrag() returns false', () => {
      const source = new NonDraggableSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      expect(() => backend.simulateBeginDrag(sourceHandle)).to.throwError();
    });

    it('throws if beginDrag() returns non-object', () => {
      const source = new BadItemSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      expect(() => backend.simulateBeginDrag(sourceHandle)).to.throwError();
    });

    it('begins drag if canDrag() returns true', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      expect(() => backend.simulateBeginDrag(sourceHandle)).to.not.throwError();
    });

    it('throws in beginDrag() if it is called twice during one operation', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);

      backend.simulateBeginDrag(sourceHandle);
      expect(() => backend.simulateBeginDrag(sourceHandle)).to.throwError();
    });

    it('lets beginDrag() be called again in a next operation', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateEndDrag(sourceHandle);
      expect(() => backend.simulateBeginDrag(sourceHandle)).to.not.throwError();
    });

    it('endDrag() sees drop() return value as drop result if dropped on a target', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      const target = new NormalTarget();
      const targetHandle = registry.addTarget(Types.FOO, target);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateDrop(targetHandle);
      backend.simulateEndDrag();
      expect(source.recordedDropResult.foo).to.equal('bar');
    });

    it('endDrag() sees true as drop result by default if dropped on a target', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      const target = new TargetWithNoDropResult();
      const targetHandle = registry.addTarget(Types.FOO, target);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateDrop(targetHandle);
      backend.simulateEndDrag();
      expect(source.recordedDropResult).to.equal(true);
    });

    it('endDrag() sees false as drop result if dropped outside a target', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateEndDrag();
      expect(source.recordedDropResult).to.equal(false);
    });

    it('calls endDrag even if source was unregistered', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);

      backend.simulateBeginDrag(sourceHandle);
      registry.removeSource(sourceHandle);
      expect(registry.getSource(sourceHandle)).to.equal(null);

      backend.simulateEndDrag();
      expect(source.recordedDropResult).to.equal(false);
    });

    it('throws in endDrag() if it is called outside a drag operation', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      expect(() => backend.simulateEndDrag(sourceHandle)).to.throwError();
    });

    it('throws in drop() if canDrop() returns false', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      const target = new NonDroppableTarget();
      const targetHandle = registry.addTarget(Types.FOO, target);

      backend.simulateBeginDrag(sourceHandle);
      expect(() => backend.simulateDrop(targetHandle)).to.throwError();
    });

    it('throws in drop() if it is called outside a drag operation', () => {
      const target = new NormalTarget();
      const targetHandle = registry.addTarget(Types.BAR, target);
      expect(() => backend.simulateDrop(targetHandle)).to.throwError();
    });

    it('throws in drop() if target has a different type', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      const target = new NormalTarget();
      const targetHandle = registry.addTarget(Types.BAR, target);

      backend.simulateBeginDrag(sourceHandle);
      expect(() => backend.simulateDrop(targetHandle)).to.throwError();
    });

    it('throws if drop() returns something that is neither undefined nor an object', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      const target = new BadResultTarget();
      const targetHandle = registry.addTarget(Types.FOO, target);

      backend.simulateBeginDrag(sourceHandle);
      expect(() => backend.simulateDrop(targetHandle)).to.throwError();
    });
  });
});