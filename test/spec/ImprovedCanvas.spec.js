import TestContainer from 'mocha-test-container-support';

import {
  clearBpmnJS,
  setBpmnJS,
  insertCoreStyles,
  insertBpmnStyles,
  enableLogging
} from 'test/TestHelper';

import Modeler from 'bpmn-js/lib/Modeler';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule,
  ZeebeTooltipProvider as TooltipProvider
} from 'bpmn-js-properties-panel';

import ZeebeBehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

import ImprovedCanvasModule from 'lib/';


const singleStart = window.__env__ && window.__env__.SINGLE_START;

insertCoreStyles();
insertBpmnStyles();

describe('<Example>', function() {

  let modelerContainer;

  let propertiesContainer;

  let container;

  beforeEach(function() {
    modelerContainer = document.createElement('div');
    modelerContainer.classList.add('modeler-container');

    propertiesContainer = document.createElement('div');
    propertiesContainer.classList.add('properties-container');

    container = TestContainer.get(this);

    container.appendChild(modelerContainer);
    container.appendChild(propertiesContainer);
  });

  async function createModeler(xml, options = {}, BpmnJS = Modeler) {
    const {
      shouldImport = true,
      additionalModules = [
        ZeebeBehaviorsModule,
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        ZeebePropertiesProviderModule,
        ImprovedCanvasModule
      ],
      moddleExtensions = {
        zeebe: ZeebeModdle
      },
      layout = {}
    } = options;

    clearBpmnJS();

    const modeler = new BpmnJS({
      container: modelerContainer,
      keyboard: {
        bindTo: document
      },
      additionalModules,
      moddleExtensions,
      propertiesPanel: {
        parent: propertiesContainer,
        feelTooltipContainer: container,
        description: TooltipProvider,
        layout
      },
      ...options
    });

    enableLogging && enableLogging(modeler, !!singleStart);

    setBpmnJS(modeler);

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
    const diagramXml = require('test/fixtures/simple.bpmn').default;

    // when
    const result = await createModeler(
      diagramXml
    );

    // then
    expect(result.error).not.to.exist;
  });

});
