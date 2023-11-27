import { insertCSS } from '../../util';
import contextPadCSS from '../../../assets/context-pad.css';
import baseCSS from '../../../assets/base.css';

import {
  isArray
} from 'min-dash';


import {
  getBBox
} from 'diagram-js/lib/util/Elements';

export default function ImprovedContextPad(contextPad) {

  insertCSS('base', baseCSS);
  insertCSS('context-pad', contextPadCSS);

  contextPad._getPosition = this._getPosition;
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

ImprovedContextPad.$inject = [ 'contextPad', 'eventBus' ];