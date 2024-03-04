import HorizontalPopupMenu from './HorizontalPopupMenu';
import ColorPickerPopupProvider from './ColorPickerPopupProvider';

import improvedCanvas from '../improvedCanvas';

export default {
  __depends__: [ improvedCanvas ],
  __init__: [
    'horizontalPopupMenu',
    'colorPickerPopupProvider'
  ],
  horizontalPopupMenu: [ 'type', HorizontalPopupMenu ],
  colorPickerPopupProvider: [ 'type', ColorPickerPopupProvider ]
};