import ImprovedContextPad from './ImprovedContextPad';
import ImprovedContextPadProvider from './ImprovedContextPadProvider';

import improvedCanvas from '../improvedCanvas';

export default {
  __depends__: [ improvedCanvas ],
  __init__: [
    'improvedContextPad',
    'improvedContextPadProvider'
  ],
  improvedContextPad: [ 'type', ImprovedContextPad ],
  improvedContextPadProvider: [ 'type', ImprovedContextPadProvider ]
};
