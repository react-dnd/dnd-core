"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var expect = _interopRequire(require("expect.js"));

var Types = _interopRequire(require("./types"));

var _sources = require("./sources");

var NormalSource = _sources.NormalSource;
var NonDraggableSource = _sources.NonDraggableSource;
var NumberSource = _sources.NumberSource;

var _targets = require("./targets");

var NormalTarget = _targets.NormalTarget;
var NonDroppableTarget = _targets.NonDroppableTarget;
var TargetWithNoDropResult = _targets.TargetWithNoDropResult;

var _ = require("..");

var DragDropManager = _.DragDropManager;
var TestBackend = _.TestBackend;

describe("DragDropContext", function () {
  var manager = undefined;
  var backend = undefined;
  var registry = undefined;
  var context = undefined;

  beforeEach(function () {
    manager = new DragDropManager(TestBackend);
    backend = manager.getBackend();
    registry = manager.getRegistry();
    context = manager.getContext();
  });

  describe("change event", function () {
    it("raises change event on beginDrag()", function (done) {
      var source = new NormalSource();
      var sourceHandle = registry.addSource(Types.FOO, source);

      context.addChangeListener(done);
      backend.simulateBeginDrag(sourceHandle);
    });

    it("raises change event on endDrag()", function (done) {
      var source = new NormalSource();
      var sourceHandle = registry.addSource(Types.FOO, source);
      var target = new NormalTarget();
      registry.addTarget(Types.FOO, target);

      backend.simulateBeginDrag(sourceHandle);
      context.addChangeListener(done);
      backend.simulateEndDrag();
    });
  });

  describe("state tracking", function () {
    it("returns true from canDrag unless already dragging or drag source opts out", function () {
      var sourceA = new NormalSource();
      var sourceAHandle = registry.addSource(Types.FOO, sourceA);
      var sourceB = new NormalSource();
      var sourceBHandle = registry.addSource(Types.FOO, sourceB);
      var sourceC = new NormalSource();
      var sourceCHandle = registry.addSource(Types.BAR, sourceC);
      var sourceD = new NonDraggableSource();
      var sourceDHandle = registry.addSource(Types.FOO, sourceD);
      var target = new NormalTarget();
      var targetHandle = registry.addTarget(Types.FOO, target);

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

    it("returns true from canDrop if dragging and type matches, unless target opts out", function () {
      var source = new NormalSource();
      var sourceHandle = registry.addSource(Types.FOO, source);
      var targetA = new NormalTarget();
      var targetAHandle = registry.addTarget(Types.FOO, targetA);
      var targetB = new NormalTarget();
      var targetBHandle = registry.addTarget(Types.FOO, targetB);
      var targetC = new NormalTarget();
      var targetCHandle = registry.addTarget(Types.BAR, targetC);
      var targetD = new NonDroppableTarget();
      var targetDHandle = registry.addTarget(Types.FOO, targetD);

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

    it("returns true from isDragging only while dragging", function () {
      var source = new NormalSource();
      var sourceHandle = registry.addSource(Types.FOO, source);
      var other = new NormalSource();
      var otherHandle = registry.addSource(Types.FOO, other);
      var target = new NormalTarget();
      var targetHandle = registry.addTarget(Types.FOO, target);

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

    it("keeps track of dragged item, type and source handle", function () {
      var sourceA = new NormalSource({ a: 123 });
      var sourceAHandle = registry.addSource(Types.FOO, sourceA);
      var sourceB = new NormalSource({ a: 456 });
      var sourceBHandle = registry.addSource(Types.BAR, sourceB);
      var target = new NormalTarget();
      var targetHandle = registry.addTarget(Types.FOO, target);

      expect(context.getItem()).to.equal(null);
      expect(context.getItemType()).to.equal(null);
      expect(context.getSourceHandle()).to.equal(null);

      backend.simulateBeginDrag(sourceAHandle);
      expect(context.getItem().a).to.equal(123);
      expect(context.getItemType()).to.equal(Types.FOO);
      expect(context.getSourceHandle()).to.equal(sourceAHandle);

      backend.simulateEnter(targetHandle);
      backend.simulateDrop();
      expect(context.getItem().a).to.equal(123);
      expect(context.getItemType()).to.equal(Types.FOO);
      expect(context.getSourceHandle()).to.equal(sourceAHandle);

      backend.simulateEndDrag();
      expect(context.getItem()).to.equal(null);
      expect(context.getItemType()).to.equal(null);
      expect(context.getSourceHandle()).to.equal(null);

      backend.simulateBeginDrag(sourceBHandle);
      registry.removeSource(sourceBHandle);
      expect(context.getItem().a).to.equal(456);
      expect(context.getItemType()).to.equal(Types.BAR);
      expect(context.getSourceHandle()).to.equal(sourceBHandle);
    });

    it("keeps track of drop result and whether it occured", function () {
      var source = new NormalSource();
      var sourceHandle = registry.addSource(Types.FOO, source);
      var targetA = new NormalTarget({ a: 123 });
      var targetAHandle = registry.addTarget(Types.FOO, targetA);
      var targetB = new TargetWithNoDropResult();
      var targetBHandle = registry.addTarget(Types.FOO, targetB);

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

  describe("target handle tracking", function () {
    it("treats removing an entered drop target midflight as calling leave() on it", function () {
      var source = new NormalSource();
      var sourceHandle = registry.addSource(Types.FOO, source);
      var target = new NormalTarget();
      var targetHandle = registry.addTarget(Types.FOO, target);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateEnter(targetHandle);
      expect(context.getTargetHandles().length).to.be(1);
      expect(context.isOver(targetHandle)).to.equal(true);
      expect(context.isOver(targetHandle, true)).to.equal(true);

      registry.removeTarget(targetHandle);
      expect(context.getTargetHandles().length).to.be(0);
      expect(context.isOver(targetHandle)).to.equal(false);
      expect(context.isOver(targetHandle, true)).to.equal(false);
    });

    it("leaves nested drop zones when parent leaves", function () {
      var source = new NormalSource();
      var sourceHandle = registry.addSource(Types.FOO, source);
      var targetA = new NormalTarget();
      var targetAHandle = registry.addTarget(Types.FOO, targetA);
      var targetB = new NormalTarget();
      var targetBHandle = registry.addTarget(Types.FOO, targetB);
      var targetC = new NormalTarget();
      var targetCHandle = registry.addTarget(Types.BAR, targetC);
      var targetD = new NormalTarget();
      var targetDHandle = registry.addTarget(Types.FOO, targetD);
      var handles = undefined;

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateEnter(targetAHandle);
      backend.simulateEnter(targetBHandle);
      handles = context.getTargetHandles();
      expect(handles.length).to.be(2);
      expect(handles[0]).to.equal(targetAHandle);
      expect(context.isOver(targetAHandle)).to.equal(true);
      expect(context.isOver(targetAHandle, true)).to.equal(false);
      expect(handles[1]).to.equal(targetBHandle);
      expect(context.isOver(targetBHandle)).to.equal(true);
      expect(context.isOver(targetBHandle, true)).to.equal(true);

      backend.simulateEnter(targetCHandle);
      backend.simulateEnter(targetDHandle);
      handles = context.getTargetHandles();
      expect(handles.length).to.be(4);
      expect(handles[0]).to.equal(targetAHandle);
      expect(context.isOver(targetAHandle)).to.equal(true);
      expect(context.isOver(targetAHandle, true)).to.equal(false);
      expect(handles[1]).to.equal(targetBHandle);
      expect(context.isOver(targetBHandle)).to.equal(true);
      expect(context.isOver(targetBHandle, true)).to.equal(false);
      expect(handles[2]).to.equal(targetCHandle);
      expect(context.isOver(targetCHandle)).to.equal(true);
      expect(context.isOver(targetCHandle, true)).to.equal(false);
      expect(handles[3]).to.equal(targetDHandle);
      expect(context.isOver(targetDHandle)).to.equal(true);
      expect(context.isOver(targetDHandle, true)).to.equal(true);

      backend.simulateLeave(targetBHandle);
      handles = context.getTargetHandles();
      expect(handles[0]).to.equal(targetAHandle);
      expect(handles.length).to.be(1);
      expect(context.isOver(targetAHandle)).to.equal(true);
      expect(context.isOver(targetAHandle, true)).to.equal(true);
    });

    it("reset target handles on drop", function () {
      var source = new NormalSource();
      var sourceHandle = registry.addSource(Types.FOO, source);
      var targetA = new NormalTarget();
      var targetAHandle = registry.addTarget(Types.FOO, targetA);
      var targetB = new NormalTarget();
      var targetBHandle = registry.addTarget(Types.FOO, targetB);
      var handles = undefined;

      handles = context.getTargetHandles();
      expect(handles.length).to.be(0);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateEnter(targetAHandle);
      backend.simulateEnter(targetBHandle);
      handles = context.getTargetHandles();
      expect(handles[0]).to.equal(targetAHandle);
      expect(context.isOver(targetAHandle)).to.equal(true);
      expect(context.isOver(targetAHandle, true)).to.equal(false);
      expect(handles[1]).to.equal(targetBHandle);
      expect(context.isOver(targetBHandle)).to.equal(true);
      expect(context.isOver(targetBHandle, true)).to.equal(true);
      expect(handles.length).to.be(2);

      backend.simulateDrop();
      handles = context.getTargetHandles();
      expect(handles.length).to.be(0);
      expect(context.isOver(targetAHandle)).to.equal(false);
      expect(context.isOver(targetAHandle, true)).to.equal(false);
      expect(context.isOver(targetBHandle)).to.equal(false);
      expect(context.isOver(targetBHandle, true)).to.equal(false);

      backend.simulateEndDrag();
      handles = context.getTargetHandles();
      expect(handles.length).to.be(0);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateEnter(targetAHandle);
      handles = context.getTargetHandles();
      expect(handles[0]).to.equal(targetAHandle);
      expect(context.isOver(targetAHandle)).to.equal(true);
      expect(context.isOver(targetAHandle, true)).to.equal(true);
      expect(handles.length).to.be(1);
    });

    it("reset target handles on endDrag", function () {
      var source = new NormalSource();
      var sourceHandle = registry.addSource(Types.FOO, source);
      var targetA = new NormalTarget();
      var targetAHandle = registry.addTarget(Types.FOO, targetA);
      var targetB = new NormalTarget();
      var targetBHandle = registry.addTarget(Types.FOO, targetB);
      var handles = undefined;

      handles = context.getTargetHandles();
      expect(handles.length).to.be(0);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateEnter(targetAHandle);
      backend.simulateEnter(targetBHandle);
      handles = context.getTargetHandles();
      expect(handles[0]).to.equal(targetAHandle);
      expect(handles[1]).to.equal(targetBHandle);
      expect(handles.length).to.be(2);

      backend.simulateEndDrag();
      handles = context.getTargetHandles();
      expect(handles.length).to.be(0);

      backend.simulateBeginDrag(sourceHandle);
      backend.simulateEnter(targetAHandle);
      handles = context.getTargetHandles();
      expect(handles[0]).to.equal(targetAHandle);
      expect(handles.length).to.be(1);
    });
  });

  describe("mirror drag sources", function () {
    it("uses custom isDragging functions", function () {
      var sourceA = new NumberSource(1, true);
      var sourceAHandle = registry.addSource(Types.FOO, sourceA);
      var sourceB = new NumberSource(2, true);
      var sourceBHandle = registry.addSource(Types.FOO, sourceB);
      var sourceC = new NumberSource(3, true);
      var sourceCHandle = registry.addSource(Types.BAR, sourceC);
      var sourceD = new NumberSource(4, false);
      var sourceDHandle = registry.addSource(Types.FOO, sourceC);
      var target = new NormalTarget();
      var targetHandle = registry.addTarget(Types.FOO, target);

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