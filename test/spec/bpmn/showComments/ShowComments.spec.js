import {
  insertCoreStyles,
  insertBpmnStyles,
  bootstrapModeler,
  inject,
  getBpmnJS
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import { omit } from 'min-dash';

import ImprovedContextPad from 'lib/bpmn/contextPad';
import ShowComments from 'lib/bpmn/showComments';

import diagramXML from '../../../fixtures/simple.bpmn';

insertCoreStyles();
insertBpmnStyles();

describe('<ShowComments>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      ImprovedContextPad,
      ShowComments
    ]
  }));


  describe('entry', function() {

    it('should add', inject(function(elementRegistry, contextPad) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      // when
      contextPad.open(startEvent);

      // then
      expect(domQuery('.entry[data-action="show-comments"]')).to.exist;
    }));


    it('should not add to labels', inject(function(elementRegistry, contextPad) {

      // given
      const label = elementRegistry.get('StartEvent_1_label');

      // when
      contextPad.open(label);

      // then
      expect(domQuery('.entry[data-action="show-comments"]')).not.to.exist;
    }));


    it('should not move delete entry if not found', inject(function(elementRegistry, contextPad, eventBus) {

      // given
      contextPad.registerProvider(200, {
        getContextPadEntries() {
          return (entries) => {
            return omit(entries, [ 'delete' ]);
          };
        }
      });

      const startEvent = elementRegistry.get('StartEvent_1');

      // when
      contextPad.open(startEvent);

      // then
      expect(domQuery('.entry[data-action="show-comments"]')).to.exist;
      expect(domQuery('.entry[data-action="delete"]')).not.to.exist;
    }));

  });


  describe('events', function() {

    it('should fire "contextPad.showComments" event', inject(function(elementRegistry, contextPad, eventBus) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      contextPad.open(startEvent);

      const spy = sinon.spy();

      eventBus.on('contextPad.showComments', spy);

      const event = mockContextPadEvent('show-comments');

      // when
      contextPad.trigger('click', event);

      // then
      expect(spy).to.have.been.calledWithMatch({
        element: startEvent,
        originalEvent: event
      });
    }));

  });

});


// helpers //////////
function queryContextPadEntry(action, contextPadHtml) {
  return domQuery(`[data-action="${ action }"]`, contextPadHtml);
}

function mockContextPadEvent(entry) {
  return getBpmnJS().invoke(function(canvas) {
    const target = queryContextPadEntry(entry, canvas.getContainer());

    return {
      target: target,
      preventDefault: () => {},
      clientX: 100,
      clientY: 100
    };
  });
}