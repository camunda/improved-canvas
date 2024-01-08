import HighContrastCanvas from './HighContrastCanvas';

import gridModule from 'diagram-js-grid';

export default {
  __init__: [
    'highContrastCanvas',
  ],
  __depends__: [
    gridModule,
  ],
  highContrastCanvas: [ 'type', HighContrastCanvas ],
};
