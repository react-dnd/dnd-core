import expect from 'expect.js';
import Types from './types';
import { NormalSource, NonDraggableSource, BadItemSource } from './sources';
import { NormalTarget, NonDroppableTarget, TargetWithNoDropResult, BadResultTarget, TransformResultTarget } from './targets';
import { DragDropManager, TestBackend } from '..';
import isString from 'lodash/lang/isString';

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
      expect(registry.getSource(sourceHandle)).to.equal(undefined);
      expect(() => registry.removeSource(sourceHandle)).to.throwError();
    });

    it('registers and unregisters drop targets', () => {
      const target = new NormalTarget();
      const targetHandle = registry.addTarget(Types.FOO, target);
      expect(registry.getTarget(targetHandle)).to.equal(target);

      registry.removeTarget(targetHandle);
      expect(registry.getTarget(targetHandle)).to.equal(undefined);
      expect(() => registry.removeTarget(targetHandle)).to.throwError();
    });

    it('registers and unregisters multi-type drop targets', () => {
      const target = new NormalTarget();
      const targetHandle = registry.addTarget([Types.FOO, Types.BAR], target);
      expect(registry.getTarget(targetHandle)).to.equal(target);

      registry.removeTarget(targetHandle);
      expect(registry.getTarget(targetHandle)).to.equal(undefined);
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
      expect(() => registry.addSource(['yo'], source)).to.throwError();
      expect(() => registry.addTarget(null, target)).to.throwError();
      expect(() => registry.addTarget(undefined, target)).to.throwError();
      expect(() => registry.addTarget(23, target)).to.throwError();
      expect(() => registry.addTarget([23], target)).to.throwError();
      expect(() => registry.addTarget(['yo', null], target)).to.throwError();
      expect(() => registry.addTarget([['yo']], target)).to.throwError();
    });

    it('throws on adding the same source twice', () => {
      const source = new NormalSource();
      registry.addSource(Types.FOO, source);

      expect(() => registry.addSource(Types.FOO, source)).to.throwError();
      expect(() => registry.addSource(Types.BAR, source)).to.throwError();
    });

    it('throws on adding the same target twice', () => {
      const target = new NormalTarget();
      registry.addTarget(Types.FOO, target);

      expect(() => registry.addTarget(Types.FOO, target)).to.throwError();
      expect(() => registry.addTarget(Types.BAR, target)).to.throwError();
      expect(() => registry.addTarget([Types.FOO, Types.BAR], target)).to.throwError();
    });

    it('calls setup() and teardown() on backend', () => {
      expect(backend.didCallSetup).to.equal(undefined);
      expect(backend.didCallTeardown).to.equal(undefined);

      const sourceHandle = registry.addSource(Types.FOO, new NormalSource());
      expect(backend.didCallSetup).to.equal(true);
      expect(backend.didCallTeardown).to.equal(undefined);
      backend.didCallSetup = undefined;
      backend.didCallTeardown = undefined;

      const targetHandle = registry.addTarget(Types.FOO, new NormalTarget());
      expect(backend.didCallSetup).to.equal(undefined);
      expect(backend.didCallTeardown).to.equal(undefined);
      backend.didCallSetup = undefined;
      backend.didCallTeardown = undefined;

      registry.removeSource(sourceHandle);
      expect(backend.didCallSetup).to.equal(undefined);
      expect(backend.didCallTeardown).to.equal(undefined);
      backend.didCallSetup = undefined;
      backend.didCallTeardown = undefined;

      registry.removeTarget(targetHandle);
      expect(backend.didCallSetup).to.equal(undefined);
      expect(backend.didCallTeardown).to.equal(true);
      backend.didCallSetup = undefined;
      backend.didCallTeardown = undefined;

      registry.addTarget(Types.BAR, new NormalTarget());
      expect(backend.didCallSetup).to.equal(true);
      expect(backend.didCallTeardown).to.equal(undefined);
    });

    it('returns string handles', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      const targetA = new NormalTarget();
      const targetAHandle = registry.addTarget(Types.FOO, targetA);
      const targetB = new NormalTarget();
      const targetBHandle = registry.addTarget([Types.FOO, Types.BAR], targetB);

      expect(isString(sourceHandle)).to.equal(true);
      expect(isString(targetAHandle)).to.equal(true);
      expect(isString(targetBHandle)).to.equal(true);
    });

    it('accurately reports handler role', () => {
      const source = new NormalSource();
      const sourceHandle = registry.addSource(Types.FOO, source);
      const target = new NormalTarget();
      const targetHandle = registry.addTarget(Types.FOO, target);

      expect(registry.isSourceHandle(sourceHandle)).to.equal(true);
      expect(registry.isSourceHandle(targetHandle)).to.equal(false);
      expect(() => registry.isSourceHandle('something else')).to.throwError();
      expect(() => registry.isSourceHandle(null)).to.throwError();

      expect(registry.isTargetHandle(sourceHandle)).to.equal(false);
      expect(registry.isTargetHandle(targetHandle)).to.equal(true);
      expect(() => registry.isTargetHandle('something else')).to.throwError();
      expect(() => registry.isTargetHandle(null)).to.throwError();
    });
  });

  describe('drag source and target contract', () => {
    describe('beginDrag() and canDrag()', () => {
      it('ignores beginDrag() if canDrag() returns false', () => {
        const source = new NonDraggableSource();
        const sourceHandle = registry.addSource(Types.FOO, source);

        backend.simulateBeginDrag(sourceHandle);
        expect(source.didCallBeginDrag).to.equal(false);
      });

      it('throws if beginDrag() returns non-object', () => {
        const source = new BadItemSource();
        const sourceHandle = registry.addSource(Types.FOO, source);

        expect(() => backend.simulateBeginDrag(sourceHandle)).to.throwError();
      });

      it('begins drag if canDrag() returns true', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);

        backend.simulateBeginDrag(sourceHandle);
        expect(source.didCallBeginDrag).to.equal(true);
      });

      it('throws in beginDrag() if it is called twice during one operation', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);

        backend.simulateBeginDrag(sourceHandle);
        expect(() => backend.simulateBeginDrag(sourceHandle)).to.throwError();
      });

      it('throws in beginDrag() if it is called with an invalid handle', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);
        const target = new NormalTarget();
        const targetHandle = registry.addTarget(Types.FOO, target);

        expect(() => backend.simulateBeginDrag(null)).to.throwError();
        expect(() => backend.simulateBeginDrag('yo')).to.throwError();
        expect(() => backend.simulateBeginDrag(targetHandle)).to.throwError();

        registry.removeSource(sourceHandle);
        expect(() => backend.simulateBeginDrag(sourceHandle)).to.throwError();
      });

      it('lets beginDrag() be called again in a next operation', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateEndDrag(sourceHandle);

        source.didCallBeginDrag = false;
        expect(() => backend.simulateBeginDrag(sourceHandle)).to.not.throwError();
        expect(source.didCallBeginDrag).to.equal(true);
      });
    });

    describe('drop(), canDrop() and endDrag()', () => {
      it('endDrag() sees drop() return value as drop result if dropped on a target', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);
        const target = new NormalTarget();
        const targetHandle = registry.addTarget(Types.FOO, target);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateHover([targetHandle]);
        backend.simulateDrop();
        backend.simulateEndDrag();
        expect(target.didCallDrop).to.equal(true);
        expect(source.recordedDropResult.foo).to.equal('bar');
      });

      it('endDrag() sees true as drop result by default if dropped on a target', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);
        const target = new TargetWithNoDropResult();
        const targetHandle = registry.addTarget(Types.FOO, target);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateHover([targetHandle]);
        backend.simulateDrop();
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
        expect(registry.getSource(sourceHandle)).to.equal(undefined);

        backend.simulateEndDrag();
        expect(source.recordedDropResult).to.equal(false);
      });

      it('throws in endDrag() if it is called outside a drag operation', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);
        expect(() => backend.simulateEndDrag(sourceHandle)).to.throwError();
      });

      it('ignores drop() if no drop targets entered', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateDrop();
        backend.simulateEndDrag();
        expect(source.recordedDropResult).to.equal(false);
      });

      it('ignores drop() if drop targets entered and left', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);
        const targetA = new NormalTarget();
        const targetAHandle = registry.addTarget(Types.FOO, targetA);
        const targetB = new NormalTarget();
        const targetBHandle = registry.addTarget(Types.FOO, targetB);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateHover([targetAHandle]);
        backend.simulateHover([targetAHandle, targetBHandle]);
        backend.simulateHover([targetAHandle]);
        backend.simulateHover([]);
        backend.simulateDrop();
        backend.simulateEndDrag();
        expect(targetA.didCallDrop).to.equal(false);
        expect(targetB.didCallDrop).to.equal(false);
        expect(source.recordedDropResult).to.equal(false);
      });

      it('ignores drop() if canDrop() returns false', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);
        const target = new NonDroppableTarget();
        const targetHandle = registry.addTarget(Types.FOO, target);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateHover([targetHandle]);
        backend.simulateDrop();
        expect(target.didCallDrop).to.equal(false);
      });

      it('ignores drop() if target has a different type', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);
        const target = new NormalTarget();
        const targetHandle = registry.addTarget(Types.BAR, target);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateHover([targetHandle]);
        backend.simulateDrop();
        expect(target.didCallDrop).to.equal(false);
      });

      it('throws in drop() if it is called outside a drag operation', () => {
        expect(() => backend.simulateDrop()).to.throwError();
      });

      it('throws in drop() if it returns something that is neither undefined nor an object', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);
        const target = new BadResultTarget();
        const targetHandle = registry.addTarget(Types.FOO, target);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateHover([targetHandle]);
        expect(() => backend.simulateDrop()).to.throwError();
      });

      describe('nested drop targets', () => {
        it('uses child result if parents have no drop result', () => {
          const source = new NormalSource();
          const sourceHandle = registry.addSource(Types.FOO, source);
          const targetA = new TargetWithNoDropResult();
          const targetAHandle = registry.addTarget(Types.FOO, targetA);
          const targetB = new NormalTarget({ number: 16 });
          const targetBHandle = registry.addTarget(Types.FOO, targetB);
          const targetC = new NormalTarget({ number: 42 });
          const targetCHandle = registry.addTarget(Types.FOO, targetC);

          backend.simulateBeginDrag(sourceHandle);
          backend.simulateHover([targetAHandle, targetBHandle, targetCHandle]);
          backend.simulateDrop();
          backend.simulateEndDrag();
          expect(targetA.didCallDrop).to.equal(true);
          expect(targetB.didCallDrop).to.equal(true);
          expect(targetC.didCallDrop).to.equal(true);
          expect(source.recordedDropResult.number).to.equal(16);
        });

        it('excludes targets of different type when dispatching drop', () => {
          const source = new NormalSource();
          const sourceHandle = registry.addSource(Types.FOO, source);
          const targetA = new TargetWithNoDropResult();
          const targetAHandle = registry.addTarget(Types.FOO, targetA);
          const targetB = new NormalTarget({ number: 16 });
          const targetBHandle = registry.addTarget(Types.BAR, targetB);
          const targetC = new NormalTarget({ number: 42 });
          const targetCHandle = registry.addTarget(Types.FOO, targetC);

          backend.simulateBeginDrag(sourceHandle);
          backend.simulateHover([targetAHandle, targetBHandle, targetCHandle]);
          backend.simulateDrop();
          backend.simulateEndDrag();
          expect(targetA.didCallDrop).to.equal(true);
          expect(targetB.didCallDrop).to.equal(false);
          expect(targetC.didCallDrop).to.equal(true);
          expect(source.recordedDropResult.number).to.equal(42);
        });

        it('excludes non-droppable targets when dispatching drop', () => {
          const source = new NormalSource();
          const sourceHandle = registry.addSource(Types.FOO, source);
          const targetA = new TargetWithNoDropResult();
          const targetAHandle = registry.addTarget(Types.FOO, targetA);
          const targetB = new TargetWithNoDropResult();
          const targetBHandle = registry.addTarget(Types.FOO, targetB);
          const targetC = new NonDroppableTarget({ number: 16 });
          const targetCHandle = registry.addTarget(Types.BAR, targetC);

          backend.simulateBeginDrag(sourceHandle);
          backend.simulateHover([targetAHandle, targetBHandle, targetCHandle]);
          backend.simulateDrop();
          backend.simulateEndDrag();
          expect(targetA.didCallDrop).to.equal(true);
          expect(targetB.didCallDrop).to.equal(true);
          expect(targetC.didCallDrop).to.equal(false);
          expect(source.recordedDropResult).to.equal(true);
        });

        it('lets parent drop targets transform child results', () => {
          const source = new NormalSource();
          const sourceHandle = registry.addSource(Types.FOO, source);
          const targetA = new TargetWithNoDropResult();
          const targetAHandle = registry.addTarget(Types.FOO, targetA);
          const targetB = new TransformResultTarget(dropResult => ({ number: dropResult.number * 2 }));
          const targetBHandle = registry.addTarget(Types.FOO, targetB);
          const targetC = new NonDroppableTarget();
          const targetCHandle = registry.addTarget(Types.FOO, targetC);
          const targetD = new TransformResultTarget(dropResult => ({ number: dropResult.number + 1 }));
          const targetDHandle = registry.addTarget(Types.FOO, targetD);
          const targetE = new NormalTarget({ number: 42 });
          const targetEHandle = registry.addTarget(Types.FOO, targetE);
          const targetF = new TransformResultTarget(dropResult => ({ number: dropResult.number / 2 }));
          const targetFHandle = registry.addTarget(Types.BAR, targetF);
          const targetG = new NormalTarget({ number: 100 });
          const targetGHandle = registry.addTarget(Types.BAR, targetG);

          backend.simulateBeginDrag(sourceHandle);
          backend.simulateHover([
            targetAHandle, targetBHandle, targetCHandle, targetDHandle,
            targetEHandle, targetFHandle, targetGHandle
          ]);
          backend.simulateDrop();
          backend.simulateEndDrag();
          expect(targetA.didCallDrop).to.equal(true);
          expect(targetB.didCallDrop).to.equal(true);
          expect(targetC.didCallDrop).to.equal(false);
          expect(targetD.didCallDrop).to.equal(true);
          expect(targetE.didCallDrop).to.equal(true);
          expect(targetF.didCallDrop).to.equal(false);
          expect(targetG.didCallDrop).to.equal(false);
          expect(source.recordedDropResult.number).to.equal((42 + 1) * 2);
        });

        it('always chooses parent drop result', () => {
          const source = new NormalSource();
          const sourceHandle = registry.addSource(Types.FOO, source);
          const targetA = new NormalTarget({ number: 12345 });
          const targetAHandle = registry.addTarget(Types.FOO, targetA);
          const targetB = new TransformResultTarget(dropResult => ({ number: dropResult.number * 2 }));
          const targetBHandle = registry.addTarget(Types.FOO, targetB);
          const targetC = new NonDroppableTarget();
          const targetCHandle = registry.addTarget(Types.FOO, targetC);
          const targetD = new TransformResultTarget(dropResult => ({ number: dropResult.number + 1 }));
          const targetDHandle = registry.addTarget(Types.FOO, targetD);
          const targetE = new NormalTarget({ number: 42 });
          const targetEHandle = registry.addTarget(Types.FOO, targetE);
          const targetF = new TransformResultTarget(dropResult => ({ number: dropResult.number / 2 }));
          const targetFHandle = registry.addTarget(Types.BAR, targetF);
          const targetG = new NormalTarget({ number: 100 });
          const targetGHandle = registry.addTarget(Types.BAR, targetG);

          backend.simulateBeginDrag(sourceHandle);
          backend.simulateHover([
            targetAHandle, targetBHandle, targetCHandle, targetDHandle,
            targetEHandle, targetFHandle, targetGHandle
          ]);
          backend.simulateDrop();
          backend.simulateEndDrag();
          expect(targetA.didCallDrop).to.equal(true);
          expect(targetB.didCallDrop).to.equal(true);
          expect(targetC.didCallDrop).to.equal(false);
          expect(targetD.didCallDrop).to.equal(true);
          expect(targetE.didCallDrop).to.equal(true);
          expect(targetF.didCallDrop).to.equal(false);
          expect(targetG.didCallDrop).to.equal(false);
          expect(source.recordedDropResult.number).to.equal(12345);
        });

        it('excludes removed targets when dispatching drop', () => {
          const source = new NormalSource();
          const sourceHandle = registry.addSource(Types.FOO, source);
          const targetA = new NormalTarget();
          const targetAHandle = registry.addTarget(Types.FOO, targetA);
          const targetB = new NormalTarget();
          const targetBHandle = registry.addTarget(Types.FOO, targetB);
          const targetC = new NormalTarget();
          const targetCHandle = registry.addTarget(Types.FOO, targetC);

          backend.simulateBeginDrag(sourceHandle);
          backend.simulateHover([targetAHandle, targetBHandle, targetCHandle]);
          registry.removeTarget(targetBHandle);
          backend.simulateDrop();
          backend.simulateEndDrag();
          expect(targetA.didCallDrop).to.equal(true);
          expect(targetB.didCallDrop).to.equal(false);
          expect(targetC.didCallDrop).to.equal(true);
        });
      });
    });

    describe('hover()', () => {
      it('lets hover() be called any time', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);
        const target = new NormalTarget();
        const targetHandle = registry.addTarget(Types.BAR, target);

        expect(() => backend.simulateHover([targetHandle])).to.not.throwError();

        backend.simulateBeginDrag(sourceHandle);
        expect(() => backend.simulateHover([targetHandle])).to.not.throwError();

        backend.simulateDrop();
        expect(() => backend.simulateHover([targetHandle])).to.not.throwError();

        backend.simulateEndDrag();
        expect(() => backend.simulateHover([targetHandle])).to.not.throwError();

        backend.simulateBeginDrag(sourceHandle);
        expect(() => backend.simulateHover([targetHandle])).to.not.throwError();
      });

      it('does not call hover() outside drag operation', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);
        const target = new NormalTarget();
        const targetHandle = registry.addTarget(Types.FOO, target);

        backend.simulateHover([targetHandle]);
        expect(target.didCallHover).to.equal(false);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateHover([targetHandle]);
        expect(target.didCallHover).to.equal(true);

        target.didCallHover = false;
        backend.simulateHover([targetHandle]);
        expect(target.didCallHover).to.equal(true);

        target.didCallHover = false;
        backend.simulateEndDrag();
        backend.simulateHover([targetHandle]);
        expect(target.didCallHover).to.equal(false);
      });

      it('excludes targets of different type when dispatching hover', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);
        const targetA = new NormalTarget();
        const targetAHandle = registry.addTarget(Types.FOO, targetA);
        const targetB = new NormalTarget();
        const targetBHandle = registry.addTarget(Types.BAR, targetB);
        const targetC = new NormalTarget();
        const targetCHandle = registry.addTarget(Types.FOO, targetC);
        const targetD = new NormalTarget();
        const targetDHandle = registry.addTarget([Types.BAZ, Types.FOO], targetD);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateHover([targetAHandle, targetBHandle, targetCHandle, targetDHandle]);
        expect(targetA.didCallHover).to.equal(true);
        expect(targetB.didCallHover).to.equal(false);
        expect(targetC.didCallHover).to.equal(true);
        expect(targetD.didCallHover).to.equal(true);
      });

      it('includes non-droppable targets when dispatching hover', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);
        const targetA = new TargetWithNoDropResult();
        const targetAHandle = registry.addTarget(Types.FOO, targetA);
        const targetB = new TargetWithNoDropResult();
        const targetBHandle = registry.addTarget(Types.FOO, targetB);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateHover([targetAHandle, targetBHandle]);
        expect(targetA.didCallHover).to.equal(true);
        expect(targetB.didCallHover).to.equal(true);
      });

      it('throws in hover() if it contains the same target twice', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);
        const targetA = new NormalTarget();
        const targetAHandle = registry.addTarget(Types.BAR, targetA);
        const targetB = new NormalTarget();
        const targetBHandle = registry.addTarget(Types.BAR, targetB);

        backend.simulateBeginDrag(sourceHandle);
        expect(() => backend.simulateHover([targetAHandle, targetBHandle, targetAHandle])).to.throwError();
      });

      it('throws in hover() if it is called with a non-array', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);
        const target = new NormalTarget();
        const targetHandle = registry.addTarget(Types.BAR, target);

        backend.simulateBeginDrag(sourceHandle);
        expect(() => backend.simulateHover(null)).to.throwError();
        expect(() => backend.simulateHover('yo')).to.throwError();
        expect(() => backend.simulateHover(targetHandle)).to.throwError();
      });

      it('throws in hover() if it contains an invalid drop target', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);
        const target = new NormalTarget();
        const targetHandle = registry.addTarget(Types.BAR, target);

        backend.simulateBeginDrag(sourceHandle);
        expect(() => backend.simulateHover([targetHandle, null])).to.throwError();
        expect(() => backend.simulateHover([targetHandle, 'yo'])).to.throwError();
        expect(() => backend.simulateHover([targetHandle, sourceHandle])).to.throwError();
      });

      it('throws in hover() if it contains a removed drop target', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);
        const targetA = new NormalTarget();
        let targetAHandle = registry.addTarget(Types.BAR, targetA);
        const targetB = new NormalTarget();
        let targetBHandle = registry.addTarget(Types.FOO, targetB);

        backend.simulateBeginDrag(sourceHandle);
        expect(() => backend.simulateHover([targetAHandle, targetBHandle])).to.not.throwError();

        backend.simulateHover([targetAHandle, targetBHandle]);
        registry.removeTarget(targetAHandle);
        expect(() => backend.simulateHover([targetBHandle, targetAHandle])).to.throwError();
        expect(() => backend.simulateHover([targetAHandle, targetBHandle])).to.throwError();
        expect(() => backend.simulateHover([targetBHandle])).to.not.throwError();

        backend.simulateHover([targetBHandle]);
        registry.removeTarget(targetBHandle);
        expect(() => backend.simulateHover([targetBHandle, targetAHandle])).to.throwError();
        expect(() => backend.simulateHover([targetBHandle])).to.throwError();
        expect(() => backend.simulateHover([targetAHandle])).to.throwError();

        targetAHandle = registry.addTarget(Types.FOO, targetA);
        expect(() => backend.simulateHover([targetAHandle])).to.not.throwError();

        backend.simulateHover([targetAHandle]);
        targetBHandle = registry.addTarget(Types.BAR, targetB);
        expect(() => backend.simulateHover([targetAHandle, targetBHandle])).to.not.throwError();
      });
    });
  });
});