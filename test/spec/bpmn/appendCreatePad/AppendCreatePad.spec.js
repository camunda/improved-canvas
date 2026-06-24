import {
  insertCoreStyles,
  insertBpmnStyles,
  bootstrapModeler,
  inject
} from 'test/TestHelper';


import AppendCreatePad from 'lib/bpmn/appendCreatePad';

import diagramXML from './AppendCreatePad.bpmn';

insertCoreStyles();
insertBpmnStyles();

describe('<AppendCreatePad>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      AppendCreatePad
    ]
  }));


  it('should have custom class name', inject(function(appendCreatePad, canvas, elementRegistry) {

    // given
    const task = elementRegistry.get('Task_1');

    // when
    appendCreatePad.open(task);

    // then
    expect(canvas.getContainer().querySelector('.djs-append-create-pad')).to.exist;
  }));


  it('should open append popup on icon click', inject(
    function(appendCreatePad, canvas, elementRegistry, popupMenu) {

      // given
      const task = elementRegistry.get('Task_1');

      const open = sinon.spy(popupMenu, 'open');

      appendCreatePad.open(task);

      const icon = canvas.getContainer().querySelector('.djs-append-create-pad .djs-create-pad-entry-cta');

      // when
      icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // then
      expect(open).to.have.been.calledOnce;
      expect(open.firstCall.args[ 0 ]).to.equal(task);
      expect(open.firstCall.args[ 1 ]).to.equal('bpmn-append');
    }
  ));


  describe('#canOpen', function() {

    it('should return true if append allowed', inject(function(appendCreatePad, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      const canOpen = appendCreatePad.canOpen(task);

      // then
      expect(canOpen).to.be.true;
    }));


    it('should return false if append not allowed', inject(function(appendCreatePad, elementRegistry) {

      // given
      const endEvent = elementRegistry.get('EndEvent_1');

      // when
      const canOpen = appendCreatePad.canOpen(endEvent);

      // then
      expect(canOpen).to.be.false;
    }));

  });


  describe('#getEntries', function() {

    it('should get append entries (task)', inject(function(appendCreatePad, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      const entries = appendCreatePad.getEntries(task);

      // then
      expect(entries).to.exist;

      expect(Object.keys(entries)).to.eql([
        'append',
        'connect',
        'append.append-task',
        'append.gateway',
        'append.intermediate-event',
        'append.end-event'
      ]);
    }));


    it('should get append entries (event-based gateway)', inject(function(appendCreatePad, elementRegistry) {

      // given
      const task = elementRegistry.get('EventBasedGateway_1');

      // when
      const entries = appendCreatePad.getEntries(task);

      // then
      expect(entries).to.exist;

      expect(Object.keys(entries)).to.eql([
        'append',
        'connect',
        'append.receive-task',
        'append.message-intermediate-event',
        'append.timer-intermediate-event',
        'append.condition-intermediate-event',
        'append.signal-intermediate-event'
      ]);
    }));


    it('should get append entries (end event)', inject(function(appendCreatePad, elementRegistry) {

      // given
      const task = elementRegistry.get('EndEvent_1');

      // when
      const entries = appendCreatePad.getEntries(task);

      // then
      expect(entries).to.exist;

      expect(Object.keys(entries)).to.eql([ 'append', 'connect' ]);
    }));

  });


  describe('#getPosition', function() {

    it('should return position for task', inject(function(appendCreatePad, canvas, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      const position = appendCreatePad.getPosition(task);

      // then
      const gfx = canvas.getGraphics(task);

      const targetBounds = gfx.getBoundingClientRect();

      const container = canvas.getContainer();

      const containerBounds = container.getBoundingClientRect();

      expect(position.left).to.be.within(targetBounds.right - containerBounds.left, targetBounds.right - containerBounds.left + 40);
      expect(position.top).to.be.closeTo(targetBounds.top + targetBounds.height / 2 - containerBounds.top, 1);
    }));


    it('should return position for expanded sub-process', inject(function(appendCreatePad, canvas, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      const position = appendCreatePad.getPosition(task);

      // then
      const gfx = canvas.getGraphics(task);

      const targetBounds = gfx.getBoundingClientRect();

      const container = canvas.getContainer();

      const containerBounds = container.getBoundingClientRect();

      expect(position.left).to.be.within(targetBounds.right - containerBounds.left, targetBounds.right - containerBounds.left + 50);
      expect(position.top).to.be.closeTo(targetBounds.top + targetBounds.height / 2 - containerBounds.top, 1);
    }));


    it('should return position for boundary event (right)', inject(function(appendCreatePad, canvas, elementRegistry) {

      // given
      const boundaryEvent = elementRegistry.get('BoundaryEvent_1');

      // when
      const position = appendCreatePad.getPosition(boundaryEvent);

      // then
      const gfx = canvas.getGraphics(boundaryEvent);

      const targetBounds = gfx.getBoundingClientRect();

      const container = canvas.getContainer();

      const containerBounds = container.getBoundingClientRect();

      expect(position.left).to.be.within(targetBounds.right - containerBounds.left, targetBounds.right - containerBounds.left + 40);
      expect(position.top).to.be.closeTo(targetBounds.top + targetBounds.height / 2 - containerBounds.top, 1);
    }));


    it('should return position for boundary event (bottom)', inject(function(appendCreatePad, canvas, elementRegistry) {

      // given
      const boundaryEvent = elementRegistry.get('CompensationBoundaryEvent_1');

      // when
      const position = appendCreatePad.getPosition(boundaryEvent);

      // then
      const gfx = canvas.getGraphics(boundaryEvent);

      const targetBounds = gfx.getBoundingClientRect();

      const container = canvas.getContainer();

      const containerBounds = container.getBoundingClientRect();

      expect(position.left).to.be.closeTo(targetBounds.left + targetBounds.width / 2 - containerBounds.left, 1);
      expect(position.top).to.be.within(targetBounds.bottom - containerBounds.top, targetBounds.bottom - containerBounds.top + 40);
    }));

  });

});