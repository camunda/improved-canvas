import AppendCanvasLock from './AppendCanvasLock';

import AppendCreatePadModule from '../appendCreatePad';
import AppendIndicatorModule from '../appendIndicator';

export default {
  __depends__: [
    AppendCreatePadModule,
    AppendIndicatorModule
  ],
  __init__: [ 'appendCanvasLock' ],
  appendCanvasLock: [ 'type', AppendCanvasLock ]
};
