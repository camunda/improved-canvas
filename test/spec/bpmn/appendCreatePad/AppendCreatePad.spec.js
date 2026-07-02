import { expect } from 'chai';
import { spy } from 'sinon';

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

      const open = spy(popupMenu, 'open');

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


    it('should return true if connect-only (end event)', inject(function(appendCreatePad, elementRegistry) {

      // given
      const endEvent = elementRegistry.get('EndEvent_1');

      // when
      const canOpen = appendCreatePad.canOpen(endEvent);

      // then
      expect(canOpen).to.be.true;
    }));


    it('should return false for a connection', inject(function(appendCreatePad, elementRegistry) {

      // given
      const connection = elementRegistry.get('SequenceFlow_1');

      // when
      const canOpen = appendCreatePad.canOpen(connection);

      // then
      expect(canOpen).to.be.false;
    }));

  });


  describe('#canAppend', function() {

    it('should return true if append allowed', inject(function(appendCreatePad, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      const canAppend = appendCreatePad.canAppend(task);

      // then
      expect(canAppend).to.be.true;
    }));


    it('should return false for a connect-only element', inject(function(appendCreatePad, elementRegistry) {

      // given
      const endEvent = elementRegistry.get('EndEvent_1');

      // when
      const canAppend = appendCreatePad.canAppend(endEvent);

      // then
      expect(canAppend).to.be.false;
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

      expect(Object.keys(entries)).to.eql([ 'connect' ]);
    }));

  });


  describe('editor action', function() {

    it('should trigger create entry if append is not allowed', inject(
      function(appendCreatePad, editorActions, elementRegistry, palette, popupMenu, selection) {

        // given
        const endEvent = elementRegistry.get('EndEvent_1');

        const triggerEntry = spy(palette, 'triggerEntry');
        const open = spy(popupMenu, 'open');

        selection.select(endEvent);

        expect(appendCreatePad.isOpen()).to.be.true;

        // when
        editorActions.trigger('appendCreatePad', {});

        // then
        expect(triggerEntry).to.have.been.calledOnce;
        expect(triggerEntry.firstCall.args[ 0 ]).to.equal('create');
        expect(triggerEntry.firstCall.args[ 1 ]).to.equal('click');
        expect(open.getCalls().filter(({ args }) => args[ 1 ] === 'bpmn-append')).to.have.length(0);
      }
    ));

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


  describe('label editing', function() {

    it('should close while label editing is active', inject(
      function(appendCreatePad, directEditing, elementRegistry, selection) {

        // given the pad is open for a selected element
        const task = elementRegistry.get('Task_1');

        selection.select(task);

        expect(appendCreatePad.isOpen()).to.be.true;

        // when direct editing starts
        directEditing.activate(task);

        // then
        expect(appendCreatePad.isOpen()).to.be.false;
      }
    ));


    it('should reopen for the same element when label editing ends', inject(
      function(appendCreatePad, directEditing, elementRegistry, selection) {

        // given direct editing was active for a selected element
        const task = elementRegistry.get('Task_1');

        selection.select(task);

        directEditing.activate(task);

        expect(appendCreatePad.isOpen()).to.be.false;

        // when direct editing ends
        directEditing.cancel();

        // then
        expect(appendCreatePad.isOpen()).to.be.true;
      }
    ));

  });

});