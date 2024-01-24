import { getBusinessObject, is, isAny } from 'bpmn-js/lib/util/ModelUtil';
import { query as domQuery } from 'min-dom';

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

  // TODO(philippfromme): once the context pad has an update feature update the
  // context pad instead of updating it from with the extension 💣
  eventBus.on('commandStack.element.updateModdleProperties.postExecuted', VERY_LOW_PRIORITY, (event) => {
    const { context } = event;
    const { element } = context;

    if (!isAny(element, [ 'bpmn:BusinessRuleTask', 'bpmn:CallActivity', 'bpmn:UserTask' ])) {
      return;
    }

    if (!this._contextPad.isOpen(element)) {
      return;
    }

    const entry = domQuery('.entry.call-to-action', this._contextPad.getPad(element).html);

    if (!entry) {
      return;
    }

    if (is(element, 'bpmn:UserTask')) {
      if (!getFormDefinition(element) && !isActive(entry)) {
        setActive(entry);
      } else if (getFormDefinition(element) && isActive(entry)) {
        setInactive(entry);
      }
    } else if (is(element, 'bpmn:BusinessRuleTask')) {
      if (!getCalledDecision(element) && !isActive(entry)) {
        setActive(entry);
      } else if (getCalledDecision(element) && isActive(entry)) {
        setInactive(entry);
      }
    } else if (is(element, 'bpmn:CallActivity')) {
      if (!getCalledProcess(element) && !isActive(entry)) {
        setActive(entry);
      } else if (getCalledProcess(element) && isActive(entry)) {
        setInactive(entry);
      }
    }
  });
}

ResourceLinking.prototype.getContextPadEntries = function(target) {
  const self = this;

  return (entries) => {

    let resourceType,
        hasResource;

    if (is(target, 'bpmn:BusinessRuleTask')) {
      resourceType = 'decision';
      hasResource = getCalledDecision(target);
    } else if (is(target, 'bpmn:CallActivity')) {
      resourceType = 'process';
      hasResource = getCalledProcess(target);
    } else if (is(target, 'bpmn:UserTask')) {
      resourceType = 'form';
      hasResource = getFormDefinition(target);
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

function getExtensionElementsList(businessObject, type) {
  const extensionElements = businessObject.get('extensionElements');

  if (!extensionElements) {
    return [];
  }

  const values = extensionElements.get('values');

  if (!values || !values.length) {
    return [];
  }

  return values.filter(value => is(value, type));
}

function getFormDefinition(element) {
  const businessObject = getBusinessObject(element);
  const formDefinitions = getExtensionElementsList(businessObject, 'zeebe:FormDefinition');

  return formDefinitions[ 0 ] && formDefinitions[ 0 ].get('formId');
}

function getCalledDecision(element) {
  const businessObject = getBusinessObject(element);
  const calledDecision = getExtensionElementsList(businessObject, 'zeebe:CalledDecision')[ 0 ];

  return calledDecision && calledDecision.get('decisionId');
}

function getCalledProcess(element) {
  const businessObject = getBusinessObject(element);
  const calledProcess = getExtensionElementsList(businessObject, 'zeebe:CalledElement')[ 0 ];

  return calledProcess && calledProcess.get('processId');
}

function isActive(entry) {
  return entry.classList.contains('call-to-action-active');
}

function setActive(entry) {
  entry.classList.add('call-to-action-active');
  entry.classList.remove('call-to-action-inactive');
}

function setInactive(entry) {
  entry.classList.add('call-to-action-inactive');
  entry.classList.remove('call-to-action-active');
}