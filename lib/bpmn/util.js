import { is } from 'bpmn-js/lib/util/ModelUtil';

export function hasOutgoingSequenceFlow(element) {
  return !!element.outgoing && element.outgoing.some(
    connection => is(connection, 'bpmn:SequenceFlow')
  );
}

// whether an element's place in the diagram allows an append indicator at all;
// never the root, and never inside an ad-hoc sub-process, where order is free
// and there is no path to complete
export function allowsAppendIndicator(element) {
  return !!element.parent && !is(element.parent, 'bpmn:AdHocSubProcess');
}
