import AppendNode from './AppendNode';
import AppendNodeEditorActions from './AppendEditorActions';
import AppendNodeKeyboardBindings from './AppendKeyboardBindings';

import improvedCanvas from '../improvedCanvas';

export default {
  __depends__: [ improvedCanvas ],
  __init__: [
    'appendNode',
    'appendNodeEditorActions',
    'appendNodeKeyboardBindings'
  ],
  appendNode: [ 'type', AppendNode ],
  appendNodeEditorActions: [ 'type', AppendNodeEditorActions ],
  appendNodeKeyboardBindings: [ 'type', AppendNodeKeyboardBindings ]
};