import MochaTestContainer from 'mocha-test-container-support';
import { insertCSS } from 'dmn-js/test/helper';

import DmnJS from 'dmn-js/lib/Modeler';


let DMN_JS;


export function bootstrapDmnJS(diagram, options = {}) {
  return function() {

    insertCoreStyles();
    insertDmnStyles();
    const testContainer = MochaTestContainer.get(this);

    const container = document.createElement('div');
    container.classList.add('container');

    const propertiesContainer = document.createElement('div');
    propertiesContainer.classList.add('properties-container');

    const overviewContainer = document.createElement('div');
    overviewContainer.classList.add('overview-container');

    testContainer.append(overviewContainer, container, propertiesContainer);

    const editor = new DmnJS({
      container: container,
      ...options,
      common: {
        propertiesPanel: {
          parent: propertiesContainer
        },
        overview: {
          parent: overviewContainer
        },
        ...options.common
      }
    });

    DMN_JS = window.DMN_JS = editor;

    return editor.importXML(diagram);
  };
}

export function bootstrapModeler(diagram, options = {}) {
  return bootstrapDmnJS(diagram, options);
}

export function getDmnJS() {
  return DMN_JS;
}

export function inject(fn) {
  return function() {
    return DMN_JS.getActiveViewer().invoke(fn);
  };
}

export function insertCoreStyles() {
  insertCSS(
    'properties-panel.css',
    require('@bpmn-io/properties-panel/dist/assets/properties-panel.css').default
  );

  insertCSS(
    'test.css',
    require('./test.css').default
  );
}

export function insertDmnStyles() {

  insertCSS(
    'diagram.css',
    require('dmn-js/dist/assets/diagram-js.css').default
  );

  insertCSS('dmn.css',
    require('dmn-js/dist/assets/dmn-font/css/dmn.css').default
  );

  insertCSS('dmn-font.css',
    require('dmn-js/dist/assets/dmn-font/css/dmn-embedded.css').default
  );

  insertCSS('dmn-js-shared.css',
    require('dmn-js/dist/assets/dmn-js-shared.css').default
  );

  insertCSS('dmn-js-drd.css',
    require('dmn-js/dist/assets/dmn-js-drd.css').default
  );

  insertCSS('dmn-js-decision-table.css',
    require('dmn-js/dist/assets/dmn-js-decision-table.css').default
  );

  insertCSS('dmn-decision-table-controls.css',
    require('dmn-js/dist/assets/dmn-js-decision-table-controls.css').default
  );

  insertCSS('dmn-js-literal-expression.css',
    require('dmn-js/dist/assets/dmn-js-literal-expression.css').default
  );
}


export function clearDmnJS(instance) {

  // clean up old dmn-js instance
  if (DMN_JS) {
    DMN_JS.destroy();

    DMN_JS = null;
  }
}

export function setDmnJS(instance) {
  DMN_JS = instance;
}
