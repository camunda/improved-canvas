/**
 * @typedef {import('diagram-js/lib/util/Types').DirectionTRBL} DirectionTRBL
 * @typedef {import('diagram-js/lib/util/Types').Point} Point
 *
 * @typedef {import('bpmn-js/lib/model/Types').Element} Element
 *
 * @typeedef { {
 *   action: {
 *     click: Function;
 *     drag?: Function;
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

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="4 4 24 24">
  <polygon fill="white" points="17,15 17,10 15,10 15,15 10,15 10,17 15,17 15,22 17,22 17,17 22,17 22,15 "/>
</svg>`;

const MOUSE_ENTER_TIMEOUT_MS = 200;
const ENTRY_MOUSE_ENTER_TIMEOUT_MS = 300;

export default class CreatePad {
  constructor(canvas, eventBus) {
    this._canvas = canvas;
    this._eventBus = eventBus;

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

    if (this._mouseEnterTimeout) {
      clearTimeout(this._mouseEnterTimeout);

      this._mouseEnterTimeout = null;
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

    const icon = document.createElement('div');

    icon.classList.add('djs-create-pad-icon');

    icon.innerHTML = ICON;

    html.appendChild(icon);

    const entries = this.getEntries(target);

    const entriesHtml = document.createElement('div');

    entriesHtml.classList.add('djs-create-pad-entries');

    const numberOfEntries = Object.keys(entries).length;

    entriesHtml.style['grid-template-rows'] = `repeat(${ numberOfEntries < 2 ? '1' : '2' }, 1fr)`;
    entriesHtml.style['grid-template-columns'] = `repeat(${ Math.ceil(numberOfEntries / 2) }, 1fr)`;

    for (const id in entries) {
      const entry = entries[ id ];

      const entryHtml = this._getEntryHtml(target, entry);

      entriesHtml.appendChild(entryHtml);
    }

    html.appendChild(entriesHtml);

    html.addEventListener('mouseenter', () => {
      this._mouseEnterTimeout = setTimeout(() => {
        html.classList.add('hover');
      }, MOUSE_ENTER_TIMEOUT_MS);

      html.addEventListener('mouseleave', () => {
        clearTimeout(this._mouseEnterTimeout);

        this._mouseEnterTimeout = null;

        html.classList.remove('hover');
      });
    });

    return html;
  }

  _getEntryHtml(target, entry) {
    const html = document.createElement('div');

    html.classList.add('djs-create-pad-entry');

    if (entry.className) {
      html.classList.add(entry.className);
    }

    if (entry.title) {
      html.setAttribute('title', entry.title);
    }

    if (entry.html) {
      html.innerHTML = entry.html;
    }

    const { action } = entry;

    if (action) {
      if (action.click) {
        html.addEventListener('click', (event) => action.click(event, target));
      }

      if (action.dragstart) {
        html.setAttribute('draggable', true);

        html.addEventListener('dragstart', (event) => action.dragstart(event, target));
      }

      if (action.hover) {
        html.addEventListener('mouseenter', (event) => {
          this._entryMouseEnterTimeout = setTimeout(() => {
            this._entryMouseLeaveCallback = action.hover(event, target);
          }, ENTRY_MOUSE_ENTER_TIMEOUT_MS);
        });

        html.addEventListener('mouseleave', (event) => {
          clearTimeout(this._entryMouseEnterTimeout);

          this._entryMouseEnterTimeout = null;

          if (this._entryMouseLeaveCallback) {
            this._entryMouseLeaveCallback(event, target);

            this._entryMouseLeaveCallback = null;
          }
        });
      }
    }

    return html;
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