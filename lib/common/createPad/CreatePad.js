/**
 * @typedef {import('diagram-js/lib/util/Types').DirectionTRBL} DirectionTRBL
 * @typedef {import('diagram-js/lib/util/Types').Point} Point
 *
 * @typedef {import('bpmn-js/lib/model/Types').Element} Element
 *
 * @typedef { {
 *   action: {
 *     click: Function;
 *     dragstart?: Function;
 *     hover?: Function;
 *   }
 *   className?: string;
 *   html?: string;
 *   title: string;
 * } } CreatePadEntry
 *
 * @typedef { {
 *   [key: string]: CreatePadEntry;
 * } } CreatePadEntries
 */

import { insertCSS } from '../../util';

import baseCSS from '../../../assets/base.css';
import createPadCSS from '../../../assets/create-pad.css';

import { domify } from 'min-dom';

import { TooltipEntry } from '@bpmn-io/properties-panel';

import { render } from '@bpmn-io/properties-panel/preact';

import { html as htm } from 'htm/preact';

const ENTRY_MOUSE_ENTER_TIMEOUT_MS = 300;

// centered just above the entry, matching the context pad tooltip offset
const TOOLTIP_POSITION = 'left: 50%; bottom: 100%; transform: translateX(-50%);';

export default class CreatePad {
  constructor(canvas, eventBus, className) {
    this._canvas = canvas;
    this._eventBus = eventBus;
    this._className = className;

    this._current = null;

    insertCSS('base', baseCSS);
    insertCSS('append', createPadCSS);

    eventBus.on('selection.changed', ({ newSelection }) => {
      if (newSelection.length !== 1) {

        if (this.isOpen()) {
          this.close();
        }

        return;
      }

      const target = newSelection[ 0 ];

      this.open(target);
    });

    eventBus.on('elements.changed', ({ elements }) => {
      if (!this.isOpen()) {
        return;
      }

      const { target } = this._current;

      if (elements.includes(target)) {
        this.open(target);
      }
    });

    eventBus.on('canvas.viewbox.changed', () => {
      this._updatePosition();
      this._updateVisibility();
    });

    this._container = document.createElement('div');

    this._container.classList.add('djs-create-pad-container');

    this._canvas.getContainer().appendChild(this._container);
  }

  open(target) {
    this.close();

    if (!this.canOpen(target)) {
      return;
    }

    this._open(target);
  }

  show() {
    if (!this.isOpen()) {
      return;
    }

    this._current.html.classList.add('open');
  }

  hide() {
    if (!this.isOpen()) {
      return;
    }

    this._current.html.classList.remove('open');
  }

  close() {
    if (!this._current) {
      return;
    }

    if (this._entryMouseEnterTimeout) {
      clearTimeout(this._entryMouseEnterTimeout);

      this._entryMouseEnterTimeout = null;
    }

    if (this._entryMouseLeaveCallback) {
      this._entryMouseLeaveCallback();

      this._entryMouseLeaveCallback = null;
    }

    this._container.innerHTML = '';

    const {
      html,
      target
    } = this._current;

    this._eventBus.fire('createPad.close', {
      html,
      target
    });

    this._current = null;
  }

  /**
   * Check whether pad can be opened. Must be overridden by sub classes.
   *
   * @param {Element} target
   *
   * @returns {boolean}
   */
  canOpen(target) {
    throw new Error('must implement canOpen');
  }

  isOpen() {
    return !!this._current;
  }

  /**
   * Get position of pad. Must be overridden by sub classes.
   *
   * @param {Element} target
   *
   * @returns {Point}
   */
  getPosition(target) {
    throw new Error('must implement getPosition');
  }

  /**
   * Get entries for pad. Must be overridden by sub classes.
   *
   * @param {Element} target
   *
   * @returns {CreatePadEntries|null}
   */
  getEntries(target) {
    throw new Error('must implement getEntries');
  }

  getHtml() {
    if (!this.isOpen()) {
      return null;
    }

    return this._current.html;
  }

  _open(target) {
    const html = this._createHTML(target);

    this._container.appendChild(html);

    this._eventBus.fire('createPad.open', {
      html,
      target
    });

    this._current = {
      html,
      target
    };

    this._updatePosition();
    this._updateVisibility();

    this._eventBus.fire('createPad.open', { current: this._current });
  }

  _createHTML(target) {
    const html = document.createElement('div');

    html.classList.add('djs-create-pad', 'open');

    if (this._className) {
      html.classList.add(this._className);
    }

    html.appendChild(this._createEntries(target));

    return html;
  }

  _createEntries(target) {
    const entries = this.getEntries(target);

    const entriesHtml = document.createElement('div');

    entriesHtml.classList.add('djs-create-pad-entries');

    for (const id in entries) {
      entriesHtml.appendChild(this._getEntryHtml(id, entries[ id ]));
    }

    this._bindEntryListeners(entriesHtml, entries, target);

    return entriesHtml;
  }

  _getEntryHtml(id, entry) {
    const html = document.createElement('div');

    html.classList.add('djs-create-pad-entry');
    html.setAttribute('data-entry-id', id);

    if (entry.className) {
      html.classList.add(entry.className);
    }

    if (entry.html) {
      html.innerHTML = entry.html;
    }

    if (entry.action && entry.action.dragstart) {
      html.setAttribute('draggable', true);
    }

    if (!entry.title) {
      return html;
    }

    return this._wrapWithTooltip(html, entry.title);
  }

  _wrapWithTooltip(entry, title) {
    entry.setAttribute('aria-label', title);
    entry.setAttribute('role', 'button');

    const wrapper = domify('<div class="djs-create-pad-tooltip"></div>');

    render(htm`
      <${TooltipEntry} value=${title} direction="top" position=${TOOLTIP_POSITION}>
        <div dangerouslySetInnerHTML=${{ __html: entry.outerHTML }} />
      </${TooltipEntry}>
    `, wrapper);

    return wrapper;
  }

  _bindEntryListeners(container, entries, target) {
    const actionFor = (event, name) => {
      const element = event.target.closest('.djs-create-pad-entry');

      if (!element || !container.contains(element)) {
        return null;
      }

      const entry = entries[ element.getAttribute('data-entry-id') ];
      const action = entry && entry.action && entry.action[ name ];

      return action ? { element, action } : null;
    };

    // ignore moves within the same entry; only real enter/leave should count
    const isInternalMove = (found, event) =>
      event.relatedTarget && found.element.contains(event.relatedTarget);

    container.addEventListener('click', (event) => {
      const found = actionFor(event, 'click');

      found && found.action(event, target);
    });

    container.addEventListener('dragstart', (event) => {
      const found = actionFor(event, 'dragstart');

      found && found.action(event, target);
    });

    container.addEventListener('mouseover', (event) => {
      const found = actionFor(event, 'hover');

      if (!found || isInternalMove(found, event)) {
        return;
      }

      this._entryMouseEnterTimeout = setTimeout(() => {
        this._entryMouseLeaveCallback = found.action(event, target);
      }, ENTRY_MOUSE_ENTER_TIMEOUT_MS);
    });

    container.addEventListener('mouseout', (event) => {
      const found = actionFor(event, 'hover');

      if (!found || isInternalMove(found, event)) {
        return;
      }

      clearTimeout(this._entryMouseEnterTimeout);

      this._entryMouseEnterTimeout = null;

      if (this._entryMouseLeaveCallback) {
        this._entryMouseLeaveCallback(event, target);

        this._entryMouseLeaveCallback = null;
      }
    });
  }

  _updatePosition() {
    if (!this.isOpen()) {
      return;
    }

    const html = this._current.html;

    const position = this.getPosition(this._current.target);

    if ('x' in position && 'y' in position) {
      html.style.left = position.x + 'px';
      html.style.top = position.y + 'px';
    } else {
      [
        'top',
        'right',
        'bottom',
        'left'
      ].forEach(function(key) {
        if (key in position) {
          html.style[ key ] = position[ key ] + 'px';
        }
      });
    }
  }

  _updateVisibility() {
    if (!this.isOpen()) {
      return;
    }

    const container = this._canvas.getContainer();

    const containerBounds = container.getBoundingClientRect();

    const gfx = this._canvas.getGraphics(this._current.target);

    const targetBounds = gfx.getBoundingClientRect();

    if (targetBounds.left > containerBounds.right
      || targetBounds.right < containerBounds.left
      || targetBounds.top > containerBounds.bottom
      || targetBounds.bottom < containerBounds.top) {
      this.hide();
    } else {
      this.show();
    }
  }
}

CreatePad.$inject = [
  'canvas',
  'eventBus'
];