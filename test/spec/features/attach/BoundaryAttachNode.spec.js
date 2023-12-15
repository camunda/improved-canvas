import {
  insertCoreStyles,
  insertBpmnStyles,
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import Attach from 'lib/features/attach';

import {
  CreateAppendAnythingModule
} from 'bpmn-js-create-append-anything';

import diagramXML from './BoundaryAttachNode.bpmn';
import { is } from 'bpmn-js/lib/util/ModelUtil';

insertCoreStyles();
insertBpmnStyles();

describe('<BoudaryAppendNode>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      Attach,
      CreateAppendAnythingModule
    ]
  }));


  describe('render', function() {

    it('should show append node on element select', inject(function(elementRegistry, selection) {

      // given
      const shape = elementRegistry.get('Task');

      // when
      selection.select(shape);

      // then
      expect(domQuery('.djs-attach-node')).to.exist;
    }));


    it('should hide append node on element deselect', inject(function(elementRegistry, selection) {

      // given
      const shape = elementRegistry.get('Task');
      selection.select(shape);

      // when
      selection.deselect(shape);

      // then
      expect(domQuery('.djs-attach-node')).not.to.exist;
    }));


    it('should re-render on elements changed', inject(function(elementRegistry, selection, boundaryAttachNode, modeling) {

      // given
      const shape = elementRegistry.get('Task');
      const spy = sinon.spy(boundaryAttachNode, 'show');
      selection.select(shape);

      // when
      modeling.updateProperties(shape, { name: 'foo' });

      // then
      expect(spy).to.have.been.calledTwice;
    }));


    it('should render only one node', inject(function(elementRegistry, selection) {

      // given
      const shape = elementRegistry.get('Task');
      const event = elementRegistry.get('Task_2');

      // when
      selection.select(shape);
      selection.select(event);

      // then
      expect(domQueryAll('.djs-attach-node')).to.have.length(1);
    }));


    it('should not show for multiple selection', inject(function(elementRegistry, selection) {

      // given
      const shape = elementRegistry.get('Task');
      const event = elementRegistry.get('StartEvent');

      // when
      selection.select([ shape, event ]);

      // then
      expect(domQuery('.djs-attach-node')).not.to.exist;
    }));


    it('should not show for non allowed element', inject(function(elementRegistry, selection, boundaryAttachNode) {

      // given
      const shape = elementRegistry.get('Task');

      boundaryAttachNode.registerProvider({
        getActions: function() {
          return {};
        },
        isAllowed: function(target) {
          return !is(target, 'bpmn:Task');
        }
      });

      // when
      selection.select(shape);

      // then
      expect(domQuery('.djs-attach-node')).not.to.exist;
    }));

  });


  describe('events', function() {

    it('should trigger on click event', inject(function(elementRegistry, boundaryAttachNode) {

      // given
      const shape = elementRegistry.get('Task');
      const spy = sinon.stub(boundaryAttachNode, 'trigger');

      boundaryAttachNode.show(shape);
      const node = domQuery('.djs-append-node-circle');

      // when

      const event = new MouseEvent('click', {
        bubbles: true
      });
      node.dispatchEvent(event);


      // then
      expect(spy).to.have.been.calledWith('click', event);
    }));


    it('should trigger on dragstart event', inject(function(elementRegistry, boundaryAttachNode) {

      // given
      const shape = elementRegistry.get('Task');
      const spy = sinon.stub(boundaryAttachNode, 'trigger');

      boundaryAttachNode.show(shape);
      const node = domQuery('.djs-append-node-circle');

      // when

      const event = new MouseEvent('dragstart', {
        bubbles: true
      });
      node.dispatchEvent(event);

      // then
      expect(spy).to.have.been.calledWith('dragstart', event);

    }));

  });


  describe('API', function() {

    it('#show', inject(function(elementRegistry, boundaryAttachNode) {

      // given
      const shape = elementRegistry.get('Task');

      // when
      boundaryAttachNode.show(shape);

      // then
      expect(domQuery('.djs-attach-node')).to.exist;
    }));


    it('#hide', inject(function(elementRegistry, boundaryAttachNode) {

      // given
      const shape = elementRegistry.get('Task');
      boundaryAttachNode.show(shape);

      // when
      boundaryAttachNode.hide();

      // then
      expect(domQuery('.djs-attach-node')).not.to.exist;
    }));


    it('#isShown', inject(function(elementRegistry, boundaryAttachNode) {

      // given
      const shape = elementRegistry.get('Task');

      // when
      boundaryAttachNode.show(shape);

      // then
      expect(boundaryAttachNode.isShown()).to.be.true;

      // when
      boundaryAttachNode.hide(shape);

      // then
      expect(boundaryAttachNode.isShown()).to.be.false;
    }));



    it('#isShown with target', inject(function(elementRegistry, boundaryAttachNode) {

      // given
      const shape = elementRegistry.get('Task');

      // when
      boundaryAttachNode.show(shape);

      // then
      expect(boundaryAttachNode.isShown(shape)).to.be.true;

      // when
      boundaryAttachNode.hide(shape);

      // then
      expect(boundaryAttachNode.isShown(shape)).to.be.false;
    }));


    it('#registerProvider', inject(function(boundaryAttachNode) {

      // given
      const provider = { getActions: () => {} };

      // when
      boundaryAttachNode.registerProvider(provider);

      // then
      expect(boundaryAttachNode._provider).to.equal(provider);
    }));


    it('#trigger', inject(function(elementRegistry, boundaryAttachNode) {

      // given
      const shape = elementRegistry.get('Task');
      const spy = sinon.spy();

      boundaryAttachNode.registerProvider({
        getActions: function() {
          return {
            'click': spy
          };
        },
        isAllowed: function() {
          return true;
        }
      });

      boundaryAttachNode.show(shape);

      // when
      boundaryAttachNode.trigger('click', shape);

      // then
      expect(spy).to.have.been.called;

    }));


    it('#trigger - node not shown', inject(function(elementRegistry, boundaryAttachNode) {

      // given
      const shape = elementRegistry.get('Task');
      const spy = sinon.spy();

      boundaryAttachNode.registerProvider({
        getActions: function() {
          return {
            'click': spy
          };
        },
        isAllowed: function() {
          return true;
        }
      });

      // when
      boundaryAttachNode.trigger('click', shape);

      // then
      expect(spy).to.not.have.been.called;
    }));

  });

});
