import {
  insertCoreStyles,
  insertBpmnStyles,
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import ImprovedPalette from 'lib/bpmn/palette';

import diagramXML from '../../../fixtures/simple.bpmn';

insertCoreStyles();
insertBpmnStyles();

// mimics the "create element" entry contributed by bpmn-js-create-append-anything
const CREATE_ELLIPSIS_ICON = '<svg class="bpmn-ellipsis"></svg>';

const createEntryProvider = {
  getPaletteEntries() {
    return {
      'create': {
        group: 'create',
        html: `<div class="entry" data-action="create">${CREATE_ELLIPSIS_ICON}</div>`,
        title: 'Create element',
        action: {
          click() {}
        }
      }
    };
  }
};

describe('<ImprovedPalette>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      ImprovedPalette
    ]
  }));


  it('should replace the create entry icon with a "+"', inject(function(palette) {

    // given
    palette.registerProvider(createEntryProvider);

    // when
    const entries = palette.getEntries();

    // then
    expect(entries['create'].html).not.to.contain('bpmn-ellipsis');
    expect(entries['create'].html).to.contain('M5 12h14');
  }));


  it('should keep the create entry action', inject(function(palette) {

    // given
    palette.registerProvider(createEntryProvider);

    // when
    const entries = palette.getEntries();

    // then
    expect(entries['create'].action).to.exist;
  }));

});
