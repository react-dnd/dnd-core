import expect from 'expect.js';
import Types from './types';
import { NormalSource, NonDraggableSource, BadItemSource } from './sources';
import { NormalTarget, NonDroppableTarget, TargetWithNoDropResult, BadResultTarget, TransformResultTarget } from './targets';
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

    it('registers and unregisters multi-type drop targets', () => {
      const target = new NormalTarget();
      const targetHandle = registry.addTarget([Types.FOO, Types.BAR], target);
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
      expect(() => registry.addSource(['yo'], source)).to.throwError();
      expect(() => registry.addTarget(null, target)).to.throwError();
      expect(() => registry.addTarget(undefined, target)).to.throwError();
      expect(() => registry.addTarget(23, target)).to.throwError();
      expect(() => registry.addTarget([23], target)).to.throwError();
      expect(() => registry.addTarget(['yo', null], target)).to.throwError();
      expect(() => registry.addTarget([['yo']], target)).to.throwError();
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
        backend.simulateEnter(targetHandle);
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
        backend.simulateEnter(targetHandle);
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
        expect(registry.getSource(sourceHandle)).to.equal(null);

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
        backend.simulateEnter(targetAHandle);
        backend.simulateEnter(targetBHandle);
        backend.simulateLeave(targetBHandle);
        backend.simulateLeave(targetAHandle);
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
        backend.simulateEnter(targetHandle);
        backend.simulateDrop();
        expect(target.didCallDrop).to.equal(false);
      });

      it('ignores drop() if target has a different type', () => {
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);
        const target = new NormalTarget();
        const targetHandle = registry.addTarget(Types.BAR, target);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateEnter(targetHandle);
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
        backend.simulateEnter(targetHandle);
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
          backend.simulateEnter(targetAHandle);
          backend.simulateEnter(targetBHandle);
          backend.simulateEnter(targetCHandle);
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
          backend.simulateEnter(targetAHandle);
          backend.simulateEnter(targetBHandle);
          backend.simulateEnter(targetCHandle);
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
          backend.simulateEnter(targetAHandle);
          backend.simulateEnter(targetBHandle);
          backend.simulateEnter(targetCHandle);
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
          backend.simulateEnter(targetAHandle);
          backend.simulateEnter(targetBHandle);
          backend.simulateEnter(targetCHandle);
          backend.simulateEnter(targetDHandle);
          backend.simulateEnter(targetEHandle);
          backend.simulateEnter(targetFHandle);
          backend.simulateEnter(targetGHandle);
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
          backend.simulateEnter(targetAHandle);
          backend.simulateEnter(targetBHandle);
          backend.simulateEnter(targetCHandle);
          backend.simulateEnter(targetDHandle);
          backend.simulateEnter(targetEHandle);
          backend.simulateEnter(targetFHandle);
          backend.simulateEnter(targetGHandle);
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
      });
    });

    describe('enter() and leave()', () => {
      it('throws in enter() if it is called outside a drag operation', () => {
        const target = new NormalTarget();
        const targetHandle = registry.addTarget(Types.BAR, target);
        expect(() => backend.simulateEnter(targetHandle)).to.throwError();
      });

      it('throws in enter() if it is already in an entered target', () => {
        const target = new NormalTarget();
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);
        const targetHandle = registry.addTarget(Types.BAR, target);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateEnter(targetHandle);
        expect(() => backend.simulateEnter(targetHandle)).to.throwError();
      });

      it('throws in leave() if it is called outside a drag operation', () => {
        const target = new NormalTarget();
        const targetHandle = registry.addTarget(Types.BAR, target);
        expect(() => backend.simulateLeave(targetHandle)).to.throwError();
      });

      it('throws in leave() if it is not entered', () => {
        const target = new NormalTarget();
        const source = new NormalSource();
        const sourceHandle = registry.addSource(Types.FOO, source);
        const targetHandle = registry.addTarget(Types.BAR, target);

        backend.simulateBeginDrag(sourceHandle);
        expect(() => backend.simulateLeave(targetHandle)).to.throwError();
      });
    });
  });
});