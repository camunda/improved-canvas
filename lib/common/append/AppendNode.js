import {
  isArray,
  isFunction,
  some,
  every
} from 'min-dash';

import {
  delegate as domDelegate,
  domify as domify
} from 'min-dom';

import { getBBox } from 'diagram-js/lib/util/Elements';

import appendCSS from '../../../assets/append.css';

import { insertCSS } from '../../util';

const nodeSelector = '.djs-append-node-circle';
const OFFSET = 4;
const NODE_WIDTH = 20;

/**
 * Append node around elements,
 * allowing to append anything.
 *
 * @param {EventBus} eventBus
 * @param {Overlays} overlays
 */
export default function AppendNode(eventBus, overlays) {
  this._eventBus = eventBus;
  this._overlays = overlays;
  this._current = null;

  this._init();
}

AppendNode.$inject = [
  'eventBus',
  'overlays'
];

/**
 * Registers events needed for interaction with other components.
 */
AppendNode.prototype._init = function() {
  const self = this;

  insertCSS('append', appendCSS);

  this._eventBus.on('selection.changed', function(event) {

    const selection = event.newSelection;

    const target = selection.length
      ? selection.length === 1
        ? selection[0]
        : null
      : null;

    if (target) {
      self.show(target);
    } else {
      self.hide();
    }
  });

  this._eventBus.on('elements.changed', function(event) {
    const elements = event.elements,
          current = self._current;

    if (!current) {
      return;
    }

    let currentTarget = current.target;

    const currentChanged = some(
      isArray(currentTarget) ? currentTarget : [ currentTarget ],
      function(element) {
        return includes(elements, element);
      }
    );

    // re-open if elements in current selection changed
    if (currentChanged) {
      self.show(currentTarget);
    }
  });
};


/**
 * Register an append  node provider.
 *
 * @param {AppendNodeProvider} provider
 */
AppendNode.prototype.registerProvider = function(provider) {
  this._provider = provider;
};

/**
 * Trigger append node action.
 *
 * @param {string} action
 * @param {Event} event
 */
AppendNode.prototype.trigger = function(triggerType, event) {

  if (!this.isShown()) {
    return;
  }

  const originalEvent = event.originalEvent || event;
  const target = this._current.target;
  let action = this._current.action;

  if (!action) {
    return;
  }

  this._eventBus.fire('appendNode.trigger', { action, event });

  if (isFunction(action)) {
    return action(originalEvent, target);
  } else {
    return action[triggerType](originalEvent, target);
  }
};

/**
 * Show the append node for given element.
 *
 * @param {Element} target
 */
AppendNode.prototype.show = function(target) {
  this.hide();

  if (!this.isAllowed(target)) {
    return;
  }

  this._updateAndShow(target);
};

/**
 * Check if append node is allowed for given element.
 * @param {Element} target
 */
AppendNode.prototype.isAllowed = function(target) {
  return this._provider.isAllowed(target);
};

/**
 * @param {Element} target
 */
AppendNode.prototype._updateAndShow = function(target) {
  const action = this._provider.getActions(),
        node = this.getNode(target);

  this._current = {
    target: target,
    action,
    node: node
  };

  this._eventBus.fire('appendNode.show', { current: this._current });
};

AppendNode.prototype.getHtml = function() {
  return domify(`
    <div class="djs-append-node">
      <div class="djs-append-node-circle" title="Append element" draggable="true"></div>
    </div>
  `);
};

/**
 * @param {Element} target
 *
 * @return {Overlay}
 */
AppendNode.prototype.getNode = function(target) {
  if (this.isShown()) {
    return this._current.node;
  }

  const self = this;
  const overlays = this._overlays;

  // create node
  const html = this.getHtml();

  // bind triggers
  domDelegate.bind(html, nodeSelector, 'click', function(event) {
    self.trigger('click', event);
  });

  domDelegate.bind(html, nodeSelector, 'dragstart', function(event) {
    self.trigger('dragstart', event);
  });

  // add to overlays
  const position = this._getPosition(target);

  this._overlayId = overlays.add(
    target, 'append-node', { html, position }
  );

  const node = overlays.get(this._overlayId);

  // notify others
  this._eventBus.fire('appendNode.create', {
    target: target,
    node: node
  });

  return node;
};

/**
 * Hide the node
 */
AppendNode.prototype.hide = function() {
  if (!this.isShown()) {
    return;
  }

  this._overlays.remove(this._overlayId);

  this._overlayId = null;

  this._eventBus.fire('appendNode.hide', { current: this._current });

  this._current = null;
};

/**
 * Check if node is shown.
 *
 * If target is provided, check if it is shown
 * for the given target.
 *
 * @param {Element} [target]
 * @return {boolean}
 */
AppendNode.prototype.isShown = function(target) {
  const current = this._current;

  if (!current) {
    return false;
  }

  // shown for any target
  if (!target) {
    return true;
  }

  const currentTarget = current.target;

  if (isArray(target)) {
    return (
      target.length === currentTarget.length &&
      every(target, function(element) {
        return includes(currentTarget, element);
      })
    );
  } else {
    return currentTarget === target;
  }
};

/**
 * Get append node position.
 *
 * @param {Element} target
 *
 * @return {Rect}
 */
AppendNode.prototype._getPosition = function(target) {

  const elements = isArray(target) ? target : [ target ];
  const bBox = getBBox(elements);

  return {
    left: bBox.width + OFFSET,
    top: bBox.height / 2 - NODE_WIDTH
  };
};

// helpers //////////

/**
 * @param {any[]} array
 * @param {any} item
 *
 * @return {boolean}
 */
function includes(array, item) {
  return array.indexOf(item) !== -1;
}