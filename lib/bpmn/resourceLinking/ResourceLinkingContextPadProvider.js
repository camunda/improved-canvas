import { isLabel } from 'diagram-js/lib/util/ModelUtil';

import {
  getBusinessObject,
  is,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

import { isString } from 'min-dash';

const LINK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                    <path d="M29.25,6.76a6,6,0,0,0-8.5,0l1.42,1.42a4,4,0,1,1,5.67,5.67l-8,8a4,4,0,1,1-5.67-5.66l1.41-1.42-1.41-1.42-1.42,1.42a6,6,0,0,0,0,8.5A6,6,0,0,0,17,25a6,6,0,0,0,4.27-1.76l8-8A6,6,0,0,0,29.25,6.76Z"/>
                    <path d="M4.19,24.82a4,4,0,0,1,0-5.67l8-8a4,4,0,0,1,5.67,0A3.94,3.94,0,0,1,19,14a4,4,0,0,1-1.17,2.85L15.71,19l1.42,1.42,2.12-2.12a6,6,0,0,0-8.51-8.51l-8,8a6,6,0,0,0,0,8.51A6,6,0,0,0,7,28a6.07,6.07,0,0,0,4.28-1.76L9.86,24.82A4,4,0,0,1,4.19,24.82Z"/>
                  </svg>`;

const VERY_LOW_PRIORITY = 100;

/**
 * @type { {
 *   noneStartEvent?: boolean;
 * } } Config
 *
 * @type {import('diagram-js/lib/features/context-pad/ContextPad').default} ContextPad
 * @type {import('diagram-js/lib/core/EventBus').default} EventBus
 * @type {import('diagram-js/lib/features/rules/Rules').default} Rules
 */

/**
 * Context pad provider that adds a call to action to link resources to tasks.
 * Fires an event that can be listened to handle linking of resources.
 *
 * @example
 *
 * eventBus.on('contextPad.linkResource', ({ element, originalEvent }) => {
 *
 *   // handle linking of resource
 * });
 *
 * @param {Config} config
 * @param {ContextPad} contextPad
 * @param {EventBus} eventBus
 * @param {Rules} rules
 **/
export default function ResourceLinking(config, contextPad, eventBus, rules) {
  this._config = config;
  this._eventBus = eventBus;
  this._contextPad = contextPad;
  this._rules = rules;

  if (config === false) {
    return;
  }

  contextPad.registerProvider(VERY_LOW_PRIORITY, this);
}

ResourceLinking.$inject = [
  'config.resourceLinking',
  'contextPad',
  'eventBus',
  'rules'
];

ResourceLinking.prototype.getContextPadEntries = function(target) {
  return (entries) => {
    if (isLabel(target) || ! this._canLinkResource(target)) {
      return entries;
    }

    let resourceType,
        hasResource;

    if (is(target, 'bpmn:BusinessRuleTask')) {
      resourceType = 'decision';
      hasResource = hasCalledDecision(target);
    } else if (is(target, 'bpmn:CallActivity')) {
      resourceType = 'process';
      hasResource = hasCalledProcess(target);
    } else if (isAny(target, [ 'bpmn:StartEvent', 'bpmn:UserTask' ])) {
      resourceType = 'form';
      hasResource = hasFormIdOrKey(target);
    }

    if (!resourceType) {
      return entries;
    }

    return {
      'link-resource': {
        title: `Link ${ resourceType }`,
        html: `<div class="entry ${ hasResource ? '' : 'resource-linking-no-resource' }">${ LINK_ICON }</div>`,
        action: (event) => this._eventBus.fire('contextPad.linkResource', {
          element: target,
          originalEvent: event
        })
      },
      ...entries
    };

  };
};

ResourceLinking.prototype._canLinkResource = function(element) {
  return this._rules.allowed('resourceLinking.linkResource', { element });
};


// helpers //////////

function findExtensionElement(businessObject, type) {
  const extensionElements = businessObject.get('extensionElements');

  if (!extensionElements) {
    return null;
  }

  const values = extensionElements.get('values');

  if (!values || !values.length) {
    return null;
  }

  return values.find(value => is(value, type));
}

function hasFormKey(formDefinition) {
  const formKey = formDefinition.get('formKey');

  return isString(formKey) && formKey.trim().length;
}

function hasFormId(formDefinition) {
  const formId = formDefinition.get('formId');

  return isString(formId) && formId.trim().length;
}

function hasFormIdOrKey(element) {
  const businessObject = getBusinessObject(element);

  const formDefinition = findExtensionElement(businessObject, 'zeebe:FormDefinition');

  if (!formDefinition) {
    return false;
  }

  return hasFormKey(formDefinition) || hasFormId(formDefinition);
}

function hasCalledDecision(element) {
  const businessObject = getBusinessObject(element);
  const calledDecision = findExtensionElement(businessObject, 'zeebe:CalledDecision');

  if (!calledDecision) {
    return false;
  }

  const decisionId = calledDecision.get('decisionId');

  return isString(decisionId) && decisionId.trim().length;
}

function hasCalledProcess(element) {
  const businessObject = getBusinessObject(element);
  const calledProcess = findExtensionElement(businessObject, 'zeebe:CalledElement');

  if (!calledProcess) {
    return false;
  }

  const processId = calledProcess.get('processId');

  return isString(processId) && processId.trim().length;
}