import { isConnection } from 'diagram-js/lib/util/ModelUtil';
import { getMid, getOrientation } from 'diagram-js/lib/layout/LayoutUtil';
import { is } from 'bpmn-js/lib/util/ModelUtil';

import CreatePad from '../../common/createPad/CreatePad';

const CREATE_PAD_MARGIN = 15;

export default class AppendCreatePad extends CreatePad {
  constructor(appendContextPadProvider, canvas, contextPadProvider, eventBus, rules) {
    super(canvas, eventBus);

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

    const container = this._canvas.getContainer();

    const containerBounds = container.getBoundingClientRect();

    const gfx = this._canvas.getGraphics(target);

    const targetBounds = gfx.getBoundingClientRect();

    let margin = CREATE_PAD_MARGIN;

    if (this._rules.allowed('shape.resize', { shape: target })) {
      margin = margin * 1.5;
    }

    return {
      left: targetBounds.right + (margin * this._canvas.zoom()) - containerBounds.left,
      top: targetBounds.top + targetBounds.height / 2 - containerBounds.top
    };
  }

  _getBoundaryEventPosition(target) {
    const orientation = getOrientation(getMid(target), target.host);

    const container = this._canvas.getContainer();

    const containerBounds = container.getBoundingClientRect();

    const gfx = this._canvas.getGraphics(target);

    const targetBounds = gfx.getBoundingClientRect();

    if (orientation.includes('right') || orientation.includes('top') || orientation.includes('left')) {
      return {
        left: targetBounds.right + (CREATE_PAD_MARGIN * this._canvas.zoom()) - containerBounds.left,
        top: targetBounds.top + targetBounds.height / 2 - containerBounds.top
      };
    }

    return {
      left: targetBounds.left + targetBounds.width / 2 - containerBounds.left,
      top: targetBounds.bottom + (CREATE_PAD_MARGIN * this._canvas.zoom()) - containerBounds.top
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
  'canvas',
  'contextPadProvider',
  'eventBus',
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