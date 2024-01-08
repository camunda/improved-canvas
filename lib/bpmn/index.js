import highContrastCanvas from '../common/highContrastCanvas';
import improvedContextPad from './contextPad';
import improvedPopupMenu from './popupMenu';
import append from './append';
import attach from './attach';

export default {
  __depends__: [
    highContrastCanvas,
    improvedContextPad,
    improvedPopupMenu,
    append,
    attach
  ]
};
