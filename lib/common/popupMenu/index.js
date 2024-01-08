import HorizontalPopupMenu from './HorizontalPopupMenu';
import ColorPickerPopupProvider from './ColorPickerPopupProvider';

export default {
  __init__: [
    'horizontalPopupMenu',
    'colorPickerPopupProvider',
  ],
  horizontalPopupMenu: [ 'type', HorizontalPopupMenu ],
  colorPickerPopupProvider: [ 'type', ColorPickerPopupProvider ]
};