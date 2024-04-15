import AttachCreatePad from './AttachCreatePad';
import AttachPreview from './AttachPreview';

import ImprovedCanvasModule from '../../common/improvedCanvas';

import { CreateAppendAnythingModule } from 'bpmn-js-create-append-anything';

export default {
  __depends__: [
    CreateAppendAnythingModule,
    ImprovedCanvasModule
  ],
  __init__: [
    'attachCreatePad',
    'attachPreview'
  ],
  attachCreatePad: [ 'type', AttachCreatePad ],
  attachPreview: [ 'type', AttachPreview ]
};