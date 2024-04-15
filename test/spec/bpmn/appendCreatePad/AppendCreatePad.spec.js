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
        'append.append-task',
        'append.gateway',
        'append.intermediate-event',
        'append.end-event',
        'append.text-annotation',
        'append'
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
        'append.receive-task',
        'append.message-intermediate-event',
        'append.timer-intermediate-event',
        'append.condition-intermediate-event',
        'append.signal-intermediate-event',
        'append.text-annotation',
        'append'
      ]);
    }));


    it('should get append entries (end event)', inject(function(appendCreatePad, elementRegistry) {

      // given
      const task = elementRegistry.get('EndEvent_1');

      // when
      const entries = appendCreatePad.getEntries(task);

      // then
      expect(entries).to.exist;

      expect(Object.keys(entries)).to.eql([
        'append.text-annotation' // won't be shown since rules don't allow appending
      ]);
    }));

  });


  describe('#getPosition', function() {

    it('should return position for task', inject(function(appendCreatePad, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      const position = appendCreatePad.getPosition(task);

      // then
      expect(position).to.eql({
        left: task.width + 30,
        top: task.height / 2
      });
    }));


    it('should return position for boundary event (right)', inject(function(appendCreatePad, elementRegistry) {

      // given
      const boundaryEvent = elementRegistry.get('BoundaryEvent_1');

      // when
      const position = appendCreatePad.getPosition(boundaryEvent);

      // then
      expect(position).to.eql({
        left: boundaryEvent.width + 30,
        top: boundaryEvent.height / 2
      });
    }));


    it('should return position for boundary event (bottom)', inject(function(appendCreatePad, elementRegistry) {

      // given
      const boundaryEvent = elementRegistry.get('CompensationBoundaryEvent_1');

      // when
      const position = appendCreatePad.getPosition(boundaryEvent);

      // then
      expect(position).to.eql({
        left: boundaryEvent.width / 2,
        top: boundaryEvent.height + 30
      });
    }));

  });

});