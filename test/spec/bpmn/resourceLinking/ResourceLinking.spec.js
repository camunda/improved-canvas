import { expect } from 'chai';
import { spy } from 'sinon';

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
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import CustomRulesModule from 'bpmn-js/test/util/custom-rules';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

import ImprovedContextPad from 'lib/bpmn/contextPad';
import { CloudElementTemplatesCoreModule } from 'bpmn-js-element-templates';

import ResourceLinking from 'lib/bpmn/resourceLinking';

import diagramXML from './ResourceLinking.bpmn';
import diagramCollaborationOneExecutableXML from './ResourceLinkingCollaboration-one-executable.bpmn';
import diagramCollaborationManyExecutableXML from './ResourceLinkingCollaboration-many-executable.bpmn';

insertCoreStyles();
insertBpmnStyles();


describe('<ResourceLinking>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      ImprovedContextPad,
      ResourceLinking,
      CustomRulesModule
    ],
    moddleExtensions: {
      zeebe: ZeebeModdle
    },
  }));


  let elementsChangedSpy;

  beforeEach(inject(function(eventBus) {
    elementsChangedSpy = spy();

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


    it('should not add (task)', inject(function(elementRegistry, contextPad) {

      // given
      const task = elementRegistry.get('Task');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
    }));


    it('should not add (start event label)', inject(function(elementRegistry, contextPad) {

      // given
      const label = elementRegistry.get('StartEvent_label');

      // when
      contextPad.open(label);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
    }));


    describe('user task', function() {

      it('no form embedded or linked', inject(function(contextPad, elementRegistry) {

        // given
        const task = elementRegistry.get('UserTask');

        // when
        contextPad.open(task);

        // then
        const entry = domQuery('.entry[data-action="link-resource"]');

        expect(entry).to.exist;
        expect(entry.classList.contains('resource-linking-no-resource')).to.be.true;
      }));


      it('form embedded', inject(async function(contextPad, elementRegistry) {

        // given
        const task = elementRegistry.get('UserTask_embeddedForm');

        // when
        contextPad.open(task);

        // then
        const entry = domQuery('.entry[data-action="link-resource"]');

        expect(entry).to.exist;
        expect(entry.classList.contains('resource-linking-no-resource')).to.be.false;
      }));


      it('form linked', inject(async function(contextPad, elementRegistry) {

        // given
        const task = elementRegistry.get('UserTask_linkedForm');

        // when
        contextPad.open(task);

        // then
        const entry = domQuery('.entry[data-action="link-resource"]');

        expect(entry).to.exist;
        expect(entry.classList.contains('resource-linking-no-resource')).to.be.false;
      }));


      describe('update', function() {

        it('should set to active when removing embedded form', inject(async function(contextPad, elementRegistry, modeling) {

          // given
          const task = elementRegistry.get('UserTask_embeddedForm'),
                businessObject = getBusinessObject(task),
                extensionElements = businessObject.get('extensionElements');

          // when
          contextPad.open(task);

          // then
          let entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
          expect(entry.classList.contains('resource-linking-no-resource')).to.be.false;

          // when
          modeling.updateModdleProperties(task, extensionElements, {
            values: []
          });

          await waitFor(() => expect(elementsChangedSpy).to.have.been.calledOnce);

          // then
          entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
          expect(entry.classList.contains('resource-linking-no-resource')).to.be.true;
        }));


        it('should set to inactive when embedding form', inject(async function(bpmnFactory, contextPad, elementRegistry, modeling) {

          // given
          const task = elementRegistry.get('UserTask'),
                businessObject = getBusinessObject(task),
                extensionElements = businessObject.get('extensionElements');

          // when
          contextPad.open(task);

          // then
          let entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
          expect(entry.classList.contains('resource-linking-no-resource')).to.be.true;

          // when
          const form = createElement('zeebe:FormDefinition', {
            formKey: 'foobar'
          }, extensionElements, bpmnFactory);

          modeling.updateModdleProperties(task, extensionElements, {
            values: [ form ]
          });

          await waitFor(() => expect(elementsChangedSpy).to.have.been.calledOnce);

          // then
          entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
          expect(entry.classList.contains('resource-linking-no-resource')).to.be.false;
        }));


        it('should set to active when unlinking form', inject(async function(contextPad, elementRegistry, modeling) {

          // given
          const task = elementRegistry.get('UserTask_linkedForm'),
                businessObject = getBusinessObject(task),
                extensionElements = businessObject.get('extensionElements');

          // when
          contextPad.open(task);

          // then
          let entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
          expect(entry.classList.contains('resource-linking-no-resource')).to.be.false;

          // when
          modeling.updateModdleProperties(task, extensionElements, {
            values: []
          });

          await waitFor(() => expect(elementsChangedSpy).to.have.been.calledOnce);

          // then
          entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
          expect(entry.classList.contains('resource-linking-no-resource')).to.be.true;
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
          expect(entry.classList.contains('resource-linking-no-resource')).to.be.true;

          // when
          const form = createElement('zeebe:FormDefinition', {
            formId: 'Form_1'
          }, extensionElements, bpmnFactory);

          modeling.updateModdleProperties(task, extensionElements, {
            values: [ form ]
          });

          await waitFor(() => expect(elementsChangedSpy).to.have.been.calledOnce);

          // then
          entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
          expect(entry.classList.contains('resource-linking-no-resource')).to.be.false;
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
        expect(entry.classList.contains('resource-linking-no-resource')).to.be.true;
      }));


      it('decision linked', inject(async function(contextPad, elementRegistry) {

        // given
        const task = elementRegistry.get('BusinessRuleTask_decision');

        // when
        contextPad.open(task);

        // then
        const entry = domQuery('.entry[data-action="link-resource"]');

        expect(entry).to.exist;
        expect(entry.classList.contains('resource-linking-no-resource')).to.be.false;
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
          expect(entry.classList.contains('resource-linking-no-resource')).to.be.false;

          // when
          modeling.updateModdleProperties(task, extensionElements, {
            values: []
          });

          await waitFor(() => expect(elementsChangedSpy).to.have.been.calledOnce);

          // then
          entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
          expect(entry.classList.contains('resource-linking-no-resource')).to.be.true;
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
          expect(entry.classList.contains('resource-linking-no-resource')).to.be.true;

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
          expect(entry.classList.contains('resource-linking-no-resource')).to.be.false;
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
        expect(entry.classList.contains('resource-linking-no-resource')).to.be.true;
      }));


      it('process linked', inject(async function(contextPad, elementRegistry) {

        // given
        const task = elementRegistry.get('CallActivity_process');

        // when
        contextPad.open(task);

        // then
        const entry = domQuery('.entry[data-action="link-resource"]');

        expect(entry).to.exist;
        expect(entry.classList.contains('resource-linking-no-resource')).to.be.false;
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
          expect(entry.classList.contains('resource-linking-no-resource')).to.be.false;

          // when
          modeling.updateModdleProperties(task, extensionElements, {
            values: []
          });

          await waitFor(() => expect(elementsChangedSpy).to.have.been.calledOnce);

          // then
          entry = domQuery('.entry[data-action="link-resource"]');

          expect(entry).to.exist;
          expect(entry.classList.contains('resource-linking-no-resource')).to.be.true;
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
          expect(entry.classList.contains('resource-linking-no-resource')).to.be.true;

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
          expect(entry.classList.contains('resource-linking-no-resource')).to.be.false;
        }));

      });

    });

  });


  describe('events', function() {

    it('should fire "contextPad.linkResource" event', inject(function(elementRegistry, contextPad, eventBus) {

      // given
      const task = elementRegistry.get('UserTask');

      contextPad.open(task);

      const linkSpy = spy();

      eventBus.on('contextPad.linkResource', linkSpy);

      const event = mockContextPadEvent('link-resource');

      // when
      contextPad.trigger('click', event);

      // then
      expect(linkSpy).to.have.been.calledWithMatch({
        element: task,
        originalEvent: event
      });
    }));

  });


  describe('rules', function() {

    it('should allow by default', inject(function(elementRegistry, contextPad) {

      // given
      const task = elementRegistry.get('UserTask');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).to.exist;
    }));


    it('should disallow', inject(function(elementRegistry, contextPad, customRules) {

      // given
      customRules.addRule('resourceLinking.linkResource', 2000, ({ element }) => {
        return !is(element, 'bpmn:UserTask');
      });

      const task = elementRegistry.get('UserTask');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
    }));


    it('should disallow if element template found', inject(function(elementRegistry, contextPad, modeling) {

      // given
      const task = elementRegistry.get('UserTask');

      modeling.updateProperties(task, {
        'zeebe:modelerTemplate': 'foo'
      });

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
    }));


    it('should disallow if none start event in subprocess', inject(function(elementRegistry, contextPad, modeling) {

      // given
      const startEvent = elementRegistry.get('SubprocessStartEvent');

      // when
      contextPad.open(startEvent);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
    }));


    it('should disallow if none start event in event subprocess', inject(function(elementRegistry, contextPad, modeling) {

      // given
      const startEvent = elementRegistry.get('EventSubprocessStartEvent');

      // when
      contextPad.open(startEvent);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
    }));


    describe('process', function() {

      it('should allow if none start event in process', inject(function(elementRegistry, contextPad, modeling) {

        // given
        const startEvent = elementRegistry.get('StartEvent');

        // when
        contextPad.open(startEvent);

        // then
        expect(domQuery('.entry[data-action="link-resource"]')).to.exist;
      }));

    });


    describe('collaboration - one executable', function() {

      beforeEach(bootstrapModeler(diagramCollaborationOneExecutableXML, {
        additionalModules: [
          ImprovedContextPad,
          ResourceLinking,
          CustomRulesModule
        ],
        moddleExtensions: {
          zeebe: ZeebeModdle
        },
      }));


      it('should allow if none start event in participant with executable process', inject(function(elementRegistry, contextPad) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1');

        // when
        contextPad.open(startEvent);

        // then
        expect(domQuery('.entry[data-action="link-resource"]')).to.exist;
      }));


      it('should not allow if none start event in participant without executable process', inject(function(elementRegistry, contextPad) {

        // given
        const startEvent = elementRegistry.get('StartEvent_2');

        // when
        contextPad.open(startEvent);

        // then
        expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
      }));

    });


    describe('collaboration - many executable', function() {

      beforeEach(bootstrapModeler(diagramCollaborationManyExecutableXML, {
        additionalModules: [
          ImprovedContextPad,
          ResourceLinking,
          CustomRulesModule
        ],
        moddleExtensions: {
          zeebe: ZeebeModdle
        },
      }));


      it('should not allow', inject(function(elementRegistry, contextPad) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1');

        // when
        contextPad.open(startEvent);

        // then
        expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
      }));

    });

  });

});


describe('<ResourceLinking> (configuration)', function() {

  describe('enabled', function() {

    beforeEach(bootstrapModeler(diagramXML, {
      additionalModules: [
        ImprovedContextPad,
        ResourceLinking
      ],
      resourceLinking: false
    }));


    it('should not be enabled', inject(function(elementRegistry, contextPad) {

      // given
      const userTask = elementRegistry.get('UserTask');

      // when
      contextPad.open(userTask);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
    }));

  });


  describe('none start events', function() {

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

});



describe('<ResourceLinking> (element templates)', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      ImprovedContextPad,
      ResourceLinking,
      CloudElementTemplatesCoreModule
    ],
    moddleExtensions: {
      zeebe: ZeebeModdle
    },
    elementTemplates: [
      template('unrelated', 'bpmn:UserTask', [ nameProperty() ]),
      userTaskTemplate('form-editable', [
        { type: 'String', binding: { type: 'zeebe:formDefinition', property: 'formId' } }
      ]),
      userTaskTemplate('form-hidden', [
        { type: 'Hidden', value: 'theForm', binding: { type: 'zeebe:formDefinition', property: 'formId' } }
      ]),
      userTaskTemplate('form-read-only', [
        { type: 'String', editable: false, binding: { type: 'zeebe:formDefinition', property: 'formId' } }
      ]),
      template('process-unrelated', 'bpmn:CallActivity', [ nameProperty() ]),
      template('process-hidden', 'bpmn:CallActivity', [
        { type: 'Hidden', value: 'theProcess', binding: { type: 'zeebe:calledElement', property: 'processId' } }
      ]),
      template('decision-unrelated', 'bpmn:BusinessRuleTask', [ nameProperty() ]),
      template('decision-task-header', 'bpmn:BusinessRuleTask', [
        { type: 'Hidden', value: 'theValue', binding: { type: 'zeebe:taskHeader', key: 'myHeader' } }
      ]),
      template('decision-job-worker-retries', 'bpmn:BusinessRuleTask', [
        { type: 'Hidden', value: '3', binding: { type: 'zeebe:taskDefinition', property: 'retries' } }
      ]),
      template('decision-job-worker-editable', 'bpmn:BusinessRuleTask', [
        { label: 'Job type', type: 'String', binding: { type: 'zeebe:taskDefinition', property: 'type' } }
      ]),
      template('decision-job-worker', 'bpmn:BusinessRuleTask', [
        { type: 'Hidden', value: 'myWorker', binding: { type: 'zeebe:taskDefinition', property: 'type' } }
      ]),
      template('decision-job-worker-legacy', 'bpmn:BusinessRuleTask', [
        { type: 'Hidden', value: 'myWorker', binding: { type: 'zeebe:taskDefinition:type' } }
      ]),
      template('decision-hidden', 'bpmn:BusinessRuleTask', [
        { type: 'Hidden', value: 'theDecision', binding: { type: 'zeebe:calledDecision', property: 'decisionId' } },
        { type: 'String', binding: { type: 'zeebe:calledDecision', property: 'resultVariable' } }
      ])
    ]
  }));


  describe('user task', function() {

    it('should allow if template does not configure the form', inject(function(elementRegistry, contextPad, modeling) {

      // given
      const task = elementRegistry.get('UserTask');

      applyTemplate(modeling, task, 'unrelated');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).to.exist;
    }));


    it('should allow if template leaves the form editable', inject(function(elementRegistry, contextPad, modeling) {

      // given
      const task = elementRegistry.get('UserTask');

      applyTemplate(modeling, task, 'form-editable');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).to.exist;
    }));


    it('should disallow if template hides the form', inject(function(elementRegistry, contextPad, modeling) {

      // given
      const task = elementRegistry.get('UserTask');

      applyTemplate(modeling, task, 'form-hidden');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
    }));


    it('should disallow if template marks the form read-only', inject(function(elementRegistry, contextPad, modeling) {

      // given
      const task = elementRegistry.get('UserTask');

      applyTemplate(modeling, task, 'form-read-only');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
    }));

  });


  describe('call activity', function() {

    it('should allow if template does not configure the process', inject(function(elementRegistry, contextPad, modeling) {

      // given
      const callActivity = elementRegistry.get('CallActivity');

      applyTemplate(modeling, callActivity, 'process-unrelated');

      // when
      contextPad.open(callActivity);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).to.exist;
    }));


    it('should disallow if template hides the process', inject(function(elementRegistry, contextPad, modeling) {

      // given
      const callActivity = elementRegistry.get('CallActivity');

      applyTemplate(modeling, callActivity, 'process-hidden');

      // when
      contextPad.open(callActivity);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
    }));

  });


  describe('business rule task', function() {

    it('should allow if template does not configure the decision', inject(function(elementRegistry, contextPad, modeling) {

      // given
      const task = elementRegistry.get('BusinessRuleTask');

      applyTemplate(modeling, task, 'decision-unrelated');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).to.exist;
    }));


    it('should disallow if template hides the decision', inject(function(elementRegistry, contextPad, modeling) {

      // given
      const task = elementRegistry.get('BusinessRuleTask');

      applyTemplate(modeling, task, 'decision-hidden');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
    }));


    it('should disallow if template fixes a job worker implementation', inject(function(elementRegistry, contextPad, modeling) {

      // given
      const task = elementRegistry.get('BusinessRuleTask');

      applyTemplate(modeling, task, 'decision-job-worker');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
    }));


    it('should disallow if template fixes a job worker implementation (legacy binding)', inject(function(elementRegistry, contextPad, modeling) {

      // given
      const task = elementRegistry.get('BusinessRuleTask');

      applyTemplate(modeling, task, 'decision-job-worker-legacy');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
    }));


    it('should disallow if template declares an editable job worker implementation', inject(function(elementRegistry, contextPad, modeling) {

      // given
      const task = elementRegistry.get('BusinessRuleTask');

      applyTemplate(modeling, task, 'decision-job-worker-editable');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
    }));


    it('should disallow if template declares a task header', inject(function(elementRegistry, contextPad, modeling) {

      // given
      const task = elementRegistry.get('BusinessRuleTask');

      applyTemplate(modeling, task, 'decision-task-header');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
    }));


    it('should disallow if template declares a job worker through another property', inject(function(elementRegistry, contextPad, modeling) {

      // given
      const task = elementRegistry.get('BusinessRuleTask');

      applyTemplate(modeling, task, 'decision-job-worker-retries');

      // when
      contextPad.open(task);

      // then
      expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
    }));

  });


  it('should disallow if template cannot be resolved', inject(function(elementRegistry, contextPad, modeling) {

    // given
    const task = elementRegistry.get('UserTask');

    applyTemplate(modeling, task, 'does-not-exist');

    // when
    contextPad.open(task);

    // then
    expect(domQuery('.entry[data-action="link-resource"]')).not.to.exist;
  }));

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

function createElement(type, properties, parent, bpmnFactory) {
  const element = bpmnFactory.create(type, properties);

  if (parent) {
    element.$parent = parent;
  }

  return element;
}
function template(id, appliesTo, properties, attrs = {}) {
  return {
    $schema: 'https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json',
    id,
    name: id,
    appliesTo: [ appliesTo ],
    properties,
    ...attrs
  };
}

/**
 * A user task template binding a form. The schema requires such templates to opt into
 * Zeebe user tasks, hence the additional marker property and element type.
 */
function userTaskTemplate(id, properties) {
  return template(
    id,
    'bpmn:UserTask',
    [ { type: 'Hidden', binding: { type: 'zeebe:userTask' } }, ...properties ],
    { elementType: { value: 'bpmn:UserTask' } }
  );
}

/**
 * A template property that has nothing to do with resource linking.
 */
function nameProperty() {
  return {
    type: 'String',
    binding: { type: 'property', name: 'name' }
  };
}

function applyTemplate(modeling, element, templateId) {
  modeling.updateProperties(element, {
    'zeebe:modelerTemplate': templateId
  });
}