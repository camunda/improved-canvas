import AppendNode from './AppendNode';
import AppendNodeEditorActions from './AppendEditorActions';
import AppendNodeKeyboardBindings from './AppendKeyboardBindings';

export default {
  __init__: [
    'appendNode',
    'appendNodeEditorActions',
    'appendNodeKeyboardBindings'
  ],
  appendNode: [ 'type', AppendNode ],
  appendNodeEditorActions: [ 'type', AppendNodeEditorActions ],
  appendNodeKeyboardBindings: [ 'type', AppendNodeKeyboardBindings ]
};