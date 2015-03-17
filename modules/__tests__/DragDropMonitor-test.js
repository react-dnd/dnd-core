import expect from 'expect.js';
import Types from './types';
import { NormalSource, NonDraggableSource, NumberSource } from './sources';
import { NormalTarget, NonDroppableTarget, TargetWithNoDropResult } from './targets';
import { DragDropManager, TestBackend } from '..';

describe('DragDropMonitor', () => {
  let manager;
  let backend;
  let registry;
  let monitor;

  beforeEach(() => {
    manager = new DragDropManager(TestBackend);
    backend = manager.getBackend();
    registry = manager.getRegistry();
    monitor = manager.getMonitor();
  });

  describe('change event', () => {
    it('raises change event on beginDrag()', (done) => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);

      monitor.addChangeListener(done);
      backend.simulateBeginDrag(sourceHandle);
    });

    it('raises change event on endDrag()', (done) => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      const target = new NormalTarget();
      registry.addTarget(Types.FOO, target);

      backend.simulateBeginDrag(sourceHandle);
      monitor.addChangeListener(done);
      backend.simulateEndDrag();
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

      expect(monitor.canDrag(sourceAHandle)).to.equal(true);
      expect(monitor.canDrag(sourceBHandle)).to.equal(true);
      expect(monitor.canDrag(sourceCHandle)).to.equal(true);
      expect(monitor.canDrag(sourceDHandle)).to.equal(false);

      backend.simulateBeginDrag(sourceAHandle);
      expect(monitor.canDrag(sourceAHandle)).to.equal(false);
      expect(monitor.canDrag(sourceBHandle)).to.equal(false);
      expect(monitor.canDrag(sourceCHandle)).to.equal(false);
      expect(monitor.canDrag(sourceDHandle)).to.equal(false);

      backend.simulateEnter(targetHandle);
      backend.simulateDrop();
      expect(monitor.canDrag(sourceAHandle)).to.equal(false);
      expect(monitor.canDrag(sourceBHandle)).to.equal(false);
      expect(monitor.canDrag(sourceCHandle)).to.equal(false);
      expect(monitor.canDrag(sourceDHandle)).to.equal(false);

      backend.simulateEndDrag();
      expect(monitor.canDrag(sourceAHandle)).to.equal(true);
      expect(monitor.canDrag(sourceBHandle)).to.equal(true);
      expect(monitor.canDrag(sourceCHandle)).to.equal(true);
      expect(monitor.canDrag(sourceDHandle)).to.equal(false);

      backend.simulateBeginDrag(sourceAHandle);
      expect(monitor.canDrag(sourceAHandle)).to.equal(false);
      expect(monitor.canDrag(sourceBHandle)).to.equal(false);
      expect(monitor.canDrag(sourceCHandle)).to.equal(false);
      expect(monitor.canDrag(sourceDHandle)).to.equal(false);
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

      expect(monitor.canDrop(targetAHandle)).to.equal(false);
      expect(monitor.canDrop(targetBHandle)).to.equal(false);
      expect(monitor.canDrop(targetCHandle)).to.equal(false);
      expect(monitor.canDrop(targetDHandle)).to.equal(false);

      backend.simulateBeginDrag(sourceHandle);
      expect(monitor.canDrop(targetAHandle)).to.equal(true);
      expect(monitor.canDrop(targetBHandle)).to.equal(true);
      expect(monitor.canDrop(targetCHandle)).to.equal(false);
      expect(monitor.canDrop(targetDHandle)).to.equal(false);

      backend.simulateEnter(targetAHandle);
      backend.simulateDrop();
      expect(monitor.canDrop(targetAHandle)).to.equal(false);
      expect(monitor.canDrop(targetBHandle)).to.equal(false);
      expect(monitor.canDrop(targetCHandle)).to.equal(false);
      expect(monitor.canDrop(targetDHandle)).to.equal(false);

      backend.simulateEndDrag();
      expect(monitor.canDrop(targetAHandle)).to.equal(false);
      expect(monitor.canDrop(targetBHandle)).to.equal(false);
      expect(monitor.canDrop(targetCHandle)).to.equal(false);
      expect(monitor.canDrop(targetDHandle)).to.equal(false);

      backend.simulateBeginDrag(sourceHandle);
      expect(monitor.canDrop(targetAHandle)).to.equal(true);
      expect(monitor.canDrop(targetBHandle)).to.equal(true);
      expect(monitor.canDrop(targetCHandle)).to.equal(false);
      expect(monitor.canDrop(targetDHandle)).to.equal(false);
    });

    it('returns true from isDragging only while dragging', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      const other = new NormalSource();
      const otherHandle = registry.addSource(Types.FOO, other);
      const target = new NormalTarget();
      const targetHandle = registry.addTarget(Types.FOO, target);

      expect(monitor.isDragging()).to.equal(false);
      expect(monitor.isDragging(sourceHandle)).to.equal(false);
      expect(monitor.isDragging(otherHandle)).to.equal(false);

      backend.simulateBeginDrag(sourceHandle);
      expect(monitor.isDragging()).to.equal(true);
      expect(monitor.isDragging(sourceHandle)).to.equal(true);
      expect(monitor.isDragging(otherHandle)).to.equal(false);

      backend.simulateEnter(targetHandle);
      backend.simulateDrop();
      expect(monitor.isDragging()).to.equal(true);
      expect(monitor.isDragging(sourceHandle)).to.equal(true);
      expect(monitor.isDragging(otherHandle)).to.equal(false);

      backend.simulateEndDrag();
      expect(monitor.isDragging()).to.equal(false);
      expect(monitor.isDragging(sourceHandle)).to.equal(false);
      expect(monitor.isDragging(otherHandle)).to.equal(false);

      backend.simulateBeginDrag(otherHandle);
      expect(monitor.isDragging()).to.equal(true);
      expect(monitor.isDragging(sourceHandle)).to.equal(false);
      expect(monitor.isDragging(otherHandle)).to.equal(true);
    });

    it('keeps track of dragged item, type and source handle', () => {
      const sourceA = new NormalSource({ a: 123 });
      const sourceAHandle = registry.addSource(Types.FOO, sourceA);
      const sourceB = new NormalSource({ a: 456 });
      const sourceBHandle = registry.addSource(Types.BAR, sourceB);
      const target = new NormalTarget();
      const targetHandle = registry.addTarget(Types.FOO, target);

      expect(monitor.getItem()).to.equal(null);
      expect(monitor.getItemType()).to.equal(null);
      expect(monitor.getSourceHandle()).to.equal(null);

      backend.simulateBeginDrag(sourceAHandle);
      expect(monitor.getItem().a).to.equal(123);
      expect(monitor.getItemType()).to.equal(Types.FOO);
      expect(monitor.getSourceHandle()).to.equal(sourceAHandle);

      backend.simulateEnter(targetHandle);
      backend.simulateDrop();
      expect(monitor.getItem().a).to.equal(123);
      expect(monitor.getItemType()).to.equal(Types.FOO);
      expect(monitor.getSourceHandle()).to.equal(sourceAHandle);

      backend.simulateEndDrag();
      expect(monitor.getItem()).to.equal(null);
      expect(monitor.getItemType()).to.equal(null);
      expect(monitor.getSourceHandle()).to.equal(null);

      backend.simulateBeginDrag(sourceBHandle);
      registry.removeSource(sourceBHandle);
      expect(monitor.getItem().a).to.equal(456);
      expect(monitor.getItemType()).to.equal(Types.BAR);
      expect(monitor.getSourceHandle()).to.equal(sourceBHandle);
    });

    it('keeps track of drop result and whether it occured', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      const targetA = new NormalTarget({ a: 123 });
      const targetAHandle = registry.addTarget(Types.FOO, targetA);
      const targetB = new TargetWithNoDropResult();
      const targetBHandle = registry.addTarget(Types.FOO, targetB);

      expect(monitor.didDrop()).to.equal(false);
      expect(monitor.getDropResult()).to.equal(null);

      backend.simulateBeginDrag(sourceHandle);
      expect(monitor.didDrop()).to.equal(false);
      expect(monitor.getDropResult()).to.equal(false);

      backend.simulateEnter(targetAHandle);
      backend.simulateDrop();
      expect(monitor.didDrop()).to.equal(true);
      expect(monitor.getDropResult().a).to.equal(123);

      backend.simulateEndDrag();
      expect(monitor.didDrop()).to.equal(false);
      expect(monitor.getDropResult()).to.equal(null);

      backend.simulateBeginDrag(sourceHandle);
      expect(monitor.didDrop()).to.equal(false);
      expect(monitor.getDropResult()).to.equal(false);

      backend.simulateEnter(targetBHandle);
      backend.simulateDrop();
      expect(monitor.didDrop()).to.equal(true);
      expect(monitor.getDropResult()).to.equal(true);

      backend.simulateEndDrag();
      expect(monitor.didDrop()).to.equal(false);
      expect(monitor.getDropResult()).to.equal(null);
    });
  });

  describe('multi-type targets', () => {
    it('takes all types into consideration', () => {
      const sourceA = new NormalSource();
      const sourceAHandle = registry.addSource(Types.FOO, sourceA);
      const sourceB = new NormalSource();
      const sourceBHandle = registry.addSource(Types.BAZ, sourceB);
      const targetA = new NormalTarget();
      const targetAHandle = registry.addTarget([Types.FOO, Types.BAR], targetA);
      const targetB = new NormalTarget();
      const targetBHandle = registry.addTarget([Types.BAR, Types.BAZ], targetB);
      const targetC = new NormalTarget();
      const targetCHandle = registry.addTarget([Types.FOO, Types.BAR, Types.BAZ], targetC);

      expect(monitor.canDrop(targetAHandle)).to.equal(false);
      expect(monitor.canDrop(targetBHandle)).to.equal(false);
      expect(monitor.canDrop(targetCHandle)).to.equal(false);

      backend.simulateBeginDrag(sourceAHandle);
      expect(monitor.canDrop(targetAHandle)).to.equal(true);
      expect(monitor.canDrop(targetBHandle)).to.equal(false);
      expect(monitor.canDrop(targetCHandle)).to.equal(true);

      backend.simulateEnter(targetAHandle);
      backend.simulateDrop();
      expect(monitor.canDrop(targetAHandle)).to.equal(false);
      expect(monitor.canDrop(targetBHandle)).to.equal(false);
      expect(monitor.canDrop(targetCHandle)).to.equal(false);

      backend.simulateEndDrag();
      expect(monitor.canDrop(targetAHandle)).to.equal(false);
      expect(monitor.canDrop(targetBHandle)).to.equal(false);
      expect(monitor.canDrop(targetCHandle)).to.equal(false);

      backend.simulateBeginDrag(sourceBHandle);
      expect(monitor.canDrop(targetAHandle)).to.equal(false);
      expect(monitor.canDrop(targetBHandle)).to.equal(true);
      expect(monitor.canDrop(targetCHandle)).to.equal(true);
    });
  });

  describe('target handle tracking', () => {
    it('treats removing an entered drop target midflight as calling leave() on it', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      const target = new NormalTarget();
      const targetHandle = registry.addTarget(Types.FOO, target);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateEnter(targetHandle);
      expect(monitor.getTargetHandles().length).to.be(1);
      expect(monitor.isOver(targetHandle)).to.equal(true);
      expect(monitor.isOver(targetHandle, true)).to.equal(true);

      registry.removeTarget(targetHandle);
      expect(monitor.getTargetHandles().length).to.be(0);
      expect(monitor.isOver(targetHandle)).to.equal(false);
      expect(monitor.isOver(targetHandle, true)).to.equal(false);
    });

    it('leaves nested drop zones when parent leaves', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      const targetA = new NormalTarget();
      const targetAHandle = registry.addTarget(Types.FOO, targetA);
      const targetB = new NormalTarget();
      const targetBHandle = registry.addTarget(Types.FOO, targetB);
      const targetC = new NormalTarget();
      const targetCHandle = registry.addTarget(Types.BAR, targetC);
      const targetD = new NormalTarget();
      const targetDHandle = registry.addTarget(Types.FOO, targetD);
      let handles;

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateEnter(targetAHandle);
      backend.simulateEnter(targetBHandle);
      handles = monitor.getTargetHandles();
      expect(handles.length).to.be(2);
      expect(handles[0]).to.equal(targetAHandle);
      expect(monitor.isOver(targetAHandle)).to.equal(true);
      expect(monitor.isOver(targetAHandle, true)).to.equal(false);
      expect(handles[1]).to.equal(targetBHandle);
      expect(monitor.isOver(targetBHandle)).to.equal(true);
      expect(monitor.isOver(targetBHandle, true)).to.equal(true);

      backend.simulateEnter(targetCHandle);
      backend.simulateEnter(targetDHandle);
      handles = monitor.getTargetHandles();
      expect(handles.length).to.be(4);
      expect(handles[0]).to.equal(targetAHandle);
      expect(monitor.isOver(targetAHandle)).to.equal(true);
      expect(monitor.isOver(targetAHandle, true)).to.equal(false);
      expect(handles[1]).to.equal(targetBHandle);
      expect(monitor.isOver(targetBHandle)).to.equal(true);
      expect(monitor.isOver(targetBHandle, true)).to.equal(false);
      expect(handles[2]).to.equal(targetCHandle);
      expect(monitor.isOver(targetCHandle)).to.equal(true);
      expect(monitor.isOver(targetCHandle, true)).to.equal(false);
      expect(handles[3]).to.equal(targetDHandle);
      expect(monitor.isOver(targetDHandle)).to.equal(true);
      expect(monitor.isOver(targetDHandle, true)).to.equal(true);

      backend.simulateLeave(targetBHandle);
      handles = monitor.getTargetHandles();
      expect(handles[0]).to.equal(targetAHandle);
      expect(handles.length).to.be(1);
      expect(monitor.isOver(targetAHandle)).to.equal(true);
      expect(monitor.isOver(targetAHandle, true)).to.equal(true);
    });

    it('reset target handles on drop', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      const targetA = new NormalTarget();
      const targetAHandle = registry.addTarget(Types.FOO, targetA);
      const targetB = new NormalTarget();
      const targetBHandle = registry.addTarget(Types.FOO, targetB);
      let handles;

      handles = monitor.getTargetHandles();
      expect(handles.length).to.be(0);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateEnter(targetAHandle);
      backend.simulateEnter(targetBHandle);
      handles = monitor.getTargetHandles();
      expect(handles[0]).to.equal(targetAHandle);
      expect(monitor.isOver(targetAHandle)).to.equal(true);
      expect(monitor.isOver(targetAHandle, true)).to.equal(false);
      expect(handles[1]).to.equal(targetBHandle);
      expect(monitor.isOver(targetBHandle)).to.equal(true);
      expect(monitor.isOver(targetBHandle, true)).to.equal(true);
      expect(handles.length).to.be(2);

      backend.simulateDrop();
      handles = monitor.getTargetHandles();
      expect(handles.length).to.be(0);
      expect(monitor.isOver(targetAHandle)).to.equal(false);
      expect(monitor.isOver(targetAHandle, true)).to.equal(false);
      expect(monitor.isOver(targetBHandle)).to.equal(false);
      expect(monitor.isOver(targetBHandle, true)).to.equal(false);

      backend.simulateEndDrag();
      handles = monitor.getTargetHandles();
      expect(handles.length).to.be(0);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateEnter(targetAHandle);
      handles = monitor.getTargetHandles();
      expect(handles[0]).to.equal(targetAHandle);
      expect(monitor.isOver(targetAHandle)).to.equal(true);
      expect(monitor.isOver(targetAHandle, true)).to.equal(true);
      expect(handles.length).to.be(1);
    });

    it('reset target handles on endDrag', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      const targetA = new NormalTarget();
      const targetAHandle = registry.addTarget(Types.FOO, targetA);
      const targetB = new NormalTarget();
      const targetBHandle = registry.addTarget(Types.FOO, targetB);
      let handles;

      handles = monitor.getTargetHandles();
      expect(handles.length).to.be(0);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateEnter(targetAHandle);
      backend.simulateEnter(targetBHandle);
      handles = monitor.getTargetHandles();
      expect(handles[0]).to.equal(targetAHandle);
      expect(handles[1]).to.equal(targetBHandle);
      expect(handles.length).to.be(2);

      backend.simulateEndDrag();
      handles = monitor.getTargetHandles();
      expect(handles.length).to.be(0);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateEnter(targetAHandle);
      handles = monitor.getTargetHandles();
      expect(handles[0]).to.equal(targetAHandle);
      expect(handles.length).to.be(1);
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
      const sourceDHandle = registry.addSource(Types.FOO, sourceD);
      const target = new NormalTarget();
      const targetHandle = registry.addTarget(Types.FOO, target);

      expect(monitor.isDragging(sourceAHandle)).to.equal(false);
      expect(monitor.isDragging(sourceBHandle)).to.equal(false);
      expect(monitor.isDragging(sourceCHandle)).to.equal(false);
      expect(monitor.isDragging(sourceDHandle)).to.equal(false);

      backend.simulateBeginDrag(sourceAHandle);
      expect(monitor.isDragging(sourceAHandle)).to.equal(true);
      expect(monitor.isDragging(sourceBHandle)).to.equal(false);
      expect(monitor.isDragging(sourceCHandle)).to.equal(false);
      expect(monitor.isDragging(sourceDHandle)).to.equal(false);

      sourceA.number = 3;
      sourceB.number = 1;
      sourceC.number = 1;
      sourceD.number = 1;
      expect(monitor.isDragging(sourceAHandle)).to.equal(false);
      expect(monitor.isDragging(sourceBHandle)).to.equal(true);
      expect(monitor.isDragging(sourceCHandle)).to.equal(false);
      expect(monitor.isDragging(sourceDHandle)).to.equal(true);

      registry.removeSource(sourceDHandle);
      backend.simulateEnter(targetHandle);
      backend.simulateDrop();
      expect(monitor.isDragging(sourceAHandle)).to.equal(false);
      expect(monitor.isDragging(sourceBHandle)).to.equal(true);
      expect(monitor.isDragging(sourceCHandle)).to.equal(false);
      expect(monitor.isDragging(sourceDHandle)).to.equal(false);

      backend.simulateEndDrag();
      expect(monitor.isDragging(sourceAHandle)).to.equal(false);
      expect(monitor.isDragging(sourceBHandle)).to.equal(false);
      expect(monitor.isDragging(sourceCHandle)).to.equal(false);
      expect(monitor.isDragging(sourceDHandle)).to.equal(false);

      backend.simulateBeginDrag(sourceBHandle);
      expect(monitor.isDragging(sourceAHandle)).to.equal(false);
      expect(monitor.isDragging(sourceBHandle)).to.equal(true);
      expect(monitor.isDragging(sourceCHandle)).to.equal(false);
      expect(monitor.isDragging(sourceDHandle)).to.equal(false);

      sourceA.number = 1;
      expect(monitor.isDragging(sourceAHandle)).to.equal(true);

      sourceB.number = 5;
      expect(monitor.isDragging(sourceBHandle)).to.equal(false);
    });
  });
});