import { expect } from 'chai';

import TestContainer from 'mocha-test-container-support';

import {
  clearBpmnJS,
  setBpmnJS,
  insertCoreStyles,
  insertBpmnStyles,
  insertCSS,
  enableLogging
} from 'test/TestHelper';

import axe from 'axe-core';

import { waitFor } from '@testing-library/preact';

import { query as domQuery } from 'min-dom';

import Modeler from 'bpmn-js/lib/Modeler';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule,
  ZeebeTooltipProvider as TooltipProvider
} from 'bpmn-js-properties-panel';

import ZeebeBehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import { CloudElementTemplatesPropertiesProviderModule } from 'bpmn-js-element-templates';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

import BpmnJSColorPicker from 'bpmn-js-color-picker';

import CanvasLockModule from '@bpmn-io/diagram-js-canvas-lock';

import { BpmnImprovedCanvasModule } from 'lib/';


const singleStart = window.__env__ && window.__env__.SINGLE_START === 'bpmn';

insertCoreStyles();
insertBpmnStyles();
insertCSS(
  'canvas-lock.css',
  require('@bpmn-io/diagram-js-canvas-lock/assets/canvas-lock.css').default
);

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
        BpmnImprovedCanvasModule,
        BpmnJSColorPicker,
        CanvasLockModule,
        CloudElementTemplatesPropertiesProviderModule
      ],
      moddleExtensions = {
        zeebe: ZeebeModdle
      },
      layout = {},
      refactorings = {
        openai: {
          createChatCompletion: () => null
        }
      }
    } = options;

    clearBpmnJS();

    const modeler = new BpmnJS({
      container: modelerContainer,
      additionalModules,
      moddleExtensions,
      propertiesPanel: {
        parent: propertiesContainer,
        feelTooltipContainer: container,
        description: TooltipProvider,
        layout
      },
      refactorings,
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

    expect(result.modeler.get('canvas').getContainer().classList.contains('bio-improved-canvas')).to.be.true;

    // add a button to toggle the canvas lock for interactive play
    if (singleStart) {
      const canvasLock = result.modeler.get('canvasLock');

      const button = document.createElement('button');

      button.textContent = 'Toggle canvas lock';
      button.style.cssText = 'position: absolute; top: 10px; right: 10px; z-index: 100;';

      button.addEventListener('click', () => {
        canvasLock.isLocked() ? canvasLock.unlock() : canvasLock.lock();
      });

      modelerContainer.appendChild(button);
    }
  });


  describe('accessibility', function() {

    it('should have no violations (context pad)', async function() {

      // given
      const diagramXml = require('test/fixtures/simple.bpmn').default;

      const result = await createModeler(
        diagramXml
      );

      expect(result.error).not.to.exist;

      // when
      const { modeler } = result;

      modeler.get('selection').select(modeler.get('elementRegistry').get('StartEvent_1'));

      // then
      await waitFor(() => {
        expect(domQuery('.djs-context-pad', modelerContainer)).to.exist;
      });

      const results = await axe.run(domQuery('.djs-context-pad', modelerContainer));

      if (results.violations.length) {
        console.error(results.violations);
      }

      expect(results.passes).to.be.not.empty;
      expect(results.violations).to.be.empty;
    });

  });

});