import { insertCSS } from '../../util';
import contextPadCSS from '../../../assets/context-pad.css';
import baseCSS from '../../../assets/base.css';

import {
  isArray,
  forEach
} from 'min-dash';

import {
  queryAll as domQueryAll
} from 'min-dom';

import {
  getBBox
} from 'diagram-js/lib/util/Elements';

export default function ImprovedContextPad(contextPad, eventBus) {

  insertCSS('base', baseCSS);
  insertCSS('context-pad', contextPadCSS);

  contextPad._getPosition = this._getPosition;

  eventBus.on('contextPad.open', this._addGroupSeparator.bind(this));
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

ImprovedContextPad.prototype._addGroupSeparator = function() {
  const groups = domQueryAll('.djs-context-pad .group');

  forEach(groups, function(group) {

    if (group === groups[groups.length - 1]) {
      return;
    }

    group.insertAdjacentHTML('afterend', '<div class="separator"/>');
  });
};

ImprovedContextPad.$inject = [ 'contextPad', 'eventBus' ];