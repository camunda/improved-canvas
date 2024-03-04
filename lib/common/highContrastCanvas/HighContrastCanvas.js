import { insertCSS } from '../../util';
import baseCSS from '../../../assets/base.css';
import highContrastCanvasCSS from '../../../assets/high-contrast-canvas.css';

export default function HighContrastCanvas() {
  insertCSS('base', baseCSS);
  insertCSS('high-contrast-canvas', highContrastCanvasCSS);
}