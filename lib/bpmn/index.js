import highContrastCanvas from '../common/highContrastCanvas';
import improvedContextPad from './contextPad';
import improvedPopupMenu from './popupMenu';
import append from './append';
import attach from './attach';
import resourceLinking from './resourceLinking';
import showComments from './showComments';

export default {
  __depends__: [
    highContrastCanvas,
    improvedContextPad,
    improvedPopupMenu,
    append,
    attach,
    resourceLinking,
    showComments
  ]
};
