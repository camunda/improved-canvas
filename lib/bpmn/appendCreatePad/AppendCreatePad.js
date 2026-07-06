import { isConnection } from 'diagram-js/lib/util/ModelUtil';
import { omit, pick } from 'min-dash';

import CreatePad from '../../common/createPad/CreatePad';

import icons from '../../common/contextPad/ContextPadIcons';

import { APPEND_GAP, MIN_PAD_GAP, PAD_CONTENT_OFFSET } from './constants';

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
  constructor(canvas, contextPadProvider, eventBus, popupMenu, rules, selection, translate) {
    super(canvas, eventBus, 'djs-append-create-pad');

    this._contextPadProvider = contextPadProvider;
    this._popupMenu = popupMenu;
    this._rules = rules;
    this._selection = selection;
    this._translate = translate;

    // direct editing is a dedicated mode where the user's context is the edit box,
    // so step aside for its duration and reopen afterwards if its element is still
    // the single selected one
    eventBus.on('directEditing.activate', () => this.close());

    eventBus.on('directEditing.deactivate', () => {
      const selection = this._selection.get();

      if (selection.length === 1) {
        this.open(selection[0]);
      }
    });
  }

  canOpen(target) {
    if (isConnection(target)) {
      return false;
    }

    if (this.canAppend(target)) {
      return true;
    }

    // connect-only elements (e.g. participants, end events) still require to open the pad with connect action only
    const entries = this._contextPadProvider.getContextPadEntries(target);

    return !!entries['connect'];
  }

  canAppend(target) {
    return this._rules.allowed('shape.append', { element: target });
  }

  getEntries(target) {
    const entries = this._contextPadProvider.getContextPadEntries(target);

    const canAppend = this.canAppend(target);

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
    const { x, y, width, height } = this._canvas.getAbsoluteBBox(target);

    const gap = Math.max(APPEND_GAP * this._canvas.zoom(), MIN_PAD_GAP);

    return {
      left: x + width + gap + PAD_CONTENT_OFFSET,
      top: y + height / 2
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
  'selection',
  'translate'
];