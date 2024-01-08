import Append from '../append';

import BoundaryAttachNode from '../attach/BoundaryAttachNode';
import BoundaryAttachNodeProvider from '../attach/BoundaryAttachNodeProvider';

export default {
  __init__: [
    'boundaryAttachNode',
    'boundaryAttachNodeProvider'
  ],
  __depends__: [
    Append
  ],
  boundaryAttachNode: [ 'type', BoundaryAttachNode ],
  boundaryAttachNodeProvider: [ 'type', BoundaryAttachNodeProvider ]
};