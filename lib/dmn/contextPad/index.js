import ImprovedContextPad from '../../common/contextPad';
import ImprovedContextPadProvider from './ImprovedContextPadProvider';

export default {
  __depends__: [
    ImprovedContextPad
  ],
  __init__: [
    'DMNimprovedContextPadProvider'
  ],
  DMNimprovedContextPadProvider: [ 'type', ImprovedContextPadProvider ]
};
