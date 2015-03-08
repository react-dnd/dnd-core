import expect from 'expect.js';
import Types from './types';
import { NormalSource, NonDraggableSource, NumberSource } from './sources';
import { NormalTarget, NonDroppableTarget, TargetWithNoDropResult } from './targets';
import { DragDropManager, TestBackend } from '..';

describe('DragDropContext', () => {
  let manager;
  let backend;
  let registry;
  let context;

  beforeEach(() => {
    manager = new DragDropManager(TestBackend);
    backend = manager.getBackend();
    registry = manager.getRegistry();
    context = manager.getContext();
  });

  describe('change event', () => {
    it('raises change event on beginDrag()', (done) => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);

      context.addChangeListener(done);
      backend.simulateBeginDrag(sourceHandle);
    });

    it('raises change event on endDrag()', (done) => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      const target = new NormalTarget();
      registry.addTarget(Types.FOO, target);

      backend.simulateBeginDrag(sourceHandle);
      context.addChangeListener(done);
      backend.simulateEndDrag();
    });

    it('raises change event when adding a source', (done) => {
      const source = new NormalSource();
      context.addChangeListener(done);
      registry.addSource(Types.FOO, source);
    });

    it('raises change event when adding a target', (done) => {
      const target = new NormalTarget();
      context.addChangeListener(done);
      registry.addTarget(Types.FOO, target);
    });

    it('raises change event when removing a source', (done) => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);

      context.addChangeListener(done);
      registry.removeSource(sourceHandle);
    });

    it('raises change event when removing a target', (done) => {
      const target = new NormalTarget();
      const targetHandle = registry.addTarget(Types.FOO, target);

      context.addChangeListener(done);
      registry.removeTarget(targetHandle);
    });
  });

  describe('state tracking', () => {
    it('returns true from canDrag unless already dragging or drag source opts out', () => {
      const sourceA = new NormalSource();
      const sourceAHandle = registry.addSource(Types.FOO, sourceA);
      const sourceB = new NormalSource();
      const sourceBHandle = registry.addSource(Types.FOO, sourceB);
      const sourceC = new NormalSource();
      const sourceCHandle = registry.addSource(Types.BAR, sourceC);
      const sourceD = new NonDraggableSource();
      const sourceDHandle = registry.addSource(Types.FOO, sourceD);
      const target = new NormalTarget();
      const targetHandle = registry.addTarget(Types.FOO, target);

      expect(context.canDrag(sourceAHandle)).to.equal(true);
      expect(context.canDrag(sourceBHandle)).to.equal(true);
      expect(context.canDrag(sourceCHandle)).to.equal(true);
      expect(context.canDrag(sourceDHandle)).to.equal(false);

      backend.simulateBeginDrag(sourceAHandle);
      expect(context.canDrag(sourceAHandle)).to.equal(false);
      expect(context.canDrag(sourceBHandle)).to.equal(false);
      expect(context.canDrag(sourceCHandle)).to.equal(false);
      expect(context.canDrag(sourceDHandle)).to.equal(false);

      backend.simulateEnter(targetHandle);
      backend.simulateDrop();
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
      const sourceHandle = registry.addSource(Types.FOO, source);
      const targetA = new NormalTarget();
      const targetAHandle = registry.addTarget(Types.FOO, targetA);
      const targetB = new NormalTarget();
      const targetBHandle = registry.addTarget(Types.FOO, targetB);
      const targetC = new NormalTarget();
      const targetCHandle = registry.addTarget(Types.BAR, targetC);
      const targetD = new NonDroppableTarget();
      const targetDHandle = registry.addTarget(Types.FOO, targetD);

      expect(context.canDrop(targetAHandle)).to.equal(false);
      expect(context.canDrop(targetBHandle)).to.equal(false);
      expect(context.canDrop(targetCHandle)).to.equal(false);
      expect(context.canDrop(targetDHandle)).to.equal(false);

      backend.simulateBeginDrag(sourceHandle);
      expect(context.canDrop(targetAHandle)).to.equal(true);
      expect(context.canDrop(targetBHandle)).to.equal(true);
      expect(context.canDrop(targetCHandle)).to.equal(false);
      expect(context.canDrop(targetDHandle)).to.equal(false);

      backend.simulateEnter(targetAHandle);
      backend.simulateDrop();
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

    it('returns true from isDragging only while dragging', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      const other = new NormalSource();
      const otherHandle = registry.addSource(Types.FOO, other);
      const target = new NormalTarget();
      const targetHandle = registry.addTarget(Types.FOO, target);

      expect(context.isDragging()).to.equal(false);
      expect(context.isDragging(sourceHandle)).to.equal(false);
      expect(context.isDragging(otherHandle)).to.equal(false);

      backend.simulateBeginDrag(sourceHandle);
      expect(context.isDragging()).to.equal(true);
      expect(context.isDragging(sourceHandle)).to.equal(true);
      expect(context.isDragging(otherHandle)).to.equal(false);

      backend.simulateEnter(targetHandle);
      backend.simulateDrop();
      expect(context.isDragging()).to.equal(true);
      expect(context.isDragging(sourceHandle)).to.equal(true);
      expect(context.isDragging(otherHandle)).to.equal(false);

      backend.simulateEndDrag();
      expect(context.isDragging()).to.equal(false);
      expect(context.isDragging(sourceHandle)).to.equal(false);
      expect(context.isDragging(otherHandle)).to.equal(false);

      backend.simulateBeginDrag(otherHandle);
      expect(context.isDragging()).to.equal(true);
      expect(context.isDragging(sourceHandle)).to.equal(false);
      expect(context.isDragging(otherHandle)).to.equal(true);
    });

    it('keeps track of dragged item, type and source handle', () => {
      const sourceA = new NormalSource({ a: 123 });
      const sourceAHandle = registry.addSource(Types.FOO, sourceA);
      const sourceB = new NormalSource({ a: 456 });
      const sourceBHandle = registry.addSource(Types.BAR, sourceB);
      const target = new NormalTarget();
      const targetHandle = registry.addTarget(Types.FOO, target);

      expect(context.getDraggedItem()).to.equal(null);
      expect(context.getDraggedItemType()).to.equal(null);
      expect(context.getDraggedSourceHandle()).to.equal(null);

      backend.simulateBeginDrag(sourceAHandle);
      expect(context.getDraggedItem().a).to.equal(123);
      expect(context.getDraggedItemType()).to.equal(Types.FOO);
      expect(context.getDraggedSourceHandle()).to.equal(sourceAHandle);

      backend.simulateEnter(targetHandle);
      backend.simulateDrop();
      expect(context.getDraggedItem().a).to.equal(123);
      expect(context.getDraggedItemType()).to.equal(Types.FOO);
      expect(context.getDraggedSourceHandle()).to.equal(sourceAHandle);

      backend.simulateEndDrag();
      expect(context.getDraggedItem()).to.equal(null);
      expect(context.getDraggedItemType()).to.equal(null);
      expect(context.getDraggedSourceHandle()).to.equal(null);

      backend.simulateBeginDrag(sourceBHandle);
      registry.removeSource(sourceBHandle);
      expect(context.getDraggedItem().a).to.equal(456);
      expect(context.getDraggedItemType()).to.equal(Types.BAR);
      expect(context.getDraggedSourceHandle()).to.equal(sourceBHandle);
    });

    it('keeps track of drop result and whether it occured', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      const targetA = new NormalTarget({ a: 123 });
      const targetAHandle = registry.addTarget(Types.FOO, targetA);
      const targetB = new TargetWithNoDropResult();
      const targetBHandle = registry.addTarget(Types.FOO, targetB);

      expect(context.didDrop()).to.equal(false);
      expect(context.getDropResult()).to.equal(null);

      backend.simulateBeginDrag(sourceHandle);
      expect(context.didDrop()).to.equal(false);
      expect(context.getDropResult()).to.equal(false);

      backend.simulateEnter(targetAHandle);
      backend.simulateDrop();
      expect(context.didDrop()).to.equal(true);
      expect(context.getDropResult().a).to.equal(123);

      backend.simulateEndDrag();
      expect(context.didDrop()).to.equal(false);
      expect(context.getDropResult()).to.equal(null);

      backend.simulateBeginDrag(sourceHandle);
      expect(context.didDrop()).to.equal(false);
      expect(context.getDropResult()).to.equal(false);

      backend.simulateEnter(targetBHandle);
      backend.simulateDrop();
      expect(context.didDrop()).to.equal(true);
      expect(context.getDropResult()).to.equal(true);

      backend.simulateEndDrag();
      expect(context.didDrop()).to.equal(false);
      expect(context.getDropResult()).to.equal(null);
    });
  });

  describe('mirror drag sources', () => {
    it('uses custom isDragging functions', () => {
      const sourceA = new NumberSource(1, true);
      const sourceAHandle = registry.addSource(Types.FOO, sourceA);
      const sourceB = new NumberSource(2, true);
      const sourceBHandle = registry.addSource(Types.FOO, sourceB);
      const sourceC = new NumberSource(3, true);
      const sourceCHandle = registry.addSource(Types.BAR, sourceC);
      const sourceD = new NumberSource(4, false);
      const sourceDHandle = registry.addSource(Types.FOO, sourceC);
      const target = new NormalTarget();
      const targetHandle = registry.addTarget(Types.FOO, target);

      expect(context.isDragging(sourceAHandle)).to.equal(false);
      expect(context.isDragging(sourceBHandle)).to.equal(false);
      expect(context.isDragging(sourceCHandle)).to.equal(false);
      expect(context.isDragging(sourceDHandle)).to.equal(false);

      backend.simulateBeginDrag(sourceAHandle);
      expect(context.isDragging(sourceAHandle)).to.equal(true);
      expect(context.isDragging(sourceBHandle)).to.equal(false);
      expect(context.isDragging(sourceCHandle)).to.equal(false);
      expect(context.isDragging(sourceDHandle)).to.equal(false);

      sourceA.number = 3;
      sourceB.number = 1;
      sourceC.number = 1;
      sourceD.number = 1;
      expect(context.isDragging(sourceAHandle)).to.equal(false);
      expect(context.isDragging(sourceBHandle)).to.equal(true);
      expect(context.isDragging(sourceCHandle)).to.equal(false);
      expect(context.isDragging(sourceDHandle)).to.equal(true);

      registry.removeSource(sourceDHandle);
      backend.simulateEnter(targetHandle);
      backend.simulateDrop();
      expect(context.isDragging(sourceAHandle)).to.equal(false);
      expect(context.isDragging(sourceBHandle)).to.equal(true);
      expect(context.isDragging(sourceCHandle)).to.equal(false);
      expect(context.isDragging(sourceDHandle)).to.equal(false);

      backend.simulateEndDrag();
      expect(context.isDragging(sourceAHandle)).to.equal(false);
      expect(context.isDragging(sourceBHandle)).to.equal(false);
      expect(context.isDragging(sourceCHandle)).to.equal(false);
      expect(context.isDragging(sourceDHandle)).to.equal(false);

      backend.simulateBeginDrag(sourceBHandle);
      expect(context.isDragging(sourceAHandle)).to.equal(false);
      expect(context.isDragging(sourceBHandle)).to.equal(true);
      expect(context.isDragging(sourceCHandle)).to.equal(false);
      expect(context.isDragging(sourceDHandle)).to.equal(false);

      sourceA.number = 1;
      expect(context.isDragging(sourceAHandle)).to.equal(true);

      sourceB.number = 5;
      expect(context.isDragging(sourceBHandle)).to.equal(false);
    });
  });
});