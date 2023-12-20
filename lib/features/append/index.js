import AppendNode from './AppendNode';
import AppendNodeProvider from './AppendNodeProvider';
import AppendCommonMenuProvider from './AppendMenuProvider';
import AppendNodeEditorActions from './AppendEditorActions';
import AppendNodeKeyboardBindings from './AppendKeyboardBindings';

export default {
  __init__: [
    'appendNode',
    'appendNodeProvider',
    'appendCommonMenuProvider',
    'appendNodeEditorActions',
    'appendNodeKeyboardBindings'
  ],
  appendNode: [ 'type', AppendNode ],
  appendNodeProvider: [ 'type', AppendNodeProvider ],
  appendCommonMenuProvider: [ 'type', AppendCommonMenuProvider ],
  appendNodeEditorActions: [ 'type', AppendNodeEditorActions ],
  appendNodeKeyboardBindings: [ 'type', AppendNodeKeyboardBindings ]
};