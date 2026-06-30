import { isConnection } from 'diagram-js/lib/util/ModelUtil';
import { getMid, getOrientation } from 'diagram-js/lib/layout/LayoutUtil';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { omit, pick } from 'min-dash';

import CreatePad from '../../common/createPad/CreatePad';

import icons from '../../common/contextPad/ContextPadIcons';

import { APPEND_GAP, PAD_CONTENT_OFFSET, CREATE_PAD_MARGIN } from './CreatePadLayout';

// leading pad entries, in this order; any other entries follow in natural order.
// connect is relocated here from the context pad.
const PAD_ENTRIES_ORDER = [
  'connect',
  'append.append-task',
  'append.gateway',
  'append.intermediate-event',
  'append.end-event'
];

export default class AppendCreatePad extends CreatePad {
  constructor(canvas, contextPadProvider, eventBus, popupMenu, rules, translate) {
    super(canvas, eventBus, 'djs-append-create-pad');

    this._contextPadProvider = contextPadProvider;
    this._popupMenu = popupMenu;
    this._rules = rules;
    this._translate = translate;
  }

  canOpen(target) {
    if (isConnection(target)) {
      return false;
    }

    if (this._rules.allowed('shape.append', { element: target })) {
      return true;
    }

    // connect-only elements (e.g. participants, end events) still require to open the pad with connect action only
    const entries = this._contextPadProvider.getContextPadEntries(target);

    return !!entries['connect'];
  }

  getEntries(target) {
    const entries = this._contextPadProvider.getContextPadEntries(target);

    const canAppend = this._rules.allowed('shape.append', { element: target });

    return {

      // show "+" append menu trigger, only when appending is allowed;
      ...(canAppend && { append: this._getAppendMenuTrigger(target) }),
      ...this._getPadEntries(entries)
    };
  }

  _getAppendMenuTrigger(target) {
    const title = this._translate('Append element');

    return {
      className: 'djs-create-pad-entry-cta',
      title,
      html: icons.createElement,
      action: {
        click: (event) => {
          event.stopPropagation();

          const { left, top } = this.getHtml().getBoundingClientRect();

          this._popupMenu.open(
            target,
            'bpmn-append',
            { x: left, y: top },
            { title, width: 300, search: true }
          );
        }
      }
    };
  }

  getPosition(target) {
    if (is(target, 'bpmn:BoundaryEvent')) {
      return this._getBoundaryEventPosition(target);
    }

    // anchor to the element's logical bounds (like the indicator overlay), not its
    // visual bbox: the visual overflow past the logical edge varies per shape (a
    // gateway's diamond is wider than its logical box) and would shift the "+".
    // scale only the gap with the zoom, keeping the fixed inset constant, so the
    // "+" tracks the append indicator and never overlaps the element on zoom out
    const { x, y, width, height } = this._canvas.getAbsoluteBBox(target);

    return {
      left: x + width + APPEND_GAP * this._canvas.zoom() + PAD_CONTENT_OFFSET,
      top: y + height / 2
    };
  }

  _getBoundaryEventPosition(target) {
    const orientation = getOrientation(getMid(target), target.host);

    const { containerBounds, targetBounds } = this._getRelativeBounds(target);

    const margin = CREATE_PAD_MARGIN * this._canvas.zoom();

    if (orientation.includes('right') || orientation.includes('top') || orientation.includes('left')) {
      return {
        left: targetBounds.right + margin - containerBounds.left,
        top: targetBounds.top + targetBounds.height / 2 - containerBounds.top
      };
    }

    return {
      left: targetBounds.left + targetBounds.width / 2 - containerBounds.left,
      top: targetBounds.bottom + margin - containerBounds.top
    };
  }

  _getRelativeBounds(target) {
    return {
      containerBounds: this._canvas.getContainer().getBoundingClientRect(),
      targetBounds: this._canvas.getGraphics(target).getBoundingClientRect()
    };
  }

  _getPadEntries(entries) {
    const padEntries = {};

    for (const id in entries) {
      if (id === 'connect' || (id.startsWith('append.') && id !== 'append.text-annotation')) {
        padEntries[ id ] = entries[ id ];
      }
    }

    // leading entries first (in order), then the rest in natural order
    return {
      ...pick(padEntries, PAD_ENTRIES_ORDER),
      ...omit(padEntries, PAD_ENTRIES_ORDER)
    };
  }
}

AppendCreatePad.$inject = [
  'canvas',
  'contextPadProvider',
  'eventBus',
  'popupMenu',
  'rules',
  'translate'
];