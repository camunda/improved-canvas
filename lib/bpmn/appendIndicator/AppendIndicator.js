import { isConnection } from 'diagram-js/lib/util/ModelUtil';
import { is } from 'bpmn-js/lib/util/ModelUtil';

import icons from '../../common/contextPad/ContextPadIcons';

import { APPEND_GAP } from '../appendCreatePad/constants';

const OVERLAY_TYPE = 'append-indicator';

const INDICATOR_SIZE = 28;

// gap between the element's right edge and the indicator, in diagram units
const INDICATOR_GAP = APPEND_GAP;

// the indicator scales with the diagram zoom down to this factor; when the zoom
// falls below it the indicator is hidden rather than shown tiny and off-center
const MIN_SCALE = 0.3;

// grace period before a hover-opened pad closes again, so the pointer can travel
// from the indicator into the pad without it disappearing
const CLOSE_DELAY_MS = 300;

/**
 * Shows a persistent grey "+" next to every appendable element that has no
 * outgoing sequence flow, nudging the user to complete the path. Hovering it
 * opens the append menu; it hides while that menu is open.
 */
export default class AppendIndicator {
  constructor(appendCreatePad, elementRegistry, eventBus, overlays, rules, selection, translate) {
    this._appendCreatePad = appendCreatePad;
    this._elementRegistry = elementRegistry;
    this._overlays = overlays;
    this._rules = rules;
    this._selection = selection;
    this._translate = translate;

    this._closeTimeout = null;
    this._dragging = false;

    // an indicator depends on the whole diagram (an element's own state and
    // whether its slot is free of neighbors), so re-evaluate all of them
    // whenever the diagram is loaded or changed
    eventBus.on([ 'import.done', 'elements.changed' ], () => this._refreshAll());

    // hide the indicator while the append pad is open for its element
    eventBus.on('createPad.open', ({ target }) => this._setVisible(target, false));
    eventBus.on('createPad.close', ({ target }) => {
      this._cancelClose();

      // closing the pad normally restores its element's indicator, but when the
      // pad closed because a drag began, indicators stay hidden until the drag ends
      if (!this._dragging) {
        this._setVisible(target, true);
      }
    });

    // hide every indicator for the duration of a drag, otherwise dragging the
    // pointer across one would open its hover menu; restore them when the drag ends
    eventBus.on('drag.start', () => {
      this._dragging = true;
      this._setAllVisible(false);
    });
    eventBus.on('drag.cleanup', () => {
      this._dragging = false;
      this._setAllVisible(true);
    });
  }

  _canAdd(element) {
    return !isConnection(element)
      && element.parent // exclude the root
      && !is(element.parent, 'bpmn:AdHocSubProcess') // completing the path is optional inside ad-hoc
      && this._rules.allowed('shape.append', { element })
      && !hasOutgoingSequenceFlow(element)
      && this._hasSpace(element); // skip the optional indicator when it wouldn't fit
  }

  /**
   * The indicator is an optional nudge, so we only show it when its slot next to
   * the element is actually free: it must fit inside a containing sub-process /
   * participant and must not overlap a neighboring shape.
   */
  _hasSpace(element) {
    const slot = {
      x: element.x + element.width + INDICATOR_GAP,
      y: element.y + element.height / 2 - INDICATOR_SIZE / 2,
      width: INDICATOR_SIZE,
      height: INDICATOR_SIZE
    };

    const parent = element.parent;

    // only a bounded container constrains the slot; the process root is unbounded,
    // so an element sitting directly on it (its parent has no parent) always fits
    if (parent.parent && !fitsInside(slot, parent)) {
      return false;
    }

    return !parent.children.some(
      sibling => sibling !== element && isObstacle(sibling) && intersects(slot, sibling)
    );
  }

  _add(element) {
    const html = document.createElement('div');

    html.className = 'djs-append-indicator';
    html.title = this._translate('Append element');
    html.setAttribute('data-element', element.id);
    html.innerHTML = icons.createElement;

    html.addEventListener('mouseenter', () => this._openMenu(element));

    this._overlays.add(element, OVERLAY_TYPE, {
      position: this._getPosition(element),
      scale: { min: MIN_SCALE },
      show: { minZoom: MIN_SCALE },
      html
    });
  }

  _remove(element) {
    if (element) {
      this._overlays.remove({ element, type: OVERLAY_TYPE });
    }
  }

  // re-evaluate the indicator of every element
  _refreshAll() {
    this._elementRegistry.forEach(element => this._refresh(element));
  }

  /**
   * Add, remove or reposition an element's indicator to match its current state,
   * touching the overlay only when it actually needs to change.
   */
  _refresh(element) {
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

    this._add(element);
  }

  // the indicator sits just past the element's right edge, vertically centered
  _getPosition(element) {
    return {
      left: element.width + INDICATOR_GAP,
      top: element.height / 2 - INDICATOR_SIZE / 2
    };
  }

  _setVisible(element, visible) {
    if (!element) {
      return;
    }

    this._setOverlaysVisible(this._overlays.get({ element, type: OVERLAY_TYPE }), visible);
  }

  // toggle every indicator at once, e.g. to get them out of the way during drag interaction
  _setAllVisible(visible) {
    this._setOverlaysVisible(this._overlays.get({ type: OVERLAY_TYPE }), visible);
  }

  _setOverlaysVisible(overlays, visible) {
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

  // hovering another element's indicator opens its pad in place of the selected
  // element's; when that hover ends, reopen the selected element's pad (if any)
  // instead of leaving no pad open
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

// whether a neighbor is a real shape the indicator's slot could clash with.
// Only space-occupying shapes count, so connections (lines, not areas), labels
// (floating text) and lanes (full-width swimlane bands, not obstacles) are skipped.
function isObstacle(element) {
  return element.width != null
    && !element.waypoints
    && !element.labelTarget
    && !is(element, 'bpmn:Lane');
}

function intersects(a, b) {
  return a.x < b.x + b.width
    && a.x + a.width > b.x
    && a.y < b.y + b.height
    && a.y + a.height > b.y;
}

function fitsInside(inner, outer) {
  return inner.x >= outer.x
    && inner.y >= outer.y
    && inner.x + inner.width <= outer.x + outer.width
    && inner.y + inner.height <= outer.y + outer.height;
}

AppendIndicator.$inject = [
  'appendCreatePad',
  'elementRegistry',
  'eventBus',
  'overlays',
  'rules',
  'selection',
  'translate'
];
