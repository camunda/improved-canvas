import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';

import {
  getBusinessObject,
  is,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

/**
 * Element template bindings that take resource linking away, per element type.
 *
 * `resource` bindings determine which resource is linked. They only take linking away when
 * the template fixes the value; an editable one is the user's to change either way.
 *
 * `implementation` bindings declare a competing implementation that linking would delete.
 * Editability is irrelevant there, as the element is removed whole.
 */
const LINKED_RESOURCE_BINDINGS = {
  'bpmn:BusinessRuleTask': {
    resource: [
      { type: 'zeebe:calledDecision', properties: [ 'decisionId' ] }
    ],

    // linking a decision deletes a job worker implementation whole, i.e. both the task
    // definition and its headers, cf. CleanUpBusinessRuleTaskBehavior
    implementation: [
      { type: 'zeebe:taskDefinition' },
      { type: 'zeebe:taskDefinition:type' },
      { type: 'zeebe:taskHeader' }
    ]
  },
  'bpmn:CallActivity': {
    resource: [
      { type: 'zeebe:calledElement', properties: [ 'processId' ] }
    ]
  },

  // no template can currently fix a start event's form, as `zeebe:formDefinition`
  // requires `zeebe:userTask`; the entry keeps linking allowed rather than refused
  'bpmn:StartEvent': {
    resource: [
      { type: 'zeebe:formDefinition', properties: [ 'formId', 'externalReference' ] }
    ]
  },
  'bpmn:UserTask': {
    resource: [
      { type: 'zeebe:formDefinition', properties: [ 'formId', 'externalReference' ] }
    ]
  }
};

export default class ResourceLinkingRules extends RuleProvider {
  constructor(canvas, config, eventBus, injector) {
    super(eventBus);

    if (config === false) {
      return;
    }

    // element templates are not part of every integration
    const elementTemplates = injector.get('elementTemplates', false);

    this.addRule('resourceLinking.linkResource', ({ element }) => {
      if (isLinkedResourceTemplated(element, elementTemplates)) {
        return false;
      }

      if (isAny(element, [ 'bpmn:BusinessRuleTask', 'bpmn:CallActivity', 'bpmn:UserTask' ])) {
        return true;
      }

      if (isNoneStartEvent(element)
        && isNoneStartEventSupported(config)
        && isSingleExecutableProcess(element.parent, canvas.getRootElement())) {
        return true;
      }

      return false;
    });
  }
}

ResourceLinkingRules.$inject = [ 'canvas', 'config.resourceLinking', 'eventBus', 'injector' ];

/**
 * Check whether an applied element template takes resource linking away, either by fixing
 * which resource is linked or by declaring an implementation that linking would delete.
 *
 * @param {Element} element
 * @param {ElementTemplates|null} elementTemplates
 *
 * @returns {boolean}
 */
function isLinkedResourceTemplated(element, elementTemplates) {
  if (!getBusinessObject(element).get('zeebe:modelerTemplate')) {
    return false;
  }

  const bindings = getLinkedResourceBindings(element);

  if (!bindings || !elementTemplates) {
    return true;
  }

  const template = elementTemplates.get(element);

  // an unresolved template may configure anything
  if (!template) {
    return true;
  }

  const { resource = [], implementation = [] } = bindings;

  return (template.properties || []).some((property) => {
    return binds(property, implementation) || (isFixed(property) && binds(property, resource));
  });
}

function getLinkedResourceBindings(element) {
  const type = Object.keys(LINKED_RESOURCE_BINDINGS).find((type) => is(element, type));

  return type && LINKED_RESOURCE_BINDINGS[type];
}

function binds(property, bindings) {
  const { binding = {} } = property;

  return bindings.some(({ type, properties }) => {
    return binding.type === type
      && (!properties || properties.includes(binding.property));
  });
}

/**
 * Check whether a template sets a property to a value the user cannot change.
 */
function isFixed(property) {
  const { editable, type } = property;

  return type === 'Hidden' || editable === false;
}

function isNoneStartEvent(element) {
  const eventDefinitions = getBusinessObject(element).get('eventDefinitions');

  return is(element, 'bpmn:StartEvent') && (!eventDefinitions || !eventDefinitions.length);
}

/**
 * Check whether the none start event is supported.
 *
 * @param {Config|undefined} config
 *
 * @returns {boolean}
 */
function isNoneStartEventSupported(config = {}) {
  const { noneStartEvent = true } = config;

  return noneStartEvent;
}

function isSingleExecutableProcess(element, rootElement) {
  if (is(rootElement, 'bpmn:Process') && element === rootElement) {
    return getBusinessObject(element).get('isExecutable');
  }

  if (is(rootElement, 'bpmn:Collaboration')) {
    const participants = rootElement.children.filter((child) => {
      if (!is(child, 'bpmn:Participant')) {
        return false;
      }

      const processRef = getBusinessObject(child).get('processRef');

      return processRef && processRef.get('isExecutable');
    });

    return participants.length === 1 && participants[0] === element;
  }

  return false;
}