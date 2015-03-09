"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var expect = _interopRequire(require("expect.js"));

var Types = _interopRequire(require("./types"));

var _sources = require("./sources");

var NormalSource = _sources.NormalSource;
var NonDraggableSource = _sources.NonDraggableSource;
var BadItemSource = _sources.BadItemSource;

var _targets = require("./targets");

var NormalTarget = _targets.NormalTarget;
var NonDroppableTarget = _targets.NonDroppableTarget;
var TargetWithNoDropResult = _targets.TargetWithNoDropResult;
var BadResultTarget = _targets.BadResultTarget;
var TransformResultTarget = _targets.TransformResultTarget;

var _ = require("..");

var DragDropManager = _.DragDropManager;
var TestBackend = _.TestBackend;

describe("DragDropManager", function () {
  var manager = undefined;
  var backend = undefined;
  var registry = undefined;

  beforeEach(function () {
    manager = new DragDropManager(TestBackend);
    backend = manager.getBackend();
    registry = manager.getRegistry();
  });

  describe("handler registration", function () {
    it("registers and unregisters drag sources", function () {
      var source = new NormalSource();
      var sourceHandle = registry.addSource(Types.FOO, source);
      expect(registry.getSource(sourceHandle)).to.equal(source);

      registry.removeSource(sourceHandle);
      expect(registry.getSource(sourceHandle)).to.equal(null);
      expect(function () {
        return registry.removeSource(sourceHandle);
      }).to.throwError();
    });

    it("registers and unregisters drop targets", function () {
      var target = new NormalTarget();
      var targetHandle = registry.addTarget(Types.FOO, target);
      expect(registry.getTarget(targetHandle)).to.equal(target);

      registry.removeTarget(targetHandle);
      expect(registry.getTarget(targetHandle)).to.equal(null);
      expect(function () {
        return registry.removeTarget(targetHandle);
      }).to.throwError();
    });

    it("knows the difference between sources and targets", function () {
      var source = new NormalSource();
      var sourceHandle = registry.addSource(Types.FOO, source);
      var target = new NormalTarget();
      var targetHandle = registry.addTarget(Types.FOO, target);

      expect(function () {
        return registry.getSource(targetHandle);
      }).to.throwError();
      expect(function () {
        return registry.getTarget(sourceHandle);
      }).to.throwError();
      expect(function () {
        return registry.removeSource(targetHandle);
      }).to.throwError();
      expect(function () {
        return registry.removeTarget(sourceHandle);
      }).to.throwError();
    });

    it("throws on invalid type", function () {
      var source = new NormalSource();
      var target = new NormalTarget();

      expect(function () {
        return registry.addSource(null, source);
      }).to.throwError();
      expect(function () {
        return registry.addSource(undefined, source);
      }).to.throwError();
      expect(function () {
        return registry.addSource(23, source);
      }).to.throwError();
      expect(function () {
        return registry.addTarget(null, target);
      }).to.throwError();
      expect(function () {
        return registry.addTarget(undefined, target);
      }).to.throwError();
      expect(function () {
        return registry.addTarget(23, target);
      }).to.throwError();
    });
  });

  describe("drag source and target contract", function () {
    describe("beginDrag() and canDrag()", function () {
      it("ignores beginDrag() if canDrag() returns false", function () {
        var source = new NonDraggableSource();
        var sourceHandle = registry.addSource(Types.FOO, source);

        backend.simulateBeginDrag(sourceHandle);
        expect(source.didCallBeginDrag).to.equal(false);
      });

      it("throws if beginDrag() returns non-object", function () {
        var source = new BadItemSource();
        var sourceHandle = registry.addSource(Types.FOO, source);

        expect(function () {
          return backend.simulateBeginDrag(sourceHandle);
        }).to.throwError();
      });

      it("begins drag if canDrag() returns true", function () {
        var source = new NormalSource();
        var sourceHandle = registry.addSource(Types.FOO, source);

        backend.simulateBeginDrag(sourceHandle);
        expect(source.didCallBeginDrag).to.equal(true);
      });

      it("throws in beginDrag() if it is called twice during one operation", function () {
        var source = new NormalSource();
        var sourceHandle = registry.addSource(Types.FOO, source);

        backend.simulateBeginDrag(sourceHandle);
        expect(function () {
          return backend.simulateBeginDrag(sourceHandle);
        }).to.throwError();
      });

      it("lets beginDrag() be called again in a next operation", function () {
        var source = new NormalSource();
        var sourceHandle = registry.addSource(Types.FOO, source);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateEndDrag(sourceHandle);

        source.didCallBeginDrag = false;
        expect(function () {
          return backend.simulateBeginDrag(sourceHandle);
        }).to.not.throwError();
        expect(source.didCallBeginDrag).to.equal(true);
      });
    });

    describe("drop(), canDrop() and endDrag()", function () {
      it("endDrag() sees drop() return value as drop result if dropped on a target", function () {
        var source = new NormalSource();
        var sourceHandle = registry.addSource(Types.FOO, source);
        var target = new NormalTarget();
        var targetHandle = registry.addTarget(Types.FOO, target);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateEnter(targetHandle);
        backend.simulateDrop();
        backend.simulateEndDrag();
        expect(target.didCallDrop).to.equal(true);
        expect(source.recordedDropResult.foo).to.equal("bar");
      });

      it("endDrag() sees true as drop result by default if dropped on a target", function () {
        var source = new NormalSource();
        var sourceHandle = registry.addSource(Types.FOO, source);
        var target = new TargetWithNoDropResult();
        var targetHandle = registry.addTarget(Types.FOO, target);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateEnter(targetHandle);
        backend.simulateDrop();
        backend.simulateEndDrag();
        expect(source.recordedDropResult).to.equal(true);
      });

      it("endDrag() sees false as drop result if dropped outside a target", function () {
        var source = new NormalSource();
        var sourceHandle = registry.addSource(Types.FOO, source);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateEndDrag();
        expect(source.recordedDropResult).to.equal(false);
      });

      it("calls endDrag even if source was unregistered", function () {
        var source = new NormalSource();
        var sourceHandle = registry.addSource(Types.FOO, source);

        backend.simulateBeginDrag(sourceHandle);
        registry.removeSource(sourceHandle);
        expect(registry.getSource(sourceHandle)).to.equal(null);

        backend.simulateEndDrag();
        expect(source.recordedDropResult).to.equal(false);
      });

      it("throws in endDrag() if it is called outside a drag operation", function () {
        var source = new NormalSource();
        var sourceHandle = registry.addSource(Types.FOO, source);
        expect(function () {
          return backend.simulateEndDrag(sourceHandle);
        }).to.throwError();
      });

      it("ignores drop() if no drop targets entered", function () {
        var source = new NormalSource();
        var sourceHandle = registry.addSource(Types.FOO, source);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateDrop();
        backend.simulateEndDrag();
        expect(source.recordedDropResult).to.equal(false);
      });

      it("ignores drop() if drop targets entered and left", function () {
        var source = new NormalSource();
        var sourceHandle = registry.addSource(Types.FOO, source);
        var targetA = new NormalTarget();
        var targetAHandle = registry.addTarget(Types.FOO, targetA);
        var targetB = new NormalTarget();
        var targetBHandle = registry.addTarget(Types.FOO, targetB);

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

      it("ignores drop() if canDrop() returns false", function () {
        var source = new NormalSource();
        var sourceHandle = registry.addSource(Types.FOO, source);
        var target = new NonDroppableTarget();
        var targetHandle = registry.addTarget(Types.FOO, target);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateEnter(targetHandle);
        backend.simulateDrop();
        expect(target.didCallDrop).to.equal(false);
      });

      it("ignores drop() if target has a different type", function () {
        var source = new NormalSource();
        var sourceHandle = registry.addSource(Types.FOO, source);
        var target = new NormalTarget();
        var targetHandle = registry.addTarget(Types.BAR, target);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateEnter(targetHandle);
        backend.simulateDrop();
        expect(target.didCallDrop).to.equal(false);
      });

      it("throws in drop() if it is called outside a drag operation", function () {
        expect(function () {
          return backend.simulateDrop();
        }).to.throwError();
      });

      it("throws in drop() if it returns something that is neither undefined nor an object", function () {
        var source = new NormalSource();
        var sourceHandle = registry.addSource(Types.FOO, source);
        var target = new BadResultTarget();
        var targetHandle = registry.addTarget(Types.FOO, target);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateEnter(targetHandle);
        expect(function () {
          return backend.simulateDrop();
        }).to.throwError();
      });

      describe("nested drop targets", function () {
        it("uses child result if parents have no drop result", function () {
          var source = new NormalSource();
          var sourceHandle = registry.addSource(Types.FOO, source);
          var targetA = new TargetWithNoDropResult();
          var targetAHandle = registry.addTarget(Types.FOO, targetA);
          var targetB = new NormalTarget({ number: 16 });
          var targetBHandle = registry.addTarget(Types.FOO, targetB);
          var targetC = new NormalTarget({ number: 42 });
          var targetCHandle = registry.addTarget(Types.FOO, targetC);

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

        it("excludes targets of different type when dispatching drop", function () {
          var source = new NormalSource();
          var sourceHandle = registry.addSource(Types.FOO, source);
          var targetA = new TargetWithNoDropResult();
          var targetAHandle = registry.addTarget(Types.FOO, targetA);
          var targetB = new NormalTarget({ number: 16 });
          var targetBHandle = registry.addTarget(Types.BAR, targetB);
          var targetC = new NormalTarget({ number: 42 });
          var targetCHandle = registry.addTarget(Types.FOO, targetC);

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

        it("excludes non-droppable targets when dispatching drop", function () {
          var source = new NormalSource();
          var sourceHandle = registry.addSource(Types.FOO, source);
          var targetA = new TargetWithNoDropResult();
          var targetAHandle = registry.addTarget(Types.FOO, targetA);
          var targetB = new TargetWithNoDropResult();
          var targetBHandle = registry.addTarget(Types.FOO, targetB);
          var targetC = new NonDroppableTarget({ number: 16 });
          var targetCHandle = registry.addTarget(Types.BAR, targetC);

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

        it("lets parent drop targets transform child results", function () {
          var source = new NormalSource();
          var sourceHandle = registry.addSource(Types.FOO, source);
          var targetA = new TargetWithNoDropResult();
          var targetAHandle = registry.addTarget(Types.FOO, targetA);
          var targetB = new TransformResultTarget(function (dropResult) {
            return { number: dropResult.number * 2 };
          });
          var targetBHandle = registry.addTarget(Types.FOO, targetB);
          var targetC = new NonDroppableTarget();
          var targetCHandle = registry.addTarget(Types.FOO, targetC);
          var targetD = new TransformResultTarget(function (dropResult) {
            return { number: dropResult.number + 1 };
          });
          var targetDHandle = registry.addTarget(Types.FOO, targetD);
          var targetE = new NormalTarget({ number: 42 });
          var targetEHandle = registry.addTarget(Types.FOO, targetE);
          var targetF = new TransformResultTarget(function (dropResult) {
            return { number: dropResult.number / 2 };
          });
          var targetFHandle = registry.addTarget(Types.BAR, targetF);
          var targetG = new NormalTarget({ number: 100 });
          var targetGHandle = registry.addTarget(Types.BAR, targetG);

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

        it("always chooses parent drop result", function () {
          var source = new NormalSource();
          var sourceHandle = registry.addSource(Types.FOO, source);
          var targetA = new NormalTarget({ number: 12345 });
          var targetAHandle = registry.addTarget(Types.FOO, targetA);
          var targetB = new TransformResultTarget(function (dropResult) {
            return { number: dropResult.number * 2 };
          });
          var targetBHandle = registry.addTarget(Types.FOO, targetB);
          var targetC = new NonDroppableTarget();
          var targetCHandle = registry.addTarget(Types.FOO, targetC);
          var targetD = new TransformResultTarget(function (dropResult) {
            return { number: dropResult.number + 1 };
          });
          var targetDHandle = registry.addTarget(Types.FOO, targetD);
          var targetE = new NormalTarget({ number: 42 });
          var targetEHandle = registry.addTarget(Types.FOO, targetE);
          var targetF = new TransformResultTarget(function (dropResult) {
            return { number: dropResult.number / 2 };
          });
          var targetFHandle = registry.addTarget(Types.BAR, targetF);
          var targetG = new NormalTarget({ number: 100 });
          var targetGHandle = registry.addTarget(Types.BAR, targetG);

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

    describe("enter() and leave()", function () {
      it("throws in enter() if it is called outside a drag operation", function () {
        var target = new NormalTarget();
        var targetHandle = registry.addTarget(Types.BAR, target);
        expect(function () {
          return backend.simulateEnter(targetHandle);
        }).to.throwError();
      });

      it("throws in enter() if it is already in an entered target", function () {
        var target = new NormalTarget();
        var source = new NormalSource();
        var sourceHandle = registry.addSource(Types.FOO, source);
        var targetHandle = registry.addTarget(Types.BAR, target);

        backend.simulateBeginDrag(sourceHandle);
        backend.simulateEnter(targetHandle);
        expect(function () {
          return backend.simulateEnter(targetHandle);
        }).to.throwError();
      });

      it("throws in leave() if it is called outside a drag operation", function () {
        var target = new NormalTarget();
        var targetHandle = registry.addTarget(Types.BAR, target);
        expect(function () {
          return backend.simulateLeave(targetHandle);
        }).to.throwError();
      });

      it("throws in leave() if it is not entered", function () {
        var target = new NormalTarget();
        var source = new NormalSource();
        var sourceHandle = registry.addSource(Types.FOO, source);
        var targetHandle = registry.addTarget(Types.BAR, target);

        backend.simulateBeginDrag(sourceHandle);
        expect(function () {
          return backend.simulateLeave(targetHandle);
        }).to.throwError();
      });
    });
  });
});