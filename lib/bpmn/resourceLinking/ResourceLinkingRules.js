import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';

import {
  getBusinessObject,
  is,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

/**
 * Element template bindings that determine which resource an element links to.
 */
const LINKED_RESOURCE_BINDINGS = {
  'bpmn:BusinessRuleTask': {
    type: 'zeebe:calledDecision',
    properties: [ 'decisionId' ]
  },
  'bpmn:CallActivity': {
    type: 'zeebe:calledElement',
    properties: [ 'processId', 'processIdExpression' ]
  },

  // no template can currently fix a start event's form, as `zeebe:formDefinition`
  // requires `zeebe:userTask`; the entry keeps linking allowed rather than refused
  'bpmn:StartEvent': {
    type: 'zeebe:formDefinition',
    properties: [ 'formId', 'formKey', 'externalReference' ]
  },
  'bpmn:UserTask': {
    type: 'zeebe:formDefinition',
    properties: [ 'formId', 'formKey', 'externalReference' ]
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
 * Check whether an applied element template determines which resource the element links to.
 *
 * A template may configure a linked resource without owning it. Only a value the user cannot
 * change takes the choice away; anything else leaves them free to link as usual.
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

  const binding = getLinkedResourceBinding(element);

  if (!binding || !elementTemplates) {
    return true;
  }

  const template = elementTemplates.get(element);

  // an unresolved template may configure anything
  if (!template) {
    return true;
  }

  return (template.properties || []).some(
    (property) => determinesLinkedResource(property, binding)
  );
}

function getLinkedResourceBinding(element) {
  const type = Object.keys(LINKED_RESOURCE_BINDINGS).find((type) => is(element, type));

  return type && LINKED_RESOURCE_BINDINGS[type];
}

function determinesLinkedResource(property, binding) {
  const { binding: propertyBinding = {}, editable, type } = property;

  if (propertyBinding.type !== binding.type
    || !binding.properties.includes(propertyBinding.property)) {
    return false;
  }

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