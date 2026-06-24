import { isConnection } from 'diagram-js/lib/util/ModelUtil';
import { getMid, getOrientation } from 'diagram-js/lib/layout/LayoutUtil';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { omit, pick } from 'min-dash';

import CreatePad from '../../common/createPad/CreatePad';

const CREATE_PAD_MARGIN = 28;

// leading pad entries, in this order; any other entries follow in natural order.
// connect is relocated here from the context pad.
const PAD_ENTRIES_ORDER = [
  'connect',
  'append.append-task',
  'append.gateway',
  'append.intermediate-event',
  'append.end-event'
];

const APPEND_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M5 12h14"/>
  <path d="M12 5v14"/>
</svg>`;

export default class AppendCreatePad extends CreatePad {
  constructor(canvas, contextPadProvider, eventBus, popupMenu, rules, translate) {
    super(canvas, eventBus, 'djs-append-create-pad');

    this._contextPadProvider = contextPadProvider;
    this._popupMenu = popupMenu;
    this._rules = rules;
    this._translate = translate;
  }

  canOpen(target) {
    return !isConnection(target) && this._rules.allowed('shape.append', { element: target });
  }

  getEntries(target) {
    const entries = this._contextPadProvider.getContextPadEntries(target);

    return {
      append: this._getAppendMenuTrigger(target), // the "+" that opens the full append menu
      ...this._getPadEntries(entries)
    };
  }

  _getAppendMenuTrigger(target) {
    const title = this._translate('Append element');

    return {
      className: 'djs-create-pad-entry-cta',
      title,
      html: APPEND_ICON,
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