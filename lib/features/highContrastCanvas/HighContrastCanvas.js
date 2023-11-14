import { insertCSS } from '../../util';
import baseCSS from '../../../assets/base.css';
import highContrastCSS from '../../../assets/high-contrast-canvas.css';

export default function HighContrastCanvas() {

  insertCSS('base', baseCSS);
  insertCSS('high-contract-canvas.css', highContrastCSS);

}