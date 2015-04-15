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

  describe('change subscription', () => {
    it('throws on bad listener', () => {
      expect(() => monitor.subscribe(() => {})).to.not.throwError();

      expect(() => monitor.subscribe()).to.throwError();
      expect(() => monitor.subscribe(42)).to.throwError();
      expect(() => monitor.subscribe('hi')).to.throwError();
      expect(() => monitor.subscribe({})).to.throwError();
    });

    it('throws on bad handlerIds', () => {
      expect(() => monitor.subscribe(() => {}, [])).to.not.throwError();
      expect(() => monitor.subscribe(() => {}, ['hi'])).to.not.throwError();

      expect(() => monitor.subscribe(() => {}, {})).to.throwError();
      expect(() => monitor.subscribe(() => {}, () => {})).to.throwError();
      expect(() => monitor.subscribe(() => {}, 'hi')).to.throwError();
    });

    it('allows to unsubscribe', () => {
      const source = new NormalSource();
      const sourceId = registry.addSource(Types.FOO, source);

      let raisedChange = false;
      const unsubscribe = monitor.subscribe(() => {
        raisedChange = true;
      });

      unsubscribe();
      expect(unsubscribe).to.not.throwError();

      backend.simulateBeginDrag([sourceId]);
      expect(raisedChange).to.equal(false);
    });

    it('raises global change event on beginDrag()', (done) => {
      const source = new NormalSource();
      const sourceId = registry.addSource(Types.FOO, source);

      monitor.subscribe(done);
      backend.simulateBeginDrag([sourceId]);
    });

    it('raises local change event on sources and targets in beginDrag()', () => {
      const sourceA = new NormalSource();
      const sourceAId = registry.addSource(Types.FOO, sourceA);
      const sourceB = new NormalSource();
      const sourceBId = registry.addSource(Types.FOO, sourceB);
      const targetA = new NormalTarget();
      const targetAId = registry.addTarget(Types.FOO, targetA);

      let raisedChangeForSourceA = false;
      monitor.subscribe(() => {
        raisedChangeForSourceA = true;
      }, [sourceAId]);

      let raisedChangeForSourceB = false;
      monitor.subscribe(() => {
        raisedChangeForSourceB = true;
      }, [sourceBId]);

      let raisedChangeForSourceAAndB = false;
      monitor.subscribe(() => {
        raisedChangeForSourceAAndB = true;
      }, [sourceAId, sourceBId]);

      let raisedChangeForTargetA = false;
      monitor.subscribe(() => {
        raisedChangeForTargetA = true;
      }, [targetAId]);

      backend.simulateBeginDrag([sourceAId]);
      expect(raisedChangeForSourceA).to.equal(true);
      expect(raisedChangeForSourceB).to.equal(true);
      expect(raisedChangeForSourceAAndB).to.equal(true);
      expect(raisedChangeForTargetA).to.equal(true);
    });

    it('raises local change event on sources and targets in endDrag()', () => {
      const sourceA = new NormalSource();
      const sourceAId = registry.addSource(Types.FOO, sourceA);
      const sourceB = new NormalSource();
      const sourceBId = registry.addSource(Types.FOO, sourceB);
      const targetA = new NormalTarget();
      const targetAId = registry.addTarget(Types.FOO, targetA);

      backend.simulateBeginDrag([sourceAId]);

      let raisedChangeForSourceA = false;
      monitor.subscribe(() => {
        raisedChangeForSourceA = true;
      }, [sourceAId]);

      let raisedChangeForSourceB = false;
      monitor.subscribe(() => {
        raisedChangeForSourceB = true;
      }, [sourceBId]);

      let raisedChangeForSourceAAndB = false;
      monitor.subscribe(() => {
        raisedChangeForSourceAAndB = true;
      }, [sourceAId, sourceBId]);

      let raisedChangeForTargetA = false;
      monitor.subscribe(() => {
        raisedChangeForTargetA = true;
      }, [targetAId]);

      backend.simulateEndDrag();
      expect(raisedChangeForSourceA).to.equal(true);
      expect(raisedChangeForSourceB).to.equal(true);
      expect(raisedChangeForSourceAAndB).to.equal(true);
      expect(raisedChangeForTargetA).to.equal(true);
    });

    it('raises local change event on sources and targets in drop()', () => {
      const sourceA = new NormalSource();
      const sourceAId = registry.addSource(Types.FOO, sourceA);
      const sourceB = new NormalSource();
      const sourceBId = registry.addSource(Types.FOO, sourceB);
      const targetA = new NormalTarget();
      const targetAId = registry.addTarget(Types.FOO, targetA);

      backend.simulateBeginDrag([sourceAId]);
      backend.simulateHover([targetAId]);

      let raisedChangeForSourceA = false;
      monitor.subscribe(() => {
        raisedChangeForSourceA = true;
      }, [sourceAId]);

      let raisedChangeForSourceB = false;
      monitor.subscribe(() => {
        raisedChangeForSourceB = true;
      }, [sourceBId]);

      let raisedChangeForSourceAAndB = false;
      monitor.subscribe(() => {
        raisedChangeForSourceAAndB = true;
      }, [sourceAId, sourceBId]);

      let raisedChangeForTargetA = false;
      monitor.subscribe(() => {
        raisedChangeForTargetA = true;
      }, [targetAId]);

      backend.simulateDrop();
      expect(raisedChangeForSourceA).to.equal(true);
      expect(raisedChangeForSourceB).to.equal(true);
      expect(raisedChangeForSourceAAndB).to.equal(true);
      expect(raisedChangeForTargetA).to.equal(true);
    });

    it('raises local change event only on previous and next targets in hover()', () => {
      const sourceA = new NormalSource();
      const sourceAId = registry.addSource(Types.FOO, sourceA);
      const sourceB = new NormalSource();
      const sourceBId = registry.addSource(Types.FOO, sourceB);
      const targetA = new NormalTarget();
      const targetAId = registry.addTarget(Types.FOO, targetA);
      const targetB = new NormalTarget();
      const targetBId = registry.addTarget(Types.FOO, targetB);
      const targetC = new NormalTarget();
      const targetCId = registry.addTarget(Types.FOO, targetC);
      const targetD = new NormalTarget();
      const targetDId = registry.addTarget(Types.FOO, targetD);
      const targetE = new NormalTarget();
      const targetEId = registry.addTarget(Types.FOO, targetE);

      backend.simulateBeginDrag([sourceAId]);
      backend.simulateHover([targetAId, targetBId]);

      let raisedChangeForSourceA = false;
      monitor.subscribe(() => {
        raisedChangeForSourceA = true;
      }, [sourceAId]);

      let raisedChangeForSourceB = false;
      monitor.subscribe(() => {
        raisedChangeForSourceB = true;
      }, [sourceBId]);

      let raisedChangeForTargetA = false;
      monitor.subscribe(() => {
        raisedChangeForTargetA = true;
      }, [targetAId]);

      let raisedChangeForTargetB = false;
      monitor.subscribe(() => {
        raisedChangeForTargetB = true;
      }, [targetBId]);

      let raisedChangeForTargetC = false;
      monitor.subscribe(() => {
        raisedChangeForTargetC = true;
      }, [targetCId]);

      let raisedChangeForTargetD = false;
      monitor.subscribe(() => {
        raisedChangeForTargetD = true;
      }, [targetDId]);

      let raisedChangeForTargetE = false;
      monitor.subscribe(() => {
        raisedChangeForTargetE = true;
      }, [targetEId]);

      let raisedChangeForSourceBAndTargetC = false;
      monitor.subscribe(() => {
        raisedChangeForSourceBAndTargetC = true;
      }, [sourceBId, targetCId]);

      let raisedChangeForSourceBAndTargetE = false;
      monitor.subscribe(() => {
        raisedChangeForSourceBAndTargetE = true;
      }, [sourceBId, targetEId]);

      backend.simulateHover([targetDId, targetEId]);
      expect(raisedChangeForSourceA).to.equal(false);
      expect(raisedChangeForSourceB).to.equal(false);
      expect(raisedChangeForTargetA).to.equal(true);
      expect(raisedChangeForTargetB).to.equal(true);
      expect(raisedChangeForTargetC).to.equal(false);
      expect(raisedChangeForTargetD).to.equal(true);
      expect(raisedChangeForTargetE).to.equal(true);
      expect(raisedChangeForSourceBAndTargetC).to.equal(false);
      expect(raisedChangeForSourceBAndTargetE).to.equal(true);
    });

    it('raises global change event on endDrag()', (done) => {
      const source = new NormalSource();
      const sourceId = registry.addSource(Types.FOO, source);
      const target = new NormalTarget();
      registry.addTarget(Types.FOO, target);

      backend.simulateBeginDrag([sourceId]);
      monitor.subscribe(done);
      backend.simulateEndDrag();
    });

    it('raises global change event on drop()', (done) => {
      const source = new NormalSource();
      const sourceId = registry.addSource(Types.FOO, source);
      const target = new NormalTarget();
      const targetId = registry.addTarget(Types.FOO, target);

      backend.simulateBeginDrag([sourceId]);
      backend.simulateHover([targetId]);

      monitor.subscribe(done);
      backend.simulateDrop();
    });

    it('does not raise global change event if hover targets have not changed', () => {
      const source = new NormalSource();
      const sourceId = registry.addSource(Types.FOO, source);
      const targetA = new NormalTarget({ a: 123 });
      const targetAId = registry.addTarget(Types.FOO, targetA);
      const targetB = new TargetWithNoDropResult();
      const targetBId = registry.addTarget(Types.FOO, targetB);

      let raisedChange = false;
      monitor.subscribe(() => {
        raisedChange = true;
      });

      backend.simulateBeginDrag([sourceId]);
      expect(raisedChange).to.equal(true);
      raisedChange = false;

      backend.simulateHover([targetAId]);
      expect(raisedChange).to.equal(true);
      raisedChange = false;

      backend.simulateHover([targetBId]);
      expect(raisedChange).to.equal(true);
      raisedChange = false;

      backend.simulateHover([targetBId]);
      expect(raisedChange).to.equal(false);

      backend.simulateHover([targetBId, targetAId]);
      expect(raisedChange).to.equal(true);
      raisedChange = false;

      backend.simulateHover([targetBId, targetAId]);
      expect(raisedChange).to.equal(false);

      backend.simulateHover([targetAId, targetBId]);
      expect(raisedChange).to.equal(true);
      raisedChange = false;

      backend.simulateHover([targetAId, targetBId]);
      expect(raisedChange).to.equal(false);
    });
  });

  describe('state tracking', () => {
    it('returns true from canDrag unless already dragging or drag source opts out', () => {
      const sourceA = new NormalSource();
      const sourceAId = registry.addSource(Types.FOO, sourceA);
      const sourceB = new NormalSource();
      const sourceBId = registry.addSource(Types.FOO, sourceB);
      const sourceC = new NormalSource();
      const sourceCId = registry.addSource(Types.BAR, sourceC);
      const sourceD = new NonDraggableSource();
      const sourceDId = registry.addSource(Types.FOO, sourceD);
      const target = new NormalTarget();
      const targetId = registry.addTarget(Types.FOO, target);

      expect(monitor.canDrag(sourceAId)).to.equal(true);
      expect(monitor.canDrag(sourceBId)).to.equal(true);
      expect(monitor.canDrag(sourceCId)).to.equal(true);
      expect(monitor.canDrag(sourceDId)).to.equal(false);

      backend.simulateBeginDrag([sourceAId]);
      expect(monitor.canDrag(sourceAId)).to.equal(false);
      expect(monitor.canDrag(sourceBId)).to.equal(false);
      expect(monitor.canDrag(sourceCId)).to.equal(false);
      expect(monitor.canDrag(sourceDId)).to.equal(false);

      backend.simulateHover([targetId]);
      backend.simulateDrop();
      expect(monitor.canDrag(sourceAId)).to.equal(false);
      expect(monitor.canDrag(sourceBId)).to.equal(false);
      expect(monitor.canDrag(sourceCId)).to.equal(false);
      expect(monitor.canDrag(sourceDId)).to.equal(false);

      backend.simulateEndDrag();
      expect(monitor.canDrag(sourceAId)).to.equal(true);
      expect(monitor.canDrag(sourceBId)).to.equal(true);
      expect(monitor.canDrag(sourceCId)).to.equal(true);
      expect(monitor.canDrag(sourceDId)).to.equal(false);

      backend.simulateBeginDrag([sourceAId]);
      expect(monitor.canDrag(sourceAId)).to.equal(false);
      expect(monitor.canDrag(sourceBId)).to.equal(false);
      expect(monitor.canDrag(sourceCId)).to.equal(false);
      expect(monitor.canDrag(sourceDId)).to.equal(false);
    });

    it('returns true from canDrop if dragging and type matches, unless target opts out', () => {
      const source = new NormalSource();
      const sourceId = registry.addSource(Types.FOO, source);
      const targetA = new NormalTarget();
      const targetAId = registry.addTarget(Types.FOO, targetA);
      const targetB = new NormalTarget();
      const targetBId = registry.addTarget(Types.FOO, targetB);
      const targetC = new NormalTarget();
      const targetCId = registry.addTarget(Types.BAR, targetC);
      const targetD = new NonDroppableTarget();
      const targetDId = registry.addTarget(Types.FOO, targetD);

      expect(monitor.canDrop(targetAId)).to.equal(false);
      expect(monitor.canDrop(targetBId)).to.equal(false);
      expect(monitor.canDrop(targetCId)).to.equal(false);
      expect(monitor.canDrop(targetDId)).to.equal(false);

      backend.simulateBeginDrag([sourceId]);
      expect(monitor.canDrop(targetAId)).to.equal(true);
      expect(monitor.canDrop(targetBId)).to.equal(true);
      expect(monitor.canDrop(targetCId)).to.equal(false);
      expect(monitor.canDrop(targetDId)).to.equal(false);

      backend.simulateHover([targetAId]);
      backend.simulateDrop();
      expect(monitor.canDrop(targetAId)).to.equal(false);
      expect(monitor.canDrop(targetBId)).to.equal(false);
      expect(monitor.canDrop(targetCId)).to.equal(false);
      expect(monitor.canDrop(targetDId)).to.equal(false);

      backend.simulateEndDrag();
      expect(monitor.canDrop(targetAId)).to.equal(false);
      expect(monitor.canDrop(targetBId)).to.equal(false);
      expect(monitor.canDrop(targetCId)).to.equal(false);
      expect(monitor.canDrop(targetDId)).to.equal(false);

      backend.simulateBeginDrag([sourceId]);
      expect(monitor.canDrop(targetAId)).to.equal(true);
      expect(monitor.canDrop(targetBId)).to.equal(true);
      expect(monitor.canDrop(targetCId)).to.equal(false);
      expect(monitor.canDrop(targetDId)).to.equal(false);
    });

    it('returns true from isDragging only while dragging', () => {
      const source = new NormalSource();
      const sourceId = registry.addSource(Types.FOO, source);
      const other = new NormalSource();
      const otherId = registry.addSource(Types.FOO, other);
      const target = new NormalTarget();
      const targetId = registry.addTarget(Types.FOO, target);

      expect(monitor.isDragging()).to.equal(false);
      expect(monitor.isDragging(sourceId)).to.equal(false);
      expect(monitor.isDragging(otherId)).to.equal(false);

      backend.simulateBeginDrag([sourceId]);
      expect(monitor.isDragging()).to.equal(true);
      expect(monitor.isDragging(sourceId)).to.equal(true);
      expect(monitor.isDragging(otherId)).to.equal(false);

      backend.simulateHover([targetId]);
      backend.simulateDrop();
      expect(monitor.isDragging()).to.equal(true);
      expect(monitor.isDragging(sourceId)).to.equal(true);
      expect(monitor.isDragging(otherId)).to.equal(false);

      backend.simulateEndDrag();
      expect(monitor.isDragging()).to.equal(false);
      expect(monitor.isDragging(sourceId)).to.equal(false);
      expect(monitor.isDragging(otherId)).to.equal(false);

      backend.simulateBeginDrag([otherId]);
      expect(monitor.isDragging()).to.equal(true);
      expect(monitor.isDragging(sourceId)).to.equal(false);
      expect(monitor.isDragging(otherId)).to.equal(true);
    });

    it('keeps track of dragged item, type and source handle', () => {
      const sourceA = new NormalSource({ a: 123 });
      const sourceAId = registry.addSource(Types.FOO, sourceA);
      const sourceB = new NormalSource({ a: 456 });
      const sourceBId = registry.addSource(Types.BAR, sourceB);
      const target = new NormalTarget();
      const targetId = registry.addTarget(Types.FOO, target);

      expect(monitor.getItem()).to.equal(null);
      expect(monitor.getItemType()).to.equal(null);
      expect(monitor.getSourceId()).to.equal(null);

      backend.simulateBeginDrag([sourceAId]);
      expect(monitor.getItem().a).to.equal(123);
      expect(monitor.getItemType()).to.equal(Types.FOO);
      expect(monitor.getSourceId()).to.equal(sourceAId);

      backend.simulateHover([targetId]);
      backend.simulateDrop();
      expect(monitor.getItem().a).to.equal(123);
      expect(monitor.getItemType()).to.equal(Types.FOO);
      expect(monitor.getSourceId()).to.equal(sourceAId);

      backend.simulateEndDrag();
      expect(monitor.getItem()).to.equal(null);
      expect(monitor.getItemType()).to.equal(null);
      expect(monitor.getSourceId()).to.equal(null);

      backend.simulateBeginDrag([sourceBId]);
      registry.removeSource(sourceBId);
      expect(monitor.getItem().a).to.equal(456);
      expect(monitor.getItemType()).to.equal(Types.BAR);
      expect(monitor.getSourceId()).to.equal(sourceBId);
    });

    it('keeps track of drop result and whether it occured', () => {
      const source = new NormalSource();
      const sourceId = registry.addSource(Types.FOO, source);
      const targetA = new NormalTarget({ a: 123 });
      const targetAId = registry.addTarget(Types.FOO, targetA);
      const targetB = new TargetWithNoDropResult();
      const targetBId = registry.addTarget(Types.FOO, targetB);

      expect(monitor.didDrop()).to.equal(false);
      expect(monitor.getDropResult()).to.equal(null);

      backend.simulateBeginDrag([sourceId]);
      expect(monitor.didDrop()).to.equal(false);
      expect(monitor.getDropResult()).to.equal(false);

      backend.simulateHover([targetAId]);
      backend.simulateDrop();
      expect(monitor.didDrop()).to.equal(true);
      expect(monitor.getDropResult().a).to.equal(123);

      backend.simulateEndDrag();
      expect(monitor.didDrop()).to.equal(false);
      expect(monitor.getDropResult()).to.equal(null);

      backend.simulateBeginDrag([sourceId]);
      expect(monitor.didDrop()).to.equal(false);
      expect(monitor.getDropResult()).to.equal(false);

      backend.simulateHover([targetBId]);
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
      const sourceAId = registry.addSource(Types.FOO, sourceA);
      const sourceB = new NormalSource();
      const sourceBId = registry.addSource(Types.BAZ, sourceB);
      const targetA = new NormalTarget();
      const targetAId = registry.addTarget([Types.FOO, Types.BAR], targetA);
      const targetB = new NormalTarget();
      const targetBId = registry.addTarget([Types.BAR, Types.BAZ], targetB);
      const targetC = new NormalTarget();
      const targetCId = registry.addTarget([Types.FOO, Types.BAR, Types.BAZ], targetC);

      expect(monitor.canDrop(targetAId)).to.equal(false);
      expect(monitor.canDrop(targetBId)).to.equal(false);
      expect(monitor.canDrop(targetCId)).to.equal(false);

      backend.simulateBeginDrag([sourceAId]);
      expect(monitor.canDrop(targetAId)).to.equal(true);
      expect(monitor.canDrop(targetBId)).to.equal(false);
      expect(monitor.canDrop(targetCId)).to.equal(true);

      backend.simulateHover([targetAId]);
      backend.simulateDrop();
      expect(monitor.canDrop(targetAId)).to.equal(false);
      expect(monitor.canDrop(targetBId)).to.equal(false);
      expect(monitor.canDrop(targetCId)).to.equal(false);

      backend.simulateEndDrag();
      expect(monitor.canDrop(targetAId)).to.equal(false);
      expect(monitor.canDrop(targetBId)).to.equal(false);
      expect(monitor.canDrop(targetCId)).to.equal(false);

      backend.simulateBeginDrag([sourceBId]);
      expect(monitor.canDrop(targetAId)).to.equal(false);
      expect(monitor.canDrop(targetBId)).to.equal(true);
      expect(monitor.canDrop(targetCId)).to.equal(true);
    });

    it('returns false from isDragging(sourceId) if source is not published', () => {
      const source = new NormalSource();
      const sourceId = registry.addSource(Types.FOO, source);

      expect(monitor.isDragging()).to.equal(false);
      expect(monitor.isDragging(sourceId)).to.equal(false);

      backend.simulateBeginDrag([sourceId], false);
      expect(monitor.isDragging()).to.equal(true);
      expect(monitor.isDragging(sourceId)).to.equal(false);

      backend.simulatePublishDragSource();
      expect(monitor.isDragging()).to.equal(true);
      expect(monitor.isDragging(sourceId)).to.equal(true);

      backend.simulateEndDrag();
      expect(monitor.isDragging()).to.equal(false);
      expect(monitor.isDragging(sourceId)).to.equal(false);
    });

    it('ignores publishDragSource() outside dragging operation', () => {
      const source = new NormalSource();
      const sourceId = registry.addSource(Types.FOO, source);

      expect(monitor.isDragging()).to.equal(false);
      expect(monitor.isDragging(sourceId)).to.equal(false);

      backend.simulatePublishDragSource();
      expect(monitor.isDragging()).to.equal(false);
      expect(monitor.isDragging(sourceId)).to.equal(false);

      backend.simulateBeginDrag([sourceId], false);
      expect(monitor.isDragging()).to.equal(true);
      expect(monitor.isDragging(sourceId)).to.equal(false);

      backend.simulatePublishDragSource();
      expect(monitor.isDragging()).to.equal(true);
      expect(monitor.isDragging(sourceId)).to.equal(true);

      backend.simulateEndDrag();
      expect(monitor.isDragging()).to.equal(false);
      expect(monitor.isDragging(sourceId)).to.equal(false);

      backend.simulatePublishDragSource();
      expect(monitor.isDragging()).to.equal(false);
      expect(monitor.isDragging(sourceId)).to.equal(false);
    });
  });

  describe('target handle tracking', () => {
    it('treats removing a hovered drop target as unhovering it', () => {
      const source = new NormalSource();
      const sourceId = registry.addSource(Types.FOO, source);
      const target = new NormalTarget();
      const targetId = registry.addTarget(Types.FOO, target);

      backend.simulateBeginDrag([sourceId]);
      backend.simulateHover([targetId]);
      expect(monitor.getTargetIds().length).to.be(1);
      expect(monitor.isOver(targetId)).to.equal(true);
      expect(monitor.isOver(targetId, true)).to.equal(true);

      registry.removeTarget(targetId);
      expect(monitor.getTargetIds().length).to.be(0);
      expect(monitor.isOver(targetId)).to.equal(false);
      expect(monitor.isOver(targetId, true)).to.equal(false);
    });

    it('keeps track of target handles', () => {
      const source = new NormalSource();
      const sourceId = registry.addSource(Types.FOO, source);
      const targetA = new NormalTarget();
      const targetAId = registry.addTarget(Types.FOO, targetA);
      const targetB = new NormalTarget();
      const targetBId = registry.addTarget(Types.FOO, targetB);
      const targetC = new NormalTarget();
      const targetCId = registry.addTarget(Types.FOO, targetC);

      let handles = monitor.getTargetIds();
      expect(handles.length).to.be(0);

      backend.simulateHover([targetAId]);
      handles = monitor.getTargetIds();
      expect(handles.length).to.be(1);
      expect(handles[0]).to.equal(targetAId);
      expect(monitor.isOver(targetAId)).to.equal(false);
      expect(monitor.isOver(targetAId, true)).to.equal(false);
      expect(monitor.isOver(targetBId)).to.equal(false);
      expect(monitor.isOver(targetBId, true)).to.equal(false);
      expect(monitor.isOver(targetCId)).to.equal(false);
      expect(monitor.isOver(targetCId, true)).to.equal(false);

      backend.simulateBeginDrag([sourceId]);
      handles = monitor.getTargetIds();
      expect(handles.length).to.be(1);
      expect(handles[0]).to.equal(targetAId);
      expect(monitor.isOver(targetAId)).to.equal(true);
      expect(monitor.isOver(targetAId, true)).to.equal(true);
      expect(monitor.isOver(targetBId)).to.equal(false);
      expect(monitor.isOver(targetBId, true)).to.equal(false);
      expect(monitor.isOver(targetCId)).to.equal(false);
      expect(monitor.isOver(targetCId, true)).to.equal(false);

      backend.simulateHover([]);
      handles = monitor.getTargetIds();
      expect(handles.length).to.be(0);
      expect(monitor.isOver(targetAId)).to.equal(false);
      expect(monitor.isOver(targetAId, true)).to.equal(false);
      expect(monitor.isOver(targetBId)).to.equal(false);
      expect(monitor.isOver(targetBId, true)).to.equal(false);
      expect(monitor.isOver(targetCId)).to.equal(false);
      expect(monitor.isOver(targetCId, true)).to.equal(false);

      backend.simulateHover([targetAId, targetBId, targetCId]);
      handles = monitor.getTargetIds();
      expect(handles.length).to.be(3);
      expect(handles[0]).to.equal(targetAId);
      expect(monitor.isOver(targetAId)).to.equal(true);
      expect(monitor.isOver(targetAId, true)).to.equal(false);
      expect(handles[1]).to.equal(targetBId);
      expect(monitor.isOver(targetBId)).to.equal(true);
      expect(monitor.isOver(targetBId, true)).to.equal(false);
      expect(handles[2]).to.equal(targetCId);
      expect(monitor.isOver(targetCId)).to.equal(true);
      expect(monitor.isOver(targetCId, true)).to.equal(true);

      backend.simulateHover([targetCId, targetBId, targetAId]);
      handles = monitor.getTargetIds();
      expect(handles.length).to.be(3);
      expect(handles[0]).to.equal(targetCId);
      expect(monitor.isOver(targetCId)).to.equal(true);
      expect(monitor.isOver(targetCId, true)).to.equal(false);
      expect(handles[1]).to.equal(targetBId);
      expect(monitor.isOver(targetBId)).to.equal(true);
      expect(monitor.isOver(targetBId, true)).to.equal(false);
      expect(handles[2]).to.equal(targetAId);
      expect(monitor.isOver(targetAId)).to.equal(true);
      expect(monitor.isOver(targetAId, true)).to.equal(true);

      backend.simulateHover([targetBId]);
      backend.simulateDrop();
      handles = monitor.getTargetIds();
      expect(handles[0]).to.equal(targetBId);
      expect(handles.length).to.be(1);
      expect(monitor.isOver(targetAId)).to.equal(false);
      expect(monitor.isOver(targetAId, true)).to.equal(false);
      expect(monitor.isOver(targetBId)).to.equal(true);
      expect(monitor.isOver(targetBId, true)).to.equal(true);
      expect(monitor.isOver(targetCId)).to.equal(false);
      expect(monitor.isOver(targetCId, true)).to.equal(false);

      backend.simulateEndDrag();
      expect(handles[0]).to.equal(targetBId);
      expect(handles.length).to.be(1);
      expect(monitor.isOver(targetAId)).to.equal(false);
      expect(monitor.isOver(targetAId, true)).to.equal(false);
      expect(monitor.isOver(targetBId)).to.equal(false);
      expect(monitor.isOver(targetBId, true)).to.equal(false);
      expect(monitor.isOver(targetCId)).to.equal(false);
      expect(monitor.isOver(targetCId, true)).to.equal(false);
    });

    it('counts non-droppable targets, but skips targets of another type', () => {
      const source = new NormalSource();
      const sourceId = registry.addSource(Types.FOO, source);
      const targetA = new NormalTarget();
      const targetAId = registry.addTarget(Types.FOO, targetA);
      const targetB = new NonDroppableTarget();
      const targetBId = registry.addTarget(Types.FOO, targetB);
      const targetC = new NormalTarget();
      const targetCId = registry.addTarget(Types.BAR, targetC);

      let handles = monitor.getTargetIds();
      expect(handles.length).to.be(0);

      backend.simulateHover([targetAId]);
      handles = monitor.getTargetIds();
      expect(handles.length).to.be(1);
      expect(handles[0]).to.equal(targetAId);
      expect(monitor.isOver(targetAId)).to.equal(false);
      expect(monitor.isOver(targetAId, true)).to.equal(false);
      expect(monitor.isOver(targetBId)).to.equal(false);
      expect(monitor.isOver(targetBId, true)).to.equal(false);
      expect(monitor.isOver(targetCId)).to.equal(false);
      expect(monitor.isOver(targetCId, true)).to.equal(false);

      backend.simulateBeginDrag([sourceId]);
      handles = monitor.getTargetIds();
      expect(handles.length).to.be(1);
      expect(handles[0]).to.equal(targetAId);
      expect(monitor.isOver(targetAId)).to.equal(true);
      expect(monitor.isOver(targetAId, true)).to.equal(true);
      expect(monitor.isOver(targetBId)).to.equal(false);
      expect(monitor.isOver(targetBId, true)).to.equal(false);
      expect(monitor.isOver(targetCId)).to.equal(false);
      expect(monitor.isOver(targetCId, true)).to.equal(false);

      backend.simulateHover([]);
      handles = monitor.getTargetIds();
      expect(handles.length).to.be(0);
      expect(monitor.isOver(targetAId)).to.equal(false);
      expect(monitor.isOver(targetAId, true)).to.equal(false);
      expect(monitor.isOver(targetBId)).to.equal(false);
      expect(monitor.isOver(targetBId, true)).to.equal(false);
      expect(monitor.isOver(targetCId)).to.equal(false);
      expect(monitor.isOver(targetCId, true)).to.equal(false);

      backend.simulateHover([targetAId, targetBId, targetCId]);
      handles = monitor.getTargetIds();
      expect(handles.length).to.be(3);
      expect(handles[0]).to.equal(targetAId);
      expect(monitor.isOver(targetAId)).to.equal(true);
      expect(monitor.isOver(targetAId, true)).to.equal(false);
      expect(handles[1]).to.equal(targetBId);
      expect(monitor.isOver(targetBId)).to.equal(true);
      expect(monitor.isOver(targetBId, true)).to.equal(false);
      expect(handles[2]).to.equal(targetCId);
      expect(monitor.isOver(targetCId)).to.equal(false);
      expect(monitor.isOver(targetCId, true)).to.equal(false);

      backend.simulateHover([targetCId, targetBId, targetAId]);
      handles = monitor.getTargetIds();
      expect(handles.length).to.be(3);
      expect(handles[0]).to.equal(targetCId);
      expect(monitor.isOver(targetCId)).to.equal(false);
      expect(monitor.isOver(targetCId, true)).to.equal(false);
      expect(handles[1]).to.equal(targetBId);
      expect(monitor.isOver(targetBId)).to.equal(true);
      expect(monitor.isOver(targetBId, true)).to.equal(false);
      expect(handles[2]).to.equal(targetAId);
      expect(monitor.isOver(targetAId)).to.equal(true);
      expect(monitor.isOver(targetAId, true)).to.equal(true);

      backend.simulateHover([targetBId]);
      backend.simulateDrop();
      handles = monitor.getTargetIds();
      expect(handles[0]).to.equal(targetBId);
      expect(handles.length).to.be(1);
      expect(monitor.isOver(targetAId)).to.equal(false);
      expect(monitor.isOver(targetAId, true)).to.equal(false);
      expect(monitor.isOver(targetBId)).to.equal(true);
      expect(monitor.isOver(targetBId, true)).to.equal(true);
      expect(monitor.isOver(targetCId)).to.equal(false);
      expect(monitor.isOver(targetCId, true)).to.equal(false);

      backend.simulateEndDrag();
      expect(handles[0]).to.equal(targetBId);
      expect(handles.length).to.be(1);
      expect(monitor.isOver(targetAId)).to.equal(false);
      expect(monitor.isOver(targetAId, true)).to.equal(false);
      expect(monitor.isOver(targetBId)).to.equal(false);
      expect(monitor.isOver(targetBId, true)).to.equal(false);
      expect(monitor.isOver(targetCId)).to.equal(false);
      expect(monitor.isOver(targetCId, true)).to.equal(false);
    });

    it('correctly handles isOver() for multi-type targets', () => {
      const sourceA = new NormalSource();
      const sourceAId = registry.addSource(Types.FOO, sourceA);
      const sourceB = new NormalSource();
      const sourceBId = registry.addSource(Types.BAR, sourceB);
      const sourceC = new NormalSource();
      const sourceCId = registry.addSource(Types.BAZ, sourceC);
      const target = new NormalTarget();
      const targetId = registry.addTarget([Types.FOO, Types.BAR], target);

      backend.simulateBeginDrag([sourceAId]);
      backend.simulateHover([targetId]);
      expect(monitor.isOver(targetId)).to.equal(true);
      expect(monitor.isOver(targetId, true)).to.equal(true);

      backend.simulateEndDrag();
      backend.simulateBeginDrag([sourceBId]);
      expect(monitor.isOver(targetId)).to.equal(true);
      expect(monitor.isOver(targetId, true)).to.equal(true);

      backend.simulateEndDrag();
      backend.simulateBeginDrag([sourceCId]);
      expect(monitor.isOver(targetId)).to.equal(false);
      expect(monitor.isOver(targetId, true)).to.equal(false);
    });

    it('does not reset target handles on drop() and endDrag()', () => {
      const source = new NormalSource();
      const sourceId = registry.addSource(Types.FOO, source);
      const targetA = new NormalTarget();
      const targetAId = registry.addTarget(Types.FOO, targetA);
      const targetB = new NormalTarget();
      const targetBId = registry.addTarget(Types.FOO, targetB);

      expect(monitor.getTargetIds().length).to.be(0);

      backend.simulateHover([targetAId, targetBId]);
      expect(monitor.getTargetIds().length).to.be(2);

      backend.simulateBeginDrag([sourceId]);
      expect(monitor.getTargetIds().length).to.be(2);

      backend.simulateDrop();
      expect(monitor.getTargetIds().length).to.be(2);

      backend.simulateEndDrag();
      expect(monitor.getTargetIds().length).to.be(2);

      backend.simulateHover([targetAId]);
      expect(monitor.getTargetIds().length).to.be(1);

      backend.simulateBeginDrag([sourceId]);
      expect(monitor.getTargetIds().length).to.be(1);
    });

    it('does not let array mutation corrupt internal state', () => {
      const source = new NormalSource();
      const sourceId = registry.addSource(Types.FOO, source);
      const target = new NormalTarget();
      const targetId = registry.addTarget(Types.FOO, target);
      const handles = [targetId];

      backend.simulateBeginDrag([sourceId]);
      backend.simulateHover(handles);
      expect(monitor.getTargetIds().length).to.be(1);

      handles.push(targetId);
      expect(monitor.getTargetIds().length).to.be(1);
    });
  });

  describe('mirror drag sources', () => {
    it('uses custom isDragging functions', () => {
      const sourceA = new NumberSource(1, true);
      const sourceAId = registry.addSource(Types.FOO, sourceA);
      const sourceB = new NumberSource(2, true);
      const sourceBId = registry.addSource(Types.FOO, sourceB);
      const sourceC = new NumberSource(3, true);
      const sourceCId = registry.addSource(Types.BAR, sourceC);
      const sourceD = new NumberSource(4, false);
      const sourceDId = registry.addSource(Types.FOO, sourceD);
      const target = new NormalTarget();
      const targetId = registry.addTarget(Types.FOO, target);

      expect(monitor.isDragging(sourceAId)).to.equal(false);
      expect(monitor.isDragging(sourceBId)).to.equal(false);
      expect(monitor.isDragging(sourceCId)).to.equal(false);
      expect(monitor.isDragging(sourceDId)).to.equal(false);

      backend.simulateBeginDrag([sourceAId]);
      expect(monitor.isDragging(sourceAId)).to.equal(true);
      expect(monitor.isDragging(sourceBId)).to.equal(false);
      expect(monitor.isDragging(sourceCId)).to.equal(false);
      expect(monitor.isDragging(sourceDId)).to.equal(false);

      sourceA.number = 3;
      sourceB.number = 1;
      sourceC.number = 1;
      sourceD.number = 1;
      expect(monitor.isDragging(sourceAId)).to.equal(false);
      expect(monitor.isDragging(sourceBId)).to.equal(true);
      expect(monitor.isDragging(sourceCId)).to.equal(false);
      expect(monitor.isDragging(sourceDId)).to.equal(true);

      registry.removeSource(sourceDId);
      backend.simulateHover([targetId]);
      backend.simulateDrop();
      expect(monitor.isDragging(sourceAId)).to.equal(false);
      expect(monitor.isDragging(sourceBId)).to.equal(true);
      expect(monitor.isDragging(sourceCId)).to.equal(false);
      expect(monitor.isDragging(sourceDId)).to.equal(false);

      backend.simulateEndDrag();
      expect(monitor.isDragging(sourceAId)).to.equal(false);
      expect(monitor.isDragging(sourceBId)).to.equal(false);
      expect(monitor.isDragging(sourceCId)).to.equal(false);
      expect(monitor.isDragging(sourceDId)).to.equal(false);

      backend.simulateBeginDrag([sourceBId]);
      expect(monitor.isDragging(sourceAId)).to.equal(false);
      expect(monitor.isDragging(sourceBId)).to.equal(true);
      expect(monitor.isDragging(sourceCId)).to.equal(false);
      expect(monitor.isDragging(sourceDId)).to.equal(false);

      sourceA.number = 1;
      expect(monitor.isDragging(sourceAId)).to.equal(true);

      sourceB.number = 5;
      expect(monitor.isDragging(sourceBId)).to.equal(false);
    });
  });
});