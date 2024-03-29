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

import { waitFor } from '@testing-library/preact';

import {
  getBBox
} from 'diagram-js/lib/util/Elements';

import ImprovedContextPad from 'lib/bpmn/contextPad';

import diagramXML from '../../../fixtures/simple.bpmn';

insertCoreStyles();
insertBpmnStyles();

describe('<ImprovedContextPad>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      ImprovedContextPad
    ]
  }));


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

    expect(contextPadCenter).to.closeTo(shapeCenter, 1);
    expect(contextPadBounds.y).to.be.greaterThan(shapeBounds.y);
  }));


  describe('events', function() {

    it('click', inject(function(elementRegistry, contextPad) {

      // given
      const shape = elementRegistry.get('StartEvent_1');
      contextPad.open(shape);
      const entry = domQuery('[data-action="replace"]');

      // when
      entry.click();

      // then
      expect(entry.classList.contains('active')).to.be.true;
    }));


    it('dragstart', inject(function(elementRegistry, contextPad, dragging) {

      // given
      const shape = elementRegistry.get('StartEvent_1');
      contextPad.open(shape);
      const entry = domQuery('[data-action="connect"]');

      // when
      const event = new MouseEvent('dragstart', {
        bubbles: true
      });
      entry.dispatchEvent(event);

      // then
      expect(dragging.context().prefix).to.eql('connect');

    }));

  });


  describe('active entries', function() {

    it('single element', inject(function(elementRegistry, contextPad) {

      // given
      const shape = elementRegistry.get('StartEvent_1');
      contextPad.open(shape);

      // when
      contextPad.trigger('click', padEvent('replace'));

      // then
      const entry = domQuery('[data-action="replace"]');
      expect(entry.classList.contains('active')).to.be.true;
    }));


    it('multiple elements', inject(function(elementRegistry, contextPad) {

      // given
      const shape1 = elementRegistry.get('StartEvent_1');
      const shape2 = elementRegistry.get('Task_1');
      contextPad.open([ shape1, shape2 ]);

      // when
      contextPad.trigger('click', padEvent('align-elements'));

      // then
      const entry = domQuery('[data-action="align-elements"]');
      expect(entry.classList.contains('active')).to.be.true;
    }));

  });


  describe('entry tooltips', function() {

    it('should show tooltip', inject(async function(elementRegistry, contextPad) {

      // given
      const shape = elementRegistry.get('StartEvent_1');

      contextPad.open(shape);

      // when
      const entry = domQuery('.bio-properties-panel-tooltip-wrapper');

      const event = new MouseEvent('mouseenter', {
        bubbles: true
      });

      entry.dispatchEvent(event);

      let tooltip;

      await waitFor(() => {
        tooltip = domQuery('.bio-properties-panel-tooltip', entry);

        // then
        expect(tooltip).to.exist;
      });
    }));

  });


  describe('feedback button', function() {

    it('shoud add feedback button', inject(async function(elementRegistry, contextPad) {

      // given
      const shape = elementRegistry.get('StartEvent_1');

      // when
      contextPad.open(shape);

      // then
      const feedbackButton = domQuery('.feedback-button');

      expect(feedbackButton).to.exist;
    }));


    it('shoud remove feedback button', inject(async function(elementRegistry, contextPad) {

      // given
      const shape = elementRegistry.get('StartEvent_1');

      contextPad.open(shape);

      // when
      contextPad.close();

      const feedbackButton = domQuery('.feedback-button');

      // then
      expect(feedbackButton).not.to.exist;
    }));


    it('shoud fire event on click', inject(async function(contextPad, elementRegistry, eventBus) {

      // given
      const shape = elementRegistry.get('StartEvent_1');

      contextPad.open(shape);

      const feedbackButton = domQuery('.feedback-button');

      const spy = sinon.spy();

      eventBus.on('contextPad.feedback', spy);

      // when
      const event = new MouseEvent('click');

      feedbackButton.dispatchEvent(event);

      // then
      expect(spy).to.have.been.called;
    }));

  });

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
