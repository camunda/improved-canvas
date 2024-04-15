import AppendCreatePad from './AppendCreatePad';
import AppendEditorActions from './AppendEditorActions';
import AppendKeyboardBindings from './AppendKeyboardBindings';

import ImprovedCanvasModule from '../../common/improvedCanvas';

import { CreateAppendAnythingModule } from 'bpmn-js-create-append-anything';

export default {
  __depends__: [
    CreateAppendAnythingModule,
    ImprovedCanvasModule
  ],
  __init__: [
    'appendCreatePad',
    'appendEditorActions',
    'appendKeyboardBindings'
  ],
  appendCreatePad: [ 'type', AppendCreatePad ],
  appendEditorActions: [ 'type', AppendEditorActions ],
  appendKeyboardBindings: [ 'type', AppendKeyboardBindings ]
};