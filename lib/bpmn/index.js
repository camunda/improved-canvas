import highContrastCanvas from '../common/highContrastCanvas';
import improvedContextPad from './contextPad';
import improvedPopupMenu from './popupMenu';
import resourceLinking from './resourceLinking';
import showComments from './showComments';
import appendCreatePad from './appendCreatePad';
import appendIndicator from './appendIndicator';
import improvedPalette from './palette';

export default {
  __depends__: [
    highContrastCanvas,
    improvedContextPad,
    improvedPopupMenu,
    appendCreatePad,
    appendIndicator,
    resourceLinking,
    showComments,
    improvedPalette
  ]
};
