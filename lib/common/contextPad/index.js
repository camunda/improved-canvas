import ImprovedContextPad from './ImprovedContextPad';
import ImprovedContextPadProvider from './ImprovedContextPadProvider';
import FeedbackButton from './FeedbackButton';

import improvedCanvas from '../improvedCanvas';

export default {
  __depends__: [ improvedCanvas ],
  __init__: [
    'improvedContextPad',
    'improvedContextPadProvider',
    'feedbackButton'
  ],
  improvedContextPad: [ 'type', ImprovedContextPad ],
  improvedContextPadProvider: [ 'type', ImprovedContextPadProvider ],
  feedbackButton: [ 'type', FeedbackButton ]
};
