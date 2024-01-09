import TestContainer from 'mocha-test-container-support';

import {
  clearDmnJS,
  setDmnJS,
  insertCoreStyles,
  insertDmnStyles,
} from 'test/DMNTestHelper';

import DmnModeler from 'dmn-js/lib/Modeler';

import {
  DmnPropertiesPanelModule,
  DmnPropertiesProviderModule,
} from 'dmn-js-properties-panel';

import { DmnImprovedCanvasModule } from 'lib/';


const singleStart = window.__env__ && window.__env__.SINGLE_START === 'dmn';

insertCoreStyles();
insertDmnStyles();

describe('<DMNImprovedCanvas>', function() {

  let modelerContainer;

  let propertiesContainer;

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);

    modelerContainer = document.createElement('div');
    modelerContainer.classList.add('modeler-container');

    propertiesContainer = document.createElement('div');
    propertiesContainer.classList.add('properties-container');

    container.appendChild(modelerContainer);
    container.appendChild(propertiesContainer);
  });

  async function createModeler(xml, options = {}) {

    clearDmnJS();

    const {
      shouldImport = true,
      common,
      ...restOptions
    } = options;

    const modeler = new DmnModeler({
      container: modelerContainer,
      drd: {
        additionalModules: [
          DmnPropertiesPanelModule,
          DmnPropertiesProviderModule,
          DmnImprovedCanvasModule
        ]
      },
      common:{
        propertiesPanel: {
          parent: propertiesContainer
        },
        ...common
      },
      ...restOptions
    });

    setDmnJS(modeler);

    modeler.on('commandStack.changed', function() {
      modeler.saveXML({ format: true }).then(function(result) {
        console.log(result.xml);
      });
    });

    if (!shouldImport) {
      return { modeler };
    }

    try {
      const result = await modeler.importXML(xml);

      return { error: null, warnings: result.warnings, modeler: modeler };
    } catch (err) {
      return { error: err, warnings: err.warnings, modeler: modeler };
    }
  }

  (singleStart ? it.only : it)('should render', async function() {

    // given
    const diagramXml = require('test/fixtures/simple.dmn').default;

    // when
    const result = await createModeler(
      diagramXml
    );

    // then
    expect(result.error).not.to.exist;
  });

});
