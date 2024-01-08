import {
  insertCoreStyles,
  insertBpmnStyles,
  bootstrapModeler,
  inject,
  getBpmnJS
} from 'test/TestHelper';

import { assign } from 'min-dash';

import Attach from 'lib/bpmn/attach';

import diagramXML from './BoundaryAttachNode.bpmn';
import { is } from 'bpmn-js/lib/util/ModelUtil';

insertCoreStyles();
insertBpmnStyles();

describe('<BoundaryAttachNodeProvider>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      Attach
    ]
  }));


  describe('should trigger action', function() {

    it('click', inject(function(elementRegistry, boundaryAttachNode) {

      // given
      const shape = elementRegistry.get('Task');

      // when
      boundaryAttachNode.show(shape);
      boundaryAttachNode.trigger('click', shape);

      // then
      expect(shape.attachers).to.have.length(1);
    }));

    it('dragstart', inject(function(elementRegistry, boundaryAttachNode, dragging) {

      // given
      const shape = elementRegistry.get('Task');
      boundaryAttachNode.show(shape);

      const node = boundaryAttachNode.getNode(shape).html;
      const bbox = node.getBoundingClientRect();
      const event = createEvent(node, { x: bbox.x, y: bbox.y });

      // when
      boundaryAttachNode.trigger('dragstart', event);

      // then
      expect(is(dragging.context().data.shape, 'bpmn:BoundaryEvent')).to.be.true;
    }));

  });


  describe('#isAllowed', function() {

    it('should return true', inject(function(elementRegistry, boundaryAttachNodeProvider) {

      // given
      const shape = elementRegistry.get('Task');

      // when
      const allowed = boundaryAttachNodeProvider.isAllowed(shape);

      // then
      expect(allowed).to.be.true;
    }));


    it('should return false', inject(function(elementRegistry, boundaryAttachNodeProvider) {

      // given
      const notAllowedShapeId = 'StartEvent';
      const shape = elementRegistry.get(notAllowedShapeId);

      // when
      const allowed = boundaryAttachNodeProvider.isAllowed(shape);

      // then
      expect(allowed).to.be.false;
    }));
  });

});


// helpers //////////
function createEvent(target, position, data) {

  return getBpmnJS().invoke(function(eventBus) {
    data = assign({
      target: target,
      clientX: position.x,
      clientY: position.y,
      offsetX: position.x,
      offsetY: position.y,
      button: 0
    }, data || {});

    return eventBus.createEvent(data);
  });
}
