import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';

import {
  getBusinessObject,
  is,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

export default class ResourceLinkingRules extends RuleProvider {
  constructor(canvas, config, eventBus) {
    super(eventBus);

    if (config === false) {
      return;
    }

    this.addRule('resourceLinking.linkResource', ({ element }) => {
      if (hasElementTemplate(element)) {
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

ResourceLinkingRules.$inject = [ 'canvas', 'config.resourceLinking', 'eventBus' ];

function hasElementTemplate(element) {
  return getBusinessObject(element).get('zeebe:modelerTemplate');
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