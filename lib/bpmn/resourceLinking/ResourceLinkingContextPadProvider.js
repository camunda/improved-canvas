import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { isDefined } from 'min-dash';

const LINK_ICON = `<svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                    <path d="M29.25,6.76a6,6,0,0,0-8.5,0l1.42,1.42a4,4,0,1,1,5.67,5.67l-8,8a4,4,0,1,1-5.67-5.66l1.41-1.42-1.41-1.42-1.42,1.42a6,6,0,0,0,0,8.5A6,6,0,0,0,17,25a6,6,0,0,0,4.27-1.76l8-8A6,6,0,0,0,29.25,6.76Z"/>
                    <path d="M4.19,24.82a4,4,0,0,1,0-5.67l8-8a4,4,0,0,1,5.67,0A3.94,3.94,0,0,1,19,14a4,4,0,0,1-1.17,2.85L15.71,19l1.42,1.42,2.12-2.12a6,6,0,0,0-8.51-8.51l-8,8a6,6,0,0,0,0,8.51A6,6,0,0,0,7,28a6.07,6.07,0,0,0,4.28-1.76L9.86,24.82A4,4,0,0,1,4.19,24.82Z"/>
                  </svg>`;

const VERY_LOW_PRIORITY = 0;

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
**/
export default function ResourceLinking(contextPad, eventBus) {
  this._eventBus = eventBus;
  this._contextPad = contextPad;

  contextPad.registerProvider(VERY_LOW_PRIORITY, this);
}

ResourceLinking.prototype.getContextPadEntries = function(target) {
  const self = this;

  return (entries) => {

    let resourceType,
        hasResource;

    if (is(target, 'bpmn:BusinessRuleTask')) {
      resourceType = 'decision';
      hasResource = hasCalledDecision(target);
    } else if (is(target, 'bpmn:CallActivity')) {
      resourceType = 'process';
      hasResource = hasCalledProcess(target);
    } else if (is(target, 'bpmn:UserTask')) {
      resourceType = 'form';
      hasResource = hasFormDefinition(target);
    }

    if (!resourceType) {
      return entries;
    }

    return {
      [`link-${ resourceType }`]: {
        title: `Link ${ resourceType }`,
        html: `<div class="entry call-to-action ${ hasResource ? 'call-to-action-inactive' : 'call-to-action-active' }">${ LINK_ICON }</div>`,
        action: (event) => self._eventBus.fire('contextPad.linkResource', {
          element: target,
          originalEvent: event
        }),
        group: hasResource ? 'call-to-action-inactive' : 'call-to-action-active'
      },
      ...entries
    };

  };
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

function hasFormDefinition(element) {
  const businessObject = getBusinessObject(element);
  const formDefinition = findExtensionElement(businessObject, 'zeebe:FormDefinition');

  if (!formDefinition) {
    return false;
  }

  const formId = formDefinition.get('formId');

  return isDefined(formId) && formId !== '';
}

function hasCalledDecision(element) {
  const businessObject = getBusinessObject(element);
  const calledDecision = findExtensionElement(businessObject, 'zeebe:CalledDecision');

  if (!calledDecision) {
    return false;
  }

  const decisionId = calledDecision.get('decisionId');

  return isDefined(decisionId) && decisionId !== '';
}

function hasCalledProcess(element) {
  const businessObject = getBusinessObject(element);
  const calledProcess = findExtensionElement(businessObject, 'zeebe:CalledElement');

  if (!calledProcess) {
    return false;
  }

  const processId = calledProcess.get('processId');

  return isDefined(processId) && processId !== '';
}