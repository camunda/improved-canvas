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
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      ColorPickerModule,
      CreateAppendAnythingModule,
      ImprovedContextPad,
      ZeebePropertiesProviderModule,
      ResourceLinking
    ],
    moddleExtensions: {
      zeebe: ZeebeModdle
    },
  }));


  describe('entry', function() {

    it('should add', inject(function(elementRegistry, contextPad) {

      // given
      const task = elementRegistry.get('UserTask');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry.call-to-action')).to.exist;
    }));


    it('should not add', inject(function(elementRegistry, contextPad) {

      // given
      const task = elementRegistry.get('Task');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry.call-to-action')).not.to.exist;
    }));


    describe('user task', function() {

      it('no form linked', inject(function(contextPad, elementRegistry) {

        // given
        const task = elementRegistry.get('UserTask');

        // when
        contextPad.open(task);

        // then
        const entry = domQuery('.entry.call-to-action');

        expect(entry).to.exist;
        expect(entry.classList.contains('call-to-action-active')).to.be.true;
      }));


      it('form linked', inject(async function(contextPad, elementRegistry) {

        // given
        const task = elementRegistry.get('UserTask_form');

        // when
        contextPad.open(task);

        // then
        const entry = domQuery('.entry.call-to-action');

        expect(entry).to.exist;
        expect(entry.classList.contains('call-to-action-inactive')).to.be.true;
      }));


      describe('update', function() {

        it('should set to active when unlinking form', inject(function(contextPad, elementRegistry, modeling) {

          // given
          const task = elementRegistry.get('UserTask_form'),
                businessObject = getBusinessObject(task),
                extensionElements = businessObject.get('extensionElements');

          // when
          contextPad.open(task);

          // then
          const entry = domQuery('.entry.call-to-action');

          expect(entry).to.exist;
          expect(entry.classList.contains('call-to-action-inactive')).to.be.true;

          // when
          modeling.updateModdleProperties(task, extensionElements, {
            values: []
          });

          // then
          expect(entry.classList.contains('call-to-action-active')).to.be.true;
        }));


        it('should set to inactive when linking form', inject(function(bpmnFactory, contextPad, elementRegistry, modeling) {

          // given
          const task = elementRegistry.get('UserTask'),
                businessObject = getBusinessObject(task),
                extensionElements = businessObject.get('extensionElements');

          // when
          contextPad.open(task);

          // then
          const entry = domQuery('.entry.call-to-action');

          expect(entry).to.exist;
          expect(entry.classList.contains('call-to-action-active')).to.be.true;

          // when
          const form = createElement('zeebe:FormDefinition', {
            formId: 'FormDefinition_1'
          }, extensionElements, bpmnFactory);

          modeling.updateModdleProperties(task, extensionElements, {
            values: [ form ]
          });

          // then
          expect(entry.classList.contains('call-to-action-inactive')).to.be.true;
        }));

      });

    });


    describe('business rule task', function() {

      it('no decision linked', inject(function(contextPad, elementRegistry) {

        // given
        const task = elementRegistry.get('BusinessRuleTask');

        // when
        contextPad.open(task);

        // then
        const entry = domQuery('.entry.call-to-action');

        expect(entry).to.exist;
        expect(entry.classList.contains('call-to-action-active')).to.be.true;
      }));


      it('decision linked', inject(async function(contextPad, elementRegistry) {

        // given
        const task = elementRegistry.get('BusinessRuleTask_decision');

        // when
        contextPad.open(task);

        // then
        const entry = domQuery('.entry.call-to-action');

        expect(entry).to.exist;
        expect(entry.classList.contains('call-to-action-inactive')).to.be.true;
      }));


      describe('update', function() {

        it('should set to active when unlinking decision', inject(function(contextPad, elementRegistry, modeling) {

          // given
          const task = elementRegistry.get('BusinessRuleTask_decision'),
                businessObject = getBusinessObject(task),
                extensionElements = businessObject.get('extensionElements');

          // when
          contextPad.open(task);

          // then
          const entry = domQuery('.entry.call-to-action');

          expect(entry).to.exist;
          expect(entry.classList.contains('call-to-action-inactive')).to.be.true;

          // when
          modeling.updateModdleProperties(task, extensionElements, {
            values: []
          });

          // then
          expect(entry.classList.contains('call-to-action-active')).to.be.true;
        }));


        it('should set to inactive when linking decision', inject(function(bpmnFactory, contextPad, elementRegistry, modeling) {

          // given
          const task = elementRegistry.get('BusinessRuleTask'),
                businessObject = getBusinessObject(task),
                extensionElements = businessObject.get('extensionElements');

          // when
          contextPad.open(task);

          // then
          const entry = domQuery('.entry.call-to-action');

          expect(entry).to.exist;
          expect(entry.classList.contains('call-to-action-active')).to.be.true;

          // when
          const decision = createElement('zeebe:CalledDecision', {
            decisionId: 'Decision_1'
          }, extensionElements, bpmnFactory);

          modeling.updateModdleProperties(task, extensionElements, {
            values: [ decision ]
          });

          // then
          expect(entry.classList.contains('call-to-action-inactive')).to.be.true;
        }));

      });

    });


    describe('call activity', function() {

      it('no process linked', inject(function(contextPad, elementRegistry) {

        // given
        const task = elementRegistry.get('CallActivity');

        // when
        contextPad.open(task);

        // then
        const entry = domQuery('.entry.call-to-action');

        expect(entry).to.exist;
        expect(entry.classList.contains('call-to-action-active')).to.be.true;
      }));


      it('process linked', inject(async function(contextPad, elementRegistry) {

        // given
        const task = elementRegistry.get('CallActivity_process');

        // when
        contextPad.open(task);

        // then
        const entry = domQuery('.entry.call-to-action');

        expect(entry).to.exist;
        expect(entry.classList.contains('call-to-action-inactive')).to.be.true;
      }));


      describe('update', function() {

        it('should set to active', inject(function(contextPad, elementRegistry, modeling) {

          // given
          const task = elementRegistry.get('CallActivity_process'),
                businessObject = getBusinessObject(task),
                extensionElements = businessObject.get('extensionElements');

          // when
          contextPad.open(task);

          // then
          const entry = domQuery('.entry.call-to-action');

          expect(entry).to.exist;
          expect(entry.classList.contains('call-to-action-inactive')).to.be.true;

          // when
          modeling.updateModdleProperties(task, extensionElements, {
            values: []
          });

          // then
          expect(entry.classList.contains('call-to-action-active')).to.be.true;
        }));


        it('should set to inactive', inject(function(bpmnFactory, contextPad, elementRegistry, modeling) {

          // given
          const task = elementRegistry.get('CallActivity'),
                businessObject = getBusinessObject(task),
                extensionElements = businessObject.get('extensionElements');

          // when
          contextPad.open(task);

          // then
          const entry = domQuery('.entry.call-to-action');

          expect(entry).to.exist;
          expect(entry.classList.contains('call-to-action-active')).to.be.true;

          // when
          const process = createElement('zeebe:CalledElement', {
            processId: 'Process_1'
          }, extensionElements, bpmnFactory);

          modeling.updateModdleProperties(task, extensionElements, {
            values: [ process ]
          });

          // then
          expect(entry.classList.contains('call-to-action-inactive')).to.be.true;
        }));

      });

    });

  });


  describe('events', function() {

    it('should fire "contextPad.linkResource" event', inject(function(elementRegistry, contextPad, eventBus) {

      // given
      const task = elementRegistry.get('UserTask');

      contextPad.open(task);

      const spy = sinon.spy();

      eventBus.on('contextPad.linkResource', spy);

      const event = padEvent('link-form');

      // when
      contextPad.trigger('click', event);

      // then
      expect(spy).to.have.been.calledWithMatch({
        element: task,
        originalEvent: event
      });
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