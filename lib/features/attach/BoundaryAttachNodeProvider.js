import { isEventSubProcess } from 'bpmn-js/lib/util/DiUtil';
import { is } from 'bpmn-js/lib/util/ModelUtil';

import { getBBox } from 'diagram-js/lib/util/Elements';

export default function BoundaryNodeProvider(
    boundaryAttachNode, elementFactory, create,
    modeling, selection) {

  this._elementFactory = elementFactory;
  this._create = create;
  this._modeling = modeling;
  this._selection = selection;

  boundaryAttachNode.registerProvider(this);
}

BoundaryNodeProvider.prototype.isAllowed = function(target) {
  return is(target, 'bpmn:Task') ||
        (is(target, 'bpmn:SubProcess') && !isEventSubProcess);
};

BoundaryNodeProvider.prototype.getActions = function() {
  const elementFactory = this._elementFactory,
        create = this._create,
        modeling = this._modeling,
        selection = this._selection;

  const type = 'bpmn:BoundaryEvent';

  function createBoundaryEvent(event, element) {
    const shape = elementFactory.createShape({ type });

    create.start(event, shape, {
      source: element
    });
  }

  return {
    'click': (event, element) => {

      var shape = elementFactory.createShape({ type });

      const bbox = getBBox(element);
      const position = {
        x: bbox.x + bbox.width / 2,
        y: bbox.y + bbox.height
      };

      if (!element.attachers.length) {
        modeling.createElements(shape, position, element, { attach: true });
        selection.select(shape);
      } else {
        createBoundaryEvent(event, element);
      }

    },
    'dragstart': createBoundaryEvent
  };
};

BoundaryNodeProvider.$inject = [
  'boundaryAttachNode',
  'elementFactory',
  'create',
  'modeling',
  'selection'
];
