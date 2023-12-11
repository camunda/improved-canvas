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

import ColorPickerModule from 'bpmn-js-color-picker';

import diagramXML from '../../../fixtures/simple.bpmn';
import ImprovedContextPad from 'lib/features/contextPad';
import HorizontalPopupMenu from 'lib/features/popupMenu';

insertCoreStyles();
insertBpmnStyles();

describe('<HorizontalPopupMenu>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      ImprovedContextPad,
      HorizontalPopupMenu,
      ColorPickerModule
    ]
  }));

  describe('should render', function() {

    it('color picker', inject(function(elementRegistry, contextPad) {

      // given
      const shape = elementRegistry.get('StartEvent_1');

      // when
      contextPad.open(shape);
      contextPad.trigger('click', padEvent('set-color'));

      // then
      expect(domQuery('.djs-popup.color-picker')).to.exist;
    }));


    it('align elements', inject(function(elementRegistry, contextPad) {

      // given
      const shape = elementRegistry.get('StartEvent_1');
      const task = elementRegistry.get('Task_1');

      // when
      contextPad.open([ shape, task ]);
      contextPad.trigger('click', padEvent('align-elements'));

      // then
      expect(domQuery('.djs-popup.align-elements')).to.exist;
    }));

  });


  it('should open at the top left of context pad', inject(function(elementRegistry, contextPad) {

    // given
    const shape = elementRegistry.get('StartEvent_1');

    // when
    contextPad.open(shape);
    const contextPadNode = domQuery('.djs-context-pad');
    const contextPadBounds = contextPadNode.getBoundingClientRect();

    contextPad.trigger('click', padEvent('set-color'));

    // then
    const popupNode = domQuery('.djs-popup');
    const popupBounds = popupNode.getBoundingClientRect();

    expect(contextPadBounds.y).to.be.greaterThan(popupBounds.y);
    expect(popupBounds.x).to.equal(contextPadBounds.x);

  }));

});


// helpers //////////
function padEntry(element, name) {
  return domQuery('[data-action="' + name + '"]', element);
}

function padEvent(entry) {

  return getBpmnJS().invoke(function(overlays) {

    var target = padEntry(overlays._overlayRoot, entry);

    return {
      target: target,
      preventDefault: function() {},
      clientX: 100,
      clientY: 100
    };
  });
}