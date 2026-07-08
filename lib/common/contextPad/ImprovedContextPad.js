import { insertCSS } from '../../util';
import baseCSS from '../../../assets/base.css';
import contextPadCSS from '../../../assets/context-pad.css';

import {
  domify as domify
} from 'min-dom';

import {
  queryAll as domQueryAll
} from 'min-dom';

import { TooltipEntry } from '@bpmn-io/properties-panel';

import { render } from '@bpmn-io/properties-panel/preact';

import { html } from 'htm/preact';

import { PAD_GAP } from '../constants';

const CONTEXT_PAD_VISIBLE_PADDING = 20;

const MARKER_HIDDEN = 'djs-element-hidden';

export default function ImprovedContextPad(canvas, contextPad, eventBus, injector) {
  insertCSS('base', baseCSS);
  insertCSS('context-pad', contextPadCSS);

  this._canvas = canvas;
  this._contextPad = contextPad;
  this._injector = injector;

  this._editing = false;

  contextPad._getPosition = this._getPosition.bind(this);
  contextPad._updateVisibility = this._updateVisibility.bind(this);

  eventBus.on('contextPad.open', this._renderTooltips.bind(this));

  eventBus.on('canvas.viewbox.changed', () => {
    this._updateVisibility();
  });

  // direct editing is a dedicated mode where the user's context is the edit box,
  // so keep the context pad out of the way for its duration and bring it back
  // once editing completes or is cancelled
  eventBus.on('directEditing.activate', () => {
    this._editing = true;
    this._contextPad.hide();
  });

  eventBus.on('directEditing.deactivate', () => {
    this._editing = false;
    this._updateVisibility();
  });
}

ImprovedContextPad.prototype._updateVisibility = function() {
  if (!this._contextPad.isOpen()) {
    return;
  }

  if (this._editing) {
    this._contextPad.hide();

    return;
  }

  var target = this._contextPad._current.target;

  var targets = Array.isArray(target) ? target : [ target ];

  var elementHidden = targets.some((target) => {
    return this._canvas.hasMarker(target, MARKER_HIDDEN);
  });

  const container = this._canvas.getContainer();

  const containerBounds = container.getBoundingClientRect();

  const targetBounds = this._contextPad._getTargetBounds(this._contextPad._current.target);

  const elementOutsideBounds = targetBounds.left > containerBounds.right
  || targetBounds.right < containerBounds.left
  || targetBounds.top > containerBounds.bottom
  || targetBounds.bottom < containerBounds.top;

  if (elementHidden || elementOutsideBounds) {
    this._contextPad.hide();
  } else {
    this._contextPad.show();
  }
};

ImprovedContextPad.prototype._getPosition = function(target) {
  const container = this._canvas.getContainer();

  const containerBounds = container.getBoundingClientRect();

  const contextPadHtml = this._contextPad._current.html;

  const contextPadBounds = contextPadHtml.getBoundingClientRect();

  // measured with the selection outline (like the append pad) so both pads keep the
  // same distance from the element
  const targetBounds = this._contextPad._getTargetBounds(target);

  const targetBoundsMid = {
    x: targetBounds.x + targetBounds.width / 2,
    y: targetBounds.y + targetBounds.height / 2
  };

  const margin = PAD_GAP * this._canvas.zoom();

  let left = targetBoundsMid.x - contextPadBounds.width / 2 - containerBounds.left;
  let top = targetBounds.top - contextPadBounds.height - margin - containerBounds.top;

  // left bounds
  if (left < CONTEXT_PAD_VISIBLE_PADDING) {
    left = CONTEXT_PAD_VISIBLE_PADDING;
  }

  // right bounds
  if (left + contextPadBounds.width > containerBounds.width - CONTEXT_PAD_VISIBLE_PADDING) {
    left = containerBounds.width - contextPadBounds.width - CONTEXT_PAD_VISIBLE_PADDING;
  }

  // top bounds
  if (top < CONTEXT_PAD_VISIBLE_PADDING) {
    top = targetBounds.bottom + margin - containerBounds.top;
  }

  if (top < CONTEXT_PAD_VISIBLE_PADDING) {
    top = CONTEXT_PAD_VISIBLE_PADDING;
  }

  // bottom bounds
  if (top + contextPadBounds.height > containerBounds.height - CONTEXT_PAD_VISIBLE_PADDING) {
    top = containerBounds.height - contextPadBounds.height - CONTEXT_PAD_VISIBLE_PADDING;
  }

  // palette
  const palette = this._injector.get('palette', false);

  if (palette) {
    const paletteBounds = palette._container.getBoundingClientRect();

    if (left < paletteBounds.right - containerBounds.left + CONTEXT_PAD_VISIBLE_PADDING && top < paletteBounds.bottom - containerBounds.top + CONTEXT_PAD_VISIBLE_PADDING) {
      left = paletteBounds.right - containerBounds.left + CONTEXT_PAD_VISIBLE_PADDING;
    }
  }

  return {
    left,
    top
  };
};

ImprovedContextPad.prototype._renderTooltips = function() {
  const entries = domQueryAll('.entry', this._contextPad._current.html);

  entries.forEach((entry)=> {
    const position = getTooltipPosition();

    // remove native tooltip
    const title = entry.getAttribute('title');
    entry.removeAttribute('title');
    entry.setAttribute('aria-label', title);
    entry.setAttribute('role', 'button');

    // render entry with tooltip
    const placeholderContainer = domify('<div></div>');
    entry.parentNode.appendChild(placeholderContainer);
    entry.parentNode.removeChild(entry);

    render(html`
        <${TooltipEntry} value="${title}" position=${position} direction="top">
          <div dangerouslySetInnerHTML=${ { __html: entry.outerHTML } }/>
        </${TooltipEntry}>`
    , placeholderContainer);
  });
};

ImprovedContextPad.$inject = [
  'canvas',
  'contextPad',
  'eventBus',
  'injector'
];


function getTooltipPosition() {
  return 'bottom: calc(100% - var(--context-pad-padding));';
}