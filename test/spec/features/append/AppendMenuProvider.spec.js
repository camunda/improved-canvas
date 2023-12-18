import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';
import Append from 'lib/features/append';

import {
  CreateAppendAnythingModule
} from 'bpmn-js-create-append-anything';

import diagramXML from './AppendNode.bpmn';

describe('<AppendMenuProvider>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      Append,
      CreateAppendAnythingModule
    ]
  }));


  it('should render group', inject(function(elementRegistry, appendNode) {

    // given
    const shape = elementRegistry.get('Task');

    // when
    appendNode.show(shape);
    appendNode.trigger('click', shape);

    // then
    const entries = domQueryAll('.djs-popup-group[data-group="common"] .entry');
    expect(entries).to.have.length(3);
    expect(entries[0].title).to.equal('Task');
    expect(entries[1].title).to.equal('Exclusive Gateway');
    expect(entries[2].title).to.equal('End Event');

    expect(domQuery(".djs-popup .entry-header[title='Common']")).to.exist;
  }));

});
