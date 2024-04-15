import {
  insertCoreStyles,
  insertBpmnStyles,
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import ImprovedContextPadModule from 'lib/bpmn/contextPad';

import ColorPickerModule from 'bpmn-js-color-picker';

import diagramXML from '../../../fixtures/simple.bpmn';

insertCoreStyles();
insertBpmnStyles();

describe('<ImprovedContextPad>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      ImprovedContextPadModule,
      ColorPickerModule
    ]
  }));


  describe('entries', function() {

    it('single element', inject(function(canvas, elementRegistry, contextPad) {

      // given
      const shape = elementRegistry.get('StartEvent_1');

      // when
      contextPad.open(shape);

      // then
      const entries = [ ...domQueryAll('.djs-context-pad .entry', canvas.getContainer()) ];
      expect(entries.length).to.equal(4);
      expect(entries.map(entry => entry.getAttribute('data-action'))).to.eql([
        'replace',
        'set-color',
        'connect',
        'delete'
      ]);
    }));


    it('multiple elements', inject(function(elementRegistry, contextPad) {

      // given
      const shape1 = elementRegistry.get('StartEvent_1');
      const shape2 = elementRegistry.get('Task_1');


      // when
      contextPad.open([ shape1, shape2 ]);

      // then
      const entries = [ ...domQueryAll('.djs-context-pad .entry') ];
      expect(entries.length).to.equal(3);
      expect(entries.map(entry => entry.getAttribute('data-action'))).to.eql([
        'set-color',
        'align-elements',
        'delete'
      ]);
    }));


    it('participants', inject(function(elementRegistry, contextPad) {

      // given
      const shape = elementRegistry.get('Participant_1');

      // when
      contextPad.open(shape);

      // then
      const laneGroup = domQuery('.djs-context-pad .group[data-group="lanes"]');
      expect(laneGroup).to.exist;

      const entries = [ ...domQueryAll('.djs-context-pad .entry', laneGroup) ];
      expect(entries.map(entry => entry.getAttribute('data-action'))).to.eql([
        'lane-insert-above',
        'lane-divide-two',
        'lane-divide-three',
        'lane-insert-below'
      ]);
    }));

  });

});
