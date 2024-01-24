import { insertCSS } from '../../util';
import contextPadCSS from '../../../assets/context-pad.css';
import baseCSS from '../../../assets/base.css';

import {
  isArray
} from 'min-dash';

import {
  domify as domify
} from 'min-dom';

import {
  queryAll as domQueryAll
} from 'min-dom';

import {
  getBBox
} from 'diagram-js/lib/util/Elements';

import { TooltipEntry } from '@bpmn-io/properties-panel';

import { render } from '@bpmn-io/properties-panel/preact';

import { html } from 'htm/preact';

export default function ImprovedContextPad(contextPad, eventBus, canvas) {

  insertCSS('base', baseCSS);

  insertCSS('context-pad', contextPadCSS);

  this._contextPad = contextPad;

  contextPad._getPosition = this._getPosition;

  eventBus.on('contextPad.open', this._renderTooltips.bind(this));
}

ImprovedContextPad.prototype._getPosition = function(target) {
  var elements = isArray(target) ? target : [ target ];
  var bBox = getBBox(elements);

  return {
    position: {
      left: bBox.x + bBox.width / 2,
      top: bBox.y - 12
    }
  };
};

ImprovedContextPad.prototype._renderTooltips = function({ current }) {

  const entries = domQueryAll('.entry', current.pad.html);

  entries.forEach((entry)=> {

    const position = getTooltipPosition();

    // remove native tooltip
    const title = entry.getAttribute('title');
    entry.setAttribute('aria-label', title);
    entry.removeAttribute('title');

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

ImprovedContextPad.$inject = [ 'contextPad', 'eventBus', 'canvas' ];


function getTooltipPosition() {
  return 'bottom: 100%;';
}