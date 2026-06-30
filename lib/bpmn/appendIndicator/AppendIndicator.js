import { isConnection } from 'diagram-js/lib/util/ModelUtil';
import { is } from 'bpmn-js/lib/util/ModelUtil';

import icons from '../../common/contextPad/ContextPadIcons';

import { PAD_GAP } from '../../common/constants';

const OVERLAY_TYPE = 'append-indicator';

// the append pad's "+" button has padding inside the pad box (its CSS padding);
// so we need to add this to the gap so the indicator's "+" lines up with the pad's "+"
const PAD_ICON_PADDING = 4;

// below this zoom the indicator is hidden instead of shrinking further
const MIN_SCALE = 0.3;

// delay before the pad closes, so the pointer can move from indicator to pad
const CLOSE_DELAY_MS = 300;

/**
 * Shows a grey "+" next to every appendable element that has no outgoing
 * sequence flow. Hovering it opens the append menu.
 */
export default class AppendIndicator {
  constructor(appendCreatePad, elementRegistry, eventBus, outline, overlays, selection, translate) {
    this._appendCreatePad = appendCreatePad;
    this._elementRegistry = elementRegistry;
    this._overlays = overlays;
    this._selection = selection;
    this._translate = translate;

    // indicator gap from the element, calculated by common pad gap + element outline offset + append pad padding to the '+' icon
    this._indicatorGap = PAD_GAP + outline.offset + PAD_ICON_PADDING;

    this._closeTimeout = null;

    // reasons the indicators are disabled; they are visible when there are none
    // (e.g. while dragging, direct editing or disabled externally by a lock)
    this._disabledBy = new Set();

    // refresh all indicators on load
    eventBus.on('import.done', () => this._refreshAll());

    // refresh indicators for changed elements
    eventBus.on('elements.changed', ({ elements }) => this._refreshChanged(elements));

    // a connection's source and target aren't always in elements.changed;
    // refresh both ends from the command context
    const refreshFlowEnds = ({ context }) => {
      [ context.source, context.target, context.oldSource, context.newSource ]
        .forEach(element => this._refresh(element));
    };

    eventBus.on([
      'commandStack.connection.create.reverted',
      'commandStack.connection.reconnect.postExecuted',
      'commandStack.connection.reconnect.reverted',
      'commandStack.connection.delete.postExecuted'
    ], refreshFlowEnds);

    // hide the indicator while its append pad is open
    eventBus.on('createPad.open', ({ target }) => this._setVisible(target, false));
    eventBus.on('createPad.close', ({ target }) => {
      this._cancelClose();

      // restore the indicator; _setVisible keeps it hidden while disabled
      this._setVisible(target, true);
    });

    // hide indicators during a drag or direct edit, then restore them
    eventBus.on('drag.start', () => this._setDisabledBy('dragging', true));
    eventBus.on('drag.cleanup', () => this._setDisabledBy('dragging', false));
    eventBus.on('directEditing.activate', () => this._setDisabledBy('editing', true));
    eventBus.on('directEditing.deactivate', () => this._setDisabledBy('editing', false));
  }

  _canAdd(element) {
    return element.parent // exclude the root
      && !is(element.parent, 'bpmn:AdHocSubProcess') // order is free in ad-hoc, no path to complete
      && this._appendCreatePad.canAppend(element)
      && !hasOutgoingSequenceFlow(element);
  }

  _add(element, position) {
    const html = document.createElement('div');

    html.className = 'djs-append-indicator';
    html.title = this._translate('Append element');
    html.setAttribute('data-element', element.id);
    html.innerHTML = icons.createElement;

    html.addEventListener('mouseenter', () => this._openMenu(element));

    this._overlays.add(element, OVERLAY_TYPE, {
      position,
      scale: { min: MIN_SCALE, max: 1 },
      show: { minZoom: MIN_SCALE },
      html
    });
  }

  _remove(element) {
    if (element) {
      this._overlays.remove({ element, type: OVERLAY_TYPE });
    }
  }

  // refresh every element's indicator
  _refreshAll() {
    this._elementRegistry.forEach(element => this._refresh(element));
  }

  // refresh the changed elements, plus both ends of any changed connection
  // (their indicators depend on their outgoing flows)
  _refreshChanged(elements) {
    const dirty = new Set();

    elements.forEach(element => {
      dirty.add(element);

      if (isConnection(element)) {
        element.source && dirty.add(element.source);
        element.target && dirty.add(element.target);
      }
    });

    dirty.forEach(element => this._refresh(element));
  }

  // add, remove or reposition an element's indicator to match its current state
  _refresh(element) {
    if (!element) {
      return;
    }

    const [ existing ] = this._overlays.get({ element, type: OVERLAY_TYPE });

    if (!this._canAdd(element)) {
      if (existing) {
        this._remove(element);
      }

      return;
    }

    const position = this._getPosition(element);

    // already in the right place, nothing to do
    if (existing
        && existing.position.left === position.left
        && existing.position.top === position.top) {
      return;
    }

    // position changed (e.g. after a resize); re-add to move it
    if (existing) {
      this._remove(element);
    }

    this._add(element, position);
  }

  _getPosition(element) {
    return {
      left: element.width + this._indicatorGap,
      top: element.height / 2
    };
  }

  _setVisible(element, visible) {
    if (!element) {
      return;
    }

    // never reveal an indicator while disabled
    this._setOverlaysVisibility(
      this._overlays.get({ element, type: OVERLAY_TYPE }),
      visible && !this._isDisabled()
    );
  }

  // enable or disable the indicators externally (e.g. while the canvas is locked)
  setEnabled(enabled) {
    this._setDisabledBy('external', !enabled);
  }

  // add or clear a reason the indicators are disabled, then update their visibility
  _setDisabledBy(reason, disabled) {
    if (disabled) {
      this._disabledBy.add(reason);
    } else {
      this._disabledBy.delete(reason);
    }

    this._setAllVisible(!this._isDisabled());
  }

  _isDisabled() {
    return this._disabledBy.size > 0;
  }

  _setAllVisible(visible) {
    this._setOverlaysVisibility(this._overlays.get({ type: OVERLAY_TYPE }), visible);
  }

  _setOverlaysVisibility(overlays, visible) {
    overlays.forEach(overlay => {
      overlay.html.style.display = visible ? '' : 'none';
    });
  }

  _openMenu(element) {
    this._cancelClose();

    this._appendCreatePad.open(element);

    const html = this._appendCreatePad.getHtml();

    if (!html) {
      return;
    }

    // close again shortly after the pointer leaves the pad
    html.addEventListener('mouseenter', () => this._cancelClose());
    html.addEventListener('mouseleave', () => this._scheduleClose());
  }

  _scheduleClose() {
    this._cancelClose();

    this._closeTimeout = setTimeout(() => this._closeOrRestoreSelection(), CLOSE_DELAY_MS);
  }

  // reopen the selected element's pad instead of leaving none open
  _closeOrRestoreSelection() {
    const selection = this._selection.get();

    if (selection.length === 1) {
      this._appendCreatePad.open(selection[0]);
    } else {
      this._appendCreatePad.close();
    }
  }

  _cancelClose() {
    if (this._closeTimeout) {
      clearTimeout(this._closeTimeout);

      this._closeTimeout = null;
    }
  }
}

function hasOutgoingSequenceFlow(element) {
  return element.outgoing && element.outgoing.some(
    connection => is(connection, 'bpmn:SequenceFlow')
  );
}

AppendIndicator.$inject = [
  'appendCreatePad',
  'elementRegistry',
  'eventBus',
  'outline',
  'overlays',
  'selection',
  'translate'
];
