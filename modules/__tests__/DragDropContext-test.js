'use strict';

import expect from 'expect.js';
import Types from './Types';
import { NormalSource, NonDraggableSource } from './DragSources';
import { NormalTarget, NonDroppableTarget } from './DropTargets';
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
  });
});