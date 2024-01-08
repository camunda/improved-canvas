import AppendNode from '../../common/append';
import AppendNodeProvider from './AppendNodeProvider';
import AppendCommonMenuProvider from './AppendMenuProvider';

export default {
  __depends__: [
    AppendNode
  ],
  __init__: [
    'appendNodeProvider',
    'appendCommonMenuProvider'
  ],
  appendNodeProvider: [ 'type', AppendNodeProvider ],
  appendCommonMenuProvider: [ 'type', AppendCommonMenuProvider ]
};