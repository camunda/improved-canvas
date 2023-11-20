import HorizontalPopupMenu from './HorizontalPopupMenu';
import ColorPickerPopupProvider from './ColorPickerPopupProvider';
import AlignElementsPopupProvider from './AlignElementsPopupProvider';

export default {
  __init__: [
    'horizontalPopupMenu',
    'colorPickerPopupProvider',
    'alignElementsPopupProvider'
  ],
  horizontalPopupMenu: [ 'type', HorizontalPopupMenu ],
  colorPickerPopupProvider: [ 'type', ColorPickerPopupProvider ],
  alignElementsPopupProvider: [ 'type', AlignElementsPopupProvider ]
};