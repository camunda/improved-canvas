import {
  insertCoreStyles,
  insertBpmnStyles,
  bootstrapModeler,
  inject
} from 'test/TestHelper';


import AttachCreatePad from 'lib/bpmn/attachCreatePad';

import diagramXML from './AttachCreatePad.bpmn';

insertCoreStyles();
insertBpmnStyles();

describe('<AttachCreatePad>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      AttachCreatePad
    ]
  }));


  describe('#canOpen', function() {

    it('should return true if attach allowed', inject(function(attachCreatePad, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      const canOpen = attachCreatePad.canOpen(task);

      // then
      expect(canOpen).to.be.true;
    }));


    it('should return false if attach not allowed', inject(function(attachCreatePad, elementRegistry) {

      // given
      const endEvent = elementRegistry.get('EndEvent_1');

      // when
      const canOpen = attachCreatePad.canOpen(endEvent);

      // then
      expect(canOpen).to.be.false;
    }));


    it('should return false if attach not allowed (event subprocess)', inject(function(attachCreatePad, elementRegistry) {

      // given
      const endEvent = elementRegistry.get('EventSubProcess_1');

      // when
      const canOpen = attachCreatePad.canOpen(endEvent);

      // then
      expect(canOpen).to.be.false;
    }));


    it('should return false if host has attachers', inject(function(attachCreatePad, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_2');

      expect(task.attachers).to.have.length(1);

      // when
      const canOpen = attachCreatePad.canOpen(task);

      // then
      expect(canOpen).to.be.false;
    }));

  });


  describe('#getEntries', function() {

    it('should get append entries (task)', inject(function(attachCreatePad, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      const entries = attachCreatePad.getEntries(task);

      // then
      expect(entries).to.exist;

      expect(Object.keys(entries)).to.eql([
        'bpmn-icon-intermediate-event-none',
        'bpmn-icon-intermediate-event-catch-message',
        'bpmn-icon-intermediate-event-catch-timer',
        'bpmn-icon-intermediate-event-catch-condition',
        'bpmn-icon-intermediate-event-catch-error',
        'append'
      ]);
    }));


    it('should get append entries (subprocess)', inject(function(attachCreatePad, elementRegistry) {

      // given
      const task = elementRegistry.get('SubProcess_1');

      // when
      const entries = attachCreatePad.getEntries(task);

      // then
      expect(entries).to.exist;

      expect(Object.keys(entries)).to.eql([
        'bpmn-icon-intermediate-event-none',
        'bpmn-icon-intermediate-event-catch-message',
        'bpmn-icon-intermediate-event-catch-timer',
        'bpmn-icon-intermediate-event-catch-condition',
        'bpmn-icon-intermediate-event-catch-error',
        'append'
      ]);
    }));

  });


  describe('#getPosition', function() {

    it('should return position for task', inject(function(attachCreatePad, canvas, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      const position = attachCreatePad.getPosition(task);

      // then
      const gfx = canvas.getGraphics(task);

      const targetBounds = gfx.getBoundingClientRect();

      const container = canvas.getContainer();

      const containerBounds = container.getBoundingClientRect();

      expect(position.left).to.be.within(targetBounds.right - containerBounds.left - 50, targetBounds.right - containerBounds.left);
      expect(position.top).to.be.within(targetBounds.bottom - containerBounds.top - 25, targetBounds.bottom - containerBounds.top);
    }));

  });

});