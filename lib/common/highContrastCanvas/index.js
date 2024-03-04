import HighContrastCanvas from './HighContrastCanvas';

import improvedCanvas from '../improvedCanvas';

import gridModule from 'diagram-js-grid';

export default {
  __init__: [
    'highContrastCanvas'
  ],
  __depends__: [
    gridModule,
    improvedCanvas
  ],
  highContrastCanvas: [ 'type', HighContrastCanvas ]
};
