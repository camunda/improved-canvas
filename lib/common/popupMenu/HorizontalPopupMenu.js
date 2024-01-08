import { insertCSS } from '../../util';

import popupMenuCSS from '../../../assets/popup-menu.css';
import baseCSS from '../../../assets/base.css';


export default function HorizontalPopupMenu() {

  insertCSS('base', baseCSS);
  insertCSS('popup-menu', popupMenuCSS);
}
