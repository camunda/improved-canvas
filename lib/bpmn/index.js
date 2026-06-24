import highContrastCanvas from '../common/highContrastCanvas';
import improvedContextPad from './contextPad';
import improvedPopupMenu from './popupMenu';
import resourceLinking from './resourceLinking';
import showComments from './showComments';
import appendCreatePad from './appendCreatePad';

export default {
  __depends__: [
    highContrastCanvas,
    improvedContextPad,
    improvedPopupMenu,
    appendCreatePad,
    resourceLinking,
    showComments
  ]
};
