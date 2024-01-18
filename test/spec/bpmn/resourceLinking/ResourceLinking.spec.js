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

import ImprovedContextPad from 'lib/bpmn/contextPad';
import ResourceLinking from 'lib/bpmn/resourceLinking';

import ColorPickerModule from 'bpmn-js-color-picker';

import diagramXML from './ResourceLinking.bpmn';
import { CreateAppendAnythingModule } from 'bpmn-js-create-append-anything';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule
} from 'bpmn-js-properties-panel';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

insertCoreStyles();
insertBpmnStyles();

describe('<ResourceLinking>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      ImprovedContextPad,
      ColorPickerModule,
      CreateAppendAnythingModule,
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      ZeebePropertiesProviderModule,
      ResourceLinking
    ],
    moddleExtensions: {
      zeebe: ZeebeModdle
    },
  }));


  it('should fire "contextPad.linkResource" event', inject(function(elementRegistry, contextPad, eventBus) {

    // given
    const task = elementRegistry.get('UserTask');

    // when
    contextPad.open(task);

    // then
    expect(domQuery('.entry.call-to-action')).to.exist;

    // when
    const listener = sinon.spy();
    eventBus.on('contextPad.linkResource', listener);

    // when
    contextPad.trigger('click', padEvent('link-form'));

    // then
    expect(listener).to.have.been.called;
  }));


  describe('render', function() {

    describe('user task', function() {

      it('without form linked', inject(function(elementRegistry, contextPad) {

        // given
        const task = elementRegistry.get('UserTask');

        // when
        contextPad.open(task);

        // then
        expect(domQuery('.entry.call-to-action.highlighted')).to.exist;

      }));


      it('with form linked', inject(async function(elementRegistry, contextPad) {

        // given
        const task = elementRegistry.get('UserTask_form');

        // when
        contextPad.open(task);

        // then
        expect(domQuery('.entry.call-to-action.highlighted')).to.not.exist;
      }));


      it('should add highlight', inject(function(elementRegistry, contextPad, modeling) {

        // given
        const task = elementRegistry.get('UserTask_form'),
              businessObject = getBusinessObject(task),
              extensionElements = businessObject.get('extensionElements');

        // when
        contextPad.open(task);

        // then
        expect(domQuery('.entry.call-to-action.highlighted')).to.not.exist;

        // when
        modeling.updateModdleProperties(task, extensionElements, { values: [ ] });

        // then
        expect(domQuery('.entry.call-to-action.highlighted')).to.exist;
      }));


      it('should remove highlight', inject(function(elementRegistry, contextPad, modeling, bpmnFactory) {

        // given
        const task = elementRegistry.get('UserTask'),
              businessObject = getBusinessObject(task),
              extensionElements = businessObject.get('extensionElements');

        // when
        contextPad.open(task);

        // then
        expect(domQuery('.entry.call-to-action.highlighted')).to.exist;

        // when
        const form = createElement('zeebe:FormDefinition', { formId: 'form1' }, extensionElements, bpmnFactory);
        modeling.updateModdleProperties(task, extensionElements, {
          values: [ form ]
        });

        // then
        expect(domQuery('.entry.call-to-action.highlighted')).to.not.exist;
      }));

    });


    describe('business rule task', function() {

      it('without decision linked', inject(function(elementRegistry, contextPad) {

        // given
        const task = elementRegistry.get('BusinessRuleTask');

        // when
        contextPad.open(task);

        // then
        expect(domQuery('.entry.call-to-action.highlighted')).to.exist;

      }));


      it('with decision linked', inject(async function(elementRegistry, contextPad) {

        // given
        const task = elementRegistry.get('BusinessRuleTask_decision');

        // when
        contextPad.open(task);

        // then
        expect(domQuery('.entry.call-to-action.highlighted')).to.not.exist;
      }));


      it('should add highlight', inject(function(elementRegistry, contextPad, modeling) {

        // given
        const task = elementRegistry.get('BusinessRuleTask_decision'),
              businessObject = getBusinessObject(task),
              extensionElements = businessObject.get('extensionElements');

        // when
        contextPad.open(task);

        // then
        expect(domQuery('.entry.call-to-action.highlighted')).to.not.exist;

        // when
        modeling.updateModdleProperties(task, extensionElements, { values: [ ] });

        // then
        expect(domQuery('.entry.call-to-action.highlighted')).to.exist;
      }));

    });


    describe('call activity', function() {

      it('without process linked', inject(function(elementRegistry, contextPad) {

        // given
        const task = elementRegistry.get('CallActivity');

        // when
        contextPad.open(task);

        // then
        expect(domQuery('.entry.call-to-action.highlighted')).to.exist;

      }));


      it('with process linked', inject(async function(elementRegistry, contextPad) {

        // given
        const task = elementRegistry.get('CallActivity_process');

        // when
        contextPad.open(task);

        // then
        expect(domQuery('.entry.call-to-action.highlighted')).to.not.exist;
      }));


      it('should add highlight', inject(function(elementRegistry, contextPad, modeling) {

        // given
        const task = elementRegistry.get('CallActivity_process'),
              businessObject = getBusinessObject(task),
              extensionElements = businessObject.get('extensionElements');

        // when
        contextPad.open(task);

        // then
        expect(domQuery('.entry.call-to-action.highlighted')).to.not.exist;

        // when
        modeling.updateModdleProperties(task, extensionElements, { values: [ ] });

        // then
        expect(domQuery('.entry.call-to-action.highlighted')).to.exist;
      }));


      it('should remove highlight', inject(function(elementRegistry, contextPad, modeling, bpmnFactory) {

        // given
        const task = elementRegistry.get('CallActivity'),
              businessObject = getBusinessObject(task),
              extensionElements = businessObject.get('extensionElements');

        // when
        contextPad.open(task);

        // then
        expect(domQuery('.entry.call-to-action.highlighted')).to.exist;

        // when
        const process = createElement('zeebe:CalledElement', { processId: 'process1' }, extensionElements, bpmnFactory);
        modeling.updateModdleProperties(task, extensionElements, { values: [ process ] });

        // then
        expect(domQuery('.entry.call-to-action.highlighted')).to.not.exist;
      }));

    });


    it('should not render', inject(function(elementRegistry, contextPad) {

      // given
      const task = elementRegistry.get('Task');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry.call-to-action')).to.not.exist;
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

function createElement(type, properties, parent, bpmnFactory) {
  const element = bpmnFactory.create(type, properties);

  if (parent) {
    element.$parent = parent;
  }

  return element;
}