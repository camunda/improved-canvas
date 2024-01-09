import ImprovedContextPad from '../../common/contextPad';
import BPMNImprovedContextPadProvider from './ImprovedContextPadProvider';

export default {
  __depends__: [
    ImprovedContextPad
  ],
  __init__: [
    'BPMNimprovedContextPadProvider'
  ],
  BPMNimprovedContextPadProvider: [ 'type', BPMNImprovedContextPadProvider ]
};
