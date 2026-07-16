import { expect } from 'chai';

import {
  insertCoreStyles,
  insertDmnStyles,
  bootstrapModeler,
  inject
} from 'test/DMNTestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import ImprovedContextPad from 'lib/dmn/contextPad';

import diagramXML from 'test/fixtures/simple.dmn';
import inputDataXML from 'test/fixtures/input-data.dmn';

insertCoreStyles();
insertDmnStyles();


describe('<DMNImprovedContextPad>', function() {

  describe('entries', function() {

    beforeEach(bootstrapModeler(diagramXML, {
      drd: {
        additionalModules: [
          ImprovedContextPad
        ]
      }
    }));


    it('entries', inject(function(canvas, elementRegistry, contextPad) {

      // given
      const shape = elementRegistry.get('Decision_1');

      // when
      contextPad.open(shape);

      // then
      const entries = [ ...domQueryAll('.djs-context-pad .entry', canvas.getContainer()) ];

      expect(entries.length).to.equal(8);
      expect(entries.map(entry => entry.getAttribute('data-action'))).to.eql([
        'replace',
        'connect',
        'append.decision',
        'append.knowledge-source',
        'append.business-knowledge-model',
        'append.input-data',
        'append.text-annotation',
        'delete'
      ]);
    }));

  });


  describe('position', function() {

    beforeEach(bootstrapModeler(inputDataXML, {
      drd: {
        additionalModules: [
          ImprovedContextPad
        ]
      }
    }));


    it('should not cover the type dropdown when flipped below', inject(
      function(canvas, elementRegistry, selection, overlays) {

        // given
        const shape = elementRegistry.get('InputData_1');
        const containerBounds = canvas.getContainer().getBoundingClientRect();

        // place the element at the top of the container so the pad flips below
        canvas.viewbox({
          x: shape.x - 10,
          y: shape.y - 2,
          width: containerBounds.width,
          height: containerBounds.height
        });

        // when
        selection.select(shape);

        // then
        return whenScheduled().then(() => {
          const [ dropdown ] = overlays.get({ element: shape, type: 'type-ref-dropdown' });
          const contextPadHtml = domQuery('.djs-context-pad', canvas.getContainer());

          const dropdownBottom = dropdown.html.getBoundingClientRect().bottom;
          const contextPadTop = contextPadHtml.getBoundingClientRect().top;

          expect(contextPadTop).to.be.at.least(dropdownBottom);
        });
      }
    ));

  });

});


// context pad position is updated asynchronously via the scheduler (setTimeout)
function whenScheduled() {
  return new Promise(resolve => setTimeout(resolve, 100));
}
