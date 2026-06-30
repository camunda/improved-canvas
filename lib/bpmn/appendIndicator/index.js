import AppendIndicator from './AppendIndicator';

import AppendCreatePadModule from '../appendCreatePad';

export default {
  __depends__: [ AppendCreatePadModule ],
  __init__: [ 'appendIndicator' ],
  appendIndicator: [ 'type', AppendIndicator ]
};
