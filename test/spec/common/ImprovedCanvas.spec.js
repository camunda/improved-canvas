import { bootstrapModeler } from 'test/TestHelper';

import {
  queryAll as domQueryAll
} from 'min-dom';

import { BpmnImprovedCanvasModule } from 'lib';

import diagramXML from '../../fixtures/simple.bpmn';

describe('<ImprovedCanvas>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      BpmnImprovedCanvasModule
    ]
  }));


  it('should add styles once', function() {

    // then
    expect(domQueryAll('[data-css-file="bio-improved-canvas-append"]')).to.have.length(1);
    expect(domQueryAll('[data-css-file="bio-improved-canvas-base"]')).to.have.length(1);
    expect(domQueryAll('[data-css-file="bio-improved-canvas-context-pad"]')).to.have.length(1);
    expect(domQueryAll('[data-css-file="bio-improved-canvas-high-contrast-canvas"]')).to.have.length(1);
    expect(domQueryAll('[data-css-file="bio-improved-canvas-popup-menu"]')).to.have.length(1);
  });

});
