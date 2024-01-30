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

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

import ImprovedContextPad from 'lib/bpmn/contextPad';
import ResourceLinking from 'lib/bpmn/resourceLinking';

import diagramXML from './ResourceLinking.bpmn';

insertCoreStyles();
insertBpmnStyles();

describe('<ResourceLinking>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      ImprovedContextPad,
      ResourceLinking
    ],
    moddleExtensions: {
      zeebe: ZeebeModdle
    },
  }));


  let elementsChangedSpy;

  beforeEach(inject(function(eventBus) {
    elementsChangedSpy = sinon.spy();

    eventBus.on('elements.changed', elementsChangedSpy);
  }));


  describe('entry', function() {

    it('should add (user task)', inject(function(elementRegistry, contextPad) {

      // given
      const task = elementRegistry.get('UserTask');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).to.exist;
    }));


    it('should add (business rule task)', inject(function(elementRegistry, contextPad) {

      // given
      const task = elementRegistry.get('BusinessRuleTask');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).to.exist;
    }));


    it('should add (call activity)', inject(function(elementRegistry, contextPad) {

      // given
      const task = elementRegistry.get('CallActivity');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).to.exist;
    }));


    it('should add (start event)', inject(function(elementRegistry, contextPad) {

      // given
      const task = elementRegistry.get('StartEvent');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).to.exist;
    }));


    it('should not add', inject(function(elementRegistry, contextPad) {

      // given
      const task = elementRegistry.get('Task');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
    }));


    describe('user task', function() {

      it('no form linked', inject(function(contextPad, elementRegistry) {

        // given
        const task = elementRegistry.get('UserTask');

        // when
        contextPad.open(task);

        // then
        const entry = domQuery('.entry[data-action="link-resource"]');

        expect(entry).to.exist;
        expect(entry.classList.contains('call-to-action-active')).to.be.true;
      }));


      it('form linked', inject(async function(contextPad, elementRegistry) {

        // given
        const task = elementRegistry.get('UserTask_form');

        // when
        contextPad.open(task);

        // then
        const entry = domQuery('.entry[data-action="link-resource"]');

        expect(entry).to.exist;
        expect(entry.classList.contains('call-to-action-inactive')).to.be.true;
      }));


      describe('update', function() {

        it('should set to active when unlinking form', inject(async function(contextPad, elementRegistry, modeling) {

          // given
          const task = elementRegistry.get('UserTask_form'),
                businessObject = getBusinessObject(task),
                extensionElements = businessObject.get('extensionElements');

          // when
          contextPad.open(task);

          // then
          let entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
          expect(entry.classList.contains('call-to-action-inactive')).to.be.true;

          // when
          modeling.updateModdleProperties(task, extensionElements, {
            values: []
          });

          await waitFor(() => expect(elementsChangedSpy).to.have.been.calledOnce);

          // then
          entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
          expect(entry.classList.contains('call-to-action-active')).to.be.true;
        }));


        it('should set to inactive when linking form', inject(async function(bpmnFactory, contextPad, elementRegistry, modeling) {

          // given
          const task = elementRegistry.get('UserTask'),
                businessObject = getBusinessObject(task),
                extensionElements = businessObject.get('extensionElements');

          // when
          contextPad.open(task);

          // then
          let entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
          expect(entry.classList.contains('call-to-action-active')).to.be.true;

          // when
          const form = createElement('zeebe:FormDefinition', {
            formId: 'FormDefinition_1'
          }, extensionElements, bpmnFactory);

          modeling.updateModdleProperties(task, extensionElements, {
            values: [ form ]
          });

          await waitFor(() => expect(elementsChangedSpy).to.have.been.calledOnce);

          // then
          entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
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
        const entry = domQuery('.entry[data-action="link-resource"]');

        expect(entry).to.exist;
        expect(entry.classList.contains('call-to-action-active')).to.be.true;
      }));


      it('decision linked', inject(async function(contextPad, elementRegistry) {

        // given
        const task = elementRegistry.get('BusinessRuleTask_decision');

        // when
        contextPad.open(task);

        // then
        const entry = domQuery('.entry[data-action="link-resource"]');

        expect(entry).to.exist;
        expect(entry.classList.contains('call-to-action-inactive')).to.be.true;
      }));


      describe('update', function() {

        it('should set to active when unlinking decision', inject(async function(contextPad, elementRegistry, modeling) {

          // given
          const task = elementRegistry.get('BusinessRuleTask_decision'),
                businessObject = getBusinessObject(task),
                extensionElements = businessObject.get('extensionElements');

          // when
          contextPad.open(task);

          // then
          let entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
          expect(entry.classList.contains('call-to-action-inactive')).to.be.true;

          // when
          modeling.updateModdleProperties(task, extensionElements, {
            values: []
          });

          await waitFor(() => expect(elementsChangedSpy).to.have.been.calledOnce);

          // then
          entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
          expect(entry.classList.contains('call-to-action-active')).to.be.true;
        }));


        it('should set to inactive when linking decision', inject(async function(bpmnFactory, contextPad, elementRegistry, modeling) {

          // given
          const task = elementRegistry.get('BusinessRuleTask'),
                businessObject = getBusinessObject(task),
                extensionElements = businessObject.get('extensionElements');

          // when
          contextPad.open(task);

          // then
          let entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
          expect(entry.classList.contains('call-to-action-active')).to.be.true;

          // when
          const decision = createElement('zeebe:CalledDecision', {
            decisionId: 'Decision_1'
          }, extensionElements, bpmnFactory);

          modeling.updateModdleProperties(task, extensionElements, {
            values: [ decision ]
          });

          await waitFor(() => expect(elementsChangedSpy).to.have.been.calledOnce);

          // then
          entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
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
        const entry = domQuery('.entry[data-action="link-resource"]');

        expect(entry).to.exist;
        expect(entry.classList.contains('call-to-action-active')).to.be.true;
      }));


      it('process linked', inject(async function(contextPad, elementRegistry) {

        // given
        const task = elementRegistry.get('CallActivity_process');

        // when
        contextPad.open(task);

        // then
        const entry = domQuery('.entry[data-action="link-resource"]');

        expect(entry).to.exist;
        expect(entry.classList.contains('call-to-action-inactive')).to.be.true;
      }));


      describe('update', function() {

        it('should set to active when unlinking process', inject(async function(contextPad, elementRegistry, modeling) {

          // given
          const task = elementRegistry.get('CallActivity_process'),
                businessObject = getBusinessObject(task),
                extensionElements = businessObject.get('extensionElements');

          // when
          contextPad.open(task);

          // then
          let entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
          expect(entry.classList.contains('call-to-action-inactive')).to.be.true;

          // when
          modeling.updateModdleProperties(task, extensionElements, {
            values: []
          });

          await waitFor(() => expect(elementsChangedSpy).to.have.been.calledOnce);

          // then
          entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
          expect(entry.classList.contains('call-to-action-active')).to.be.true;
        }));


        it('should set to inactive when linking process', inject(async function(bpmnFactory, contextPad, elementRegistry, modeling) {

          // given
          const task = elementRegistry.get('CallActivity'),
                businessObject = getBusinessObject(task),
                extensionElements = businessObject.get('extensionElements');

          // when
          contextPad.open(task);

          // then
          let entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
          expect(entry.classList.contains('call-to-action-active')).to.be.true;

          // when
          const process = createElement('zeebe:CalledElement', {
            processId: 'Process_1'
          }, extensionElements, bpmnFactory);

          modeling.updateModdleProperties(task, extensionElements, {
            values: [ process ]
          });

          await waitFor(() => expect(elementsChangedSpy).to.have.been.calledOnce);

          // then
          entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
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

      const event = mockContextPadEvent('link-resource');

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


describe('<ResourceLinking> (configuration)', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      ImprovedContextPad,
      ResourceLinking
    ],
    resourceLinking: {
      noneStartEvent: false
    }
  }));


  it('should not support none start events', inject(function(elementRegistry, contextPad) {

    // given
    const startEvent = elementRegistry.get('StartEvent');

    // when
    contextPad.open(startEvent);

    // then
    expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
  }));

});


// helpers //////////
function queryContextPadEntry(action, contextPadHtml) {
  return domQuery(`[data-action="${ action }"]`, contextPadHtml);
}

function mockContextPadEvent(entry) {
  return getBpmnJS().invoke(function(contextPad) {
    const target = queryContextPadEntry(entry, contextPad.getPad().html);

    return {
      target: target,
      preventDefault: () => {},
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