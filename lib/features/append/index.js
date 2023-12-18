import AppendNode from './AppendNode';
import AppendNodeProvider from './AppendNodeProvider';
import AppendCommonMenuProvider from './AppendMenuProvider';

export default {
  __init__: [
    'appendNode',
    'appendNodeProvider',
    'appendCommonMenuProvider'
  ],
  appendNode: [ 'type', AppendNode ],
  appendNodeProvider: [ 'type', AppendNodeProvider ],
  appendCommonMenuProvider: [ 'type', AppendCommonMenuProvider ]
};