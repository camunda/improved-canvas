import ImprovedContextPad from './ImprovedContextPad';
import ImprovedContextPadProvider from './ImprovedContextPadProvider';
import FeedbackButton from './FeedbackButton';

export default {
  __init__: [
    'improvedContextPad',
    'improvedContextPadProvider',
    'feedbackButton'
  ],
  improvedContextPad: [ 'type', ImprovedContextPad ],
  improvedContextPadProvider: [ 'type', ImprovedContextPadProvider ],
  feedbackButton: [ 'type', FeedbackButton ]
};
