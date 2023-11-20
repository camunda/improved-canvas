import {
  insertCoreStyles,
  insertBpmnStyles,
  bootstrapModeler,
  inject,
  getBpmnJS
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  getBBox
} from 'diagram-js/lib/util/Elements';

import ImprovedContextPad from 'lib/features/contextPad';

import ColorPickerModule from 'bpmn-js-color-picker';

import diagramXML from '../../fixtures/simple.bpmn';

insertCoreStyles();
insertBpmnStyles();

describe('<Example>', function() {

  function bootstrap(diagramXML) {

    return function() {
      return bootstrapModeler(diagramXML, {
        additionalModules: [
          ImprovedContextPad,
          ColorPickerModule
        ]
      })();
    };
  }

  beforeEach(bootstrap(diagramXML));

  it('should render context pad', inject(function(elementRegistry, contextPad) {

    // given
    const shape = elementRegistry.get('StartEvent_1');

    // when
    contextPad.open(shape);

    // then
    expect(domQuery('.djs-context-pad')).to.exist;
  }));


  it('should open at the top of element', inject(function(elementRegistry, contextPad) {

    // given
    const shape = elementRegistry.get('StartEvent_1');
    const shapeBounds = getBBox(shape);
    const shapeCenter = shapeBounds.x + shapeBounds.width / 2;

    // when
    contextPad.open(shape);

    // then
    const contextPadNode = domQuery('.djs-context-pad');
    const contextPadBounds = contextPadNode.getBoundingClientRect();

    const contextPadCenter = contextPadBounds.x + contextPadBounds.width / 2;

    expect(contextPadCenter).to.equal(shapeCenter);
    expect(contextPadBounds.y).to.be.greaterThan(shapeBounds.y);
  }));


  it('should add separator between groups', inject(function(elementRegistry, contextPad) {

    // given
    const shape = elementRegistry.get('StartEvent_1');

    // when
    contextPad.open(shape);

    // then
    const separators = domQueryAll('.djs-context-pad .separator');

    expect(separators.length).to.equal(2);
  }));


  describe('entries', function() {

    it('single element', inject(function(elementRegistry, contextPad) {

      // given
      const shape = elementRegistry.get('StartEvent_1');

      // when
      contextPad.open(shape);

      // then
      const entries = [ ...domQueryAll('.djs-context-pad .entry') ];
      expect(entries.length).to.equal(5);
      expect(entries.map(entry => entry.getAttribute('data-action'))).to.eql([
        'replace',
        'set-color',
        'append.text-annotation',
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

  });


  it('active entries', inject(function(elementRegistry, contextPad) {

    // given
    const shape = elementRegistry.get('StartEvent_1');
    contextPad.open(shape);

    // when
    contextPad.trigger('click', padEvent('replace'));

    // then
    const entry = domQuery('[data-action="replace"]');
    expect(entry.classList.contains('active')).to.be.true;
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