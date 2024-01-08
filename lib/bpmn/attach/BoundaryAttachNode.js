import inherits from 'inherits-browser';

import {
  domify as domify
} from 'min-dom';

import AppendNode from '../../common/append/AppendNode';

const OFFSET = 23;

/**
 * Attach boundary event to element.
 *
 * @param {EventBus} eventBus
 * @param {Overlays} overlays
 */
export default function BoundaryAttachNode(eventBus, overlays) {
  this._eventBus = eventBus;
  this._overlays = overlays;
  this._current = null;

  this._init();
}

inherits(BoundaryAttachNode, AppendNode);

BoundaryAttachNode.$inject = [
  'eventBus',
  'overlays'
];


BoundaryAttachNode.prototype.getHtml = function() {
  return domify(`
  <div class="djs-append-node djs-attach-node">
    <div class="djs-append-node-circle" title="Attach boundary event" draggable="true"></div>
  </div>
`);
};

/**
 * Get append node position.
 *
 * @param {Element} target
 *
 * @return {Rect}
 */
BoundaryAttachNode.prototype._getPosition = function(target) {

  return {
    right: OFFSET + 1,
    bottom: OFFSET
  };
};


// helpers //////////
