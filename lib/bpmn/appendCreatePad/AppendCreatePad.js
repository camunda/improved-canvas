import { isConnection } from 'diagram-js/lib/util/ModelUtil';
import { getMid, getOrientation } from 'diagram-js/lib/layout/LayoutUtil';
import { is } from 'bpmn-js/lib/util/ModelUtil';

import CreatePad from '../../common/createPad/CreatePad';

const CREATE_PAD_MARGIN = 30;

export default class AppendCreatePad extends CreatePad {
  constructor(appendContextPadProvider, contextPadProvider, eventBus, overlays, rules) {
    super(eventBus, overlays);

    this._appendContextPadProvider = appendContextPadProvider;
    this._contextPadProvider = contextPadProvider;
    this._rules = rules;
  }

  canOpen(target) {
    return !isConnection(target) && this._rules.allowed('shape.append', { element: target });
  }

  getEntries(target) {
    const contextPadEntries = this._getContextPadEntries(target);

    const appendEntries = this._appendContextPadProvider.getContextPadEntries(target);

    return {
      ...contextPadEntries,
      ...appendEntries
    };
  }

  getPosition(target) {
    if (is(target, 'bpmn:BoundaryEvent')) {
      return this._getBoundaryEventPosition(target);
    }

    return {
      left: target.width + CREATE_PAD_MARGIN,
      top: target.height / 2
    };
  }

  _getBoundaryEventPosition(target) {
    const orientation = getOrientation(getMid(target), target.host);

    if (orientation.includes('right') || orientation.includes('top') || orientation.includes('left')) {
      return {
        left: target.width + CREATE_PAD_MARGIN,
        top: target.height / 2
      };
    }

    return {
      left: target.width / 2,
      top: target.height + CREATE_PAD_MARGIN
    };
  }

  _getContextPadEntries(target) {
    const contextPadEntries = this._contextPadProvider.getContextPadEntries(target);

    for (const id in contextPadEntries) {
      if (!id.startsWith('append') || id === 'append') {
        delete contextPadEntries[ id ];
      }
    }

    return orderContextPadEntries(contextPadEntries);
  }
}

AppendCreatePad.$inject = [
  'appendContextPadProvider',
  'contextPadProvider',
  'eventBus',
  'overlays',
  'rules'
];

function orderContextPadEntries(contextPadEntries) {
  contextPadEntries = moveToBack(contextPadEntries, 'append.append-task');
  contextPadEntries = moveToBack(contextPadEntries, 'append.gateway');
  contextPadEntries = moveToBack(contextPadEntries, 'append.intermediate-event');
  contextPadEntries = moveToBack(contextPadEntries, 'append.end-event');
  contextPadEntries = moveToBack(contextPadEntries, 'append.text-annotation');

  return contextPadEntries;
}

function moveToBack(object, key) {
  const value = object[ key ];

  if (!value) {
    return object;
  }

  delete object[ key ];

  return {
    ...object,
    [ key ]: value
  };
}