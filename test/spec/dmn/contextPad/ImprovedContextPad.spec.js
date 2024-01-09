import {
  insertCoreStyles,
  insertDmnStyles,
  bootstrapModeler,
  inject
} from 'test/DMNTestHelper';

import {
  queryAll as domQueryAll
} from 'min-dom';

import ImprovedContextPad from 'lib/dmn/contextPad';

import diagramXML from 'test/fixtures/simple.dmn';

insertCoreStyles();
insertDmnStyles();

describe('<DMNImprovedContextPad>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    drd: {
      additionalModules: [
        ImprovedContextPad
      ]
    }
  }));


  it('entries', inject(function(elementRegistry, contextPad) {

    // given
    const shape = elementRegistry.get('Decision_1');

    // when
    contextPad.open(shape);

    // then
    const entries = [ ...domQueryAll('.dmn-drd-container .djs-context-pad .entry') ];

    expect(entries.length).to.equal(8);
    expect(entries.map(entry => entry.getAttribute('data-action'))).to.eql([
      'append.decision',
      'append.input-data',
      'append.knowledge-source',
      'append.business-knowledge-model',
      'replace',
      'append.text-annotation',
      'connect',
      'delete'
    ]);
  }));

});
