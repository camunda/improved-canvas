import highContrastCanvas from './features/highContrastCanvas';
import improvedContextPad from './features/contextPad';
import horizontalPopupMenu from './features/popupMenu';
import append from './features/append';
import attach from './features/attach';

export default {
  __depends__: [
    highContrastCanvas,
    improvedContextPad,
    horizontalPopupMenu,
    append,
    attach
  ]
};
