import highContrastCanvas from './features/highContrastCanvas';
import improvedContextPad from './features/contextPad';
import horizontalPopupMenu from './features/popupMenu';
import append from './features/append';

export default {
  __depends__: [
    highContrastCanvas,
    improvedContextPad,
    horizontalPopupMenu,
    append
  ]
};
