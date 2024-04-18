import {
  insertCoreStyles,
  insertBpmnStyles,
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import ImprovedContextPadModule from 'lib/bpmn/contextPad';

import diagramXML from '../../../fixtures/simple.bpmn';

insertCoreStyles();
insertBpmnStyles();

describe('<FeedbackButton>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      ImprovedContextPadModule
    ]
  }));


  it('shape', inject(function(canvas, elementRegistry, contextPad) {

    // given
    const shape = elementRegistry.get('StartEvent_1');

    // when
    contextPad.open(shape);

    // then
    const feedbackButton = domQuery('.djs-context-pad .entry', canvas.getContainer());

    expect(feedbackButton).to.exist;
  }));


  it('label', inject(function(canvas, elementRegistry, contextPad) {

    // given
    const shape = elementRegistry.get('StartEvent_1_label');

    // when
    contextPad.open(shape);

    // then
    const feedbackButton = domQuery('.djs-context-pad .entry', canvas.getContainer());

    expect(feedbackButton).not.to.exist;
  }));

});