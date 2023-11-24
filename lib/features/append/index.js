import AppendNode from './AppendNode';
import AppendNodeProvider from './AppendNodeProvider';

export default {
  __init__: [
    'appendNode',
    'appendNodeProvider'
  ],
  appendNode: [ 'type', AppendNode ],
  appendNodeProvider: [ 'type', AppendNodeProvider ]
};