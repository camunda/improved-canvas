import { isConnection } from 'diagram-js/lib/util/ModelUtil';
import { is } from 'bpmn-js/lib/util/ModelUtil';

import icons from '../../common/contextPad/ContextPadIcons';

import { APPEND_GAP } from '../appendCreatePad/CreatePadLayout';

const OVERLAY_TYPE = 'append-indicator';

const INDICATOR_SIZE = 28;

// gap between the element's right edge and the indicator, in diagram units
const INDICATOR_GAP = APPEND_GAP;

// scale the indicator with the zoom so it stays element-relative; below this
// zoom the overlay would clamp its size and drift off-center, so hide it instead
const MIN_SCALE = 0.3;

// grace period before a hover-opened pad closes again, so the pointer can travel
// from the indicator into the pad without it disappearing
const CLOSE_DELAY_MS = 300;

/**
 * Shows a persistent grey "+" next to every appendable element that has no
 * outgoing sequence flow, nudging the user to complete the path. Hovering it
 * opens the append menu; it hides while that menu is open.
 *
 * Positioning, zooming and removal-on-delete are handled by the overlays
 * service, so this class only owns "which elements qualify" and the hover.
 */
export default class AppendIndicator {
  constructor(appendCreatePad, elementRegistry, eventBus, overlays, rules, selection, translate) {
    this._appendCreatePad = appendCreatePad;
    this._overlays = overlays;
    this._rules = rules;
    this._selection = selection;
    this._translate = translate;

    this._closeTimeout = null;
    this._dragging = false;

    eventBus.on('import.done', () => {
      elementRegistry.forEach(element => this._refresh(element));
    });

    // a shape appearing, moving or resizing can change its own eligibility and
    // free up or take away the slot of its neighbors and children
    eventBus.on([ 'shape.added', 'shape.changed' ], ({ element }) => {
      this._refresh(element);
      this._refreshRelated(element);
    });

    // a removed shape can free up a neighbor's slot; the element is detached from
    // its parent before 'shape.removed' fires, so capture the parent beforehand
    eventBus.on('shape.remove', ({ element }) => {
      this._removingParent = element.parent;
    });

    eventBus.on('shape.removed', () => {
      this._refreshChildren(this._removingParent);
      this._removingParent = null;
    });

    // a sequence flow completing the path removes the source's indicator
    eventBus.on('connection.added', ({ element }) => {
      if (is(element, 'bpmn:SequenceFlow')) {
        this._refresh(element.source);
      }
    });

    // reopening the path restores it; the flow is still attached to its source
    // here, so ignore it when deciding whether the source is now a dangling end
    eventBus.on('connection.removed', ({ element }) => {
      if (is(element, 'bpmn:SequenceFlow')) {
        this._refresh(element.source, element);
      }
    });

    // hide the indicator while the append pad is open for its element
    eventBus.on('createPad.open', ({ target }) => this._setVisible(target, false));
    eventBus.on('createPad.close', ({ target }) => {
      this._cancelClose();

      // dragging from the pad closes it, but the drag itself keeps all indicators
      // hidden; don't let this close restore the source element's indicator
      if (!this._dragging) {
        this._setVisible(target, true);
      }
    });

    // hide all indicators while dragging: dragging the pointer over one would
    // trigger its hover menu. Restore on cleanup (fires for commit and cancel).
    eventBus.on('drag.start', () => {
      this._dragging = true;
      this._setAllVisible(false);
    });
    eventBus.on('drag.cleanup', () => {
      this._dragging = false;
      this._setAllVisible(true);
    });
  }

  _canAdd(element, ignoreConnection) {
    return !isConnection(element)
      && element.parent // exclude the root
      && !is(element.parent, 'bpmn:AdHocSubProcess') // completing the path is optional inside ad-hoc
      && this._rules.allowed('shape.append', { element })
      && !hasOutgoingSequenceFlow(element, ignoreConnection)
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

    // the process root is unbounded, so there is always room there; a contained
    // parent (sub-process, participant) has its own parent and real bounds
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
      position: {
        left: element.width + INDICATOR_GAP,
        top: element.height / 2 - INDICATOR_SIZE / 2
      },
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

  /**
   * Reconcile an element's indicator with its current eligibility and position.
   * Removing first keeps the position fresh after a resize and prevents
   * duplicates, so this is safe to call for any element at any time.
   */
  _refresh(element, ignoreConnection) {
    this._remove(element);

    if (this._canAdd(element, ignoreConnection)) {
      this._add(element);
    }
  }

  // a change to one element can free up or take away the slot of its neighbors
  // (overlap) and its children (containment), so reconcile those too
  _refreshRelated(element) {
    const related = [
      ...(element.parent ? element.parent.children : []),
      ...(element.children || [])
    ];

    related.forEach(other => {
      if (other !== element) {
        this._refresh(other);
      }
    });
  }

  // reconcile every child of a parent, e.g. after one of its children was
  // removed and a neighbor's slot may have opened up again
  _refreshChildren(parent) {
    if (parent) {
      parent.children.forEach(child => this._refresh(child));
    }
  }

  _setVisible(element, visible) {
    if (!element) {
      return;
    }

    const [ overlay ] = this._overlays.get({ element, type: OVERLAY_TYPE });

    if (overlay) {
      overlay.html.style.display = visible ? '' : 'none';
    }
  }

  // toggle every indicator at once, e.g. to get them out of the way for the
  // duration of a drag interaction
  _setAllVisible(visible) {
    this._overlays.get({ type: OVERLAY_TYPE }).forEach(overlay => {
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

  // a hover on another element's indicator replaces the pad the selected element
  // opened on selection; when that hover ends, return to the selected element's
  // pad rather than leaving nothing open (the selection outlives the hover)
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

function hasOutgoingSequenceFlow(element, ignoreConnection) {
  return element.outgoing && element.outgoing.some(
    connection => connection !== ignoreConnection && is(connection, 'bpmn:SequenceFlow')
  );
}

// a shape we can collide with: not a connection, not a label, and not a lane
// (lanes are full-width background bands, not real obstacles)
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
