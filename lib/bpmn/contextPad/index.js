import ImprovedContextPad from '../../common/contextPad';
import ImprovedContextPadProvider from './ImprovedContextPadProvider';

export default {
  __depends__: [
    ImprovedContextPad
  ],
  __init__: [
    'improvedContextPadProvider'
  ],
  improvedContextPadProvider: [ 'type', ImprovedContextPadProvider ]
};
