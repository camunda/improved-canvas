import AlignElementsPopupProvider from './AlignElementsPopupProvider';
import HorizontalPopupMenu from '../../common/popupMenu';

export default {
  __depends__: [
    HorizontalPopupMenu
  ],
  __init__: [
    'alignElementsPopupProvider'
  ],
  alignElementsPopupProvider: [ 'type', AlignElementsPopupProvider ]
};