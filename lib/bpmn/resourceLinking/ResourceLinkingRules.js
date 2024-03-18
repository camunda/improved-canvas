import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';

import {
  getBusinessObject,
  is,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

export default class ResourceLinkingRules extends RuleProvider {
  constructor(config, eventBus) {
    super(eventBus);

    this.addRule('resourceLinking.linkResource', ({ element }) => {
      return !hasElementTemplate(element) && (
        isAny(element, [ 'bpmn:BusinessRuleTask', 'bpmn:CallActivity', 'bpmn:UserTask' ]) || (isNoneStartEvent(element) && isNoneStartEventSupported(config))
      );
    });
  }
}

ResourceLinkingRules.$inject = [ 'config.resourceLinking', 'eventBus' ];

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