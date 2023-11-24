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

import Append from 'lib/features/append';

import {
  CreateAppendAnythingModule
} from 'bpmn-js-create-append-anything';

import diagramXML from './AppendNode.bpmn';
import { is } from 'bpmn-js/lib/util/ModelUtil';

insertCoreStyles();
insertBpmnStyles();

describe('<AppendNode>', function() {

  function bootstrap(diagramXML) {

    return function() {
      return bootstrapModeler(diagramXML, {
        additionalModules: [
          Append,
          CreateAppendAnythingModule
        ]
      })();
    };
  }

  beforeEach(bootstrap(diagramXML));


  describe('render', function() {

    it('should show append node on element select', inject(function(elementRegistry, selection) {

      // given
      const shape = elementRegistry.get('Task');

      // when
      selection.select(shape);

      // then
      expect(domQuery('.djs-append-node')).to.exist;
    }));


    it('should hide append node on element deselect', inject(function(elementRegistry, selection) {

      // given
      const shape = elementRegistry.get('Task');
      selection.select(shape);

      // when
      selection.deselect(shape);

      // then
      expect(domQuery('.djs-append-node')).not.to.exist;
    }));


    it('should re-render on elements changed', inject(function(elementRegistry, selection, appendNode, modeling) {

      // given
      const shape = elementRegistry.get('Task');
      const spy = sinon.spy(appendNode, 'show');
      selection.select(shape);

      // when
      modeling.updateProperties(shape, { name: 'foo' });

      // then
      expect(spy).to.have.been.calledTwice;
    }));


    it('should render only one node', inject(function(elementRegistry, selection) {

      // given
      const shape = elementRegistry.get('Task');
      const event = elementRegistry.get('StartEvent');

      // when
      selection.select(shape);
      selection.select(event);

      // then
      expect(domQueryAll('.djs-append-node')).to.have.length(1);
    }));


    it('should not show for multiple selection', inject(function(elementRegistry, selection) {

      // given
      const shape = elementRegistry.get('Task');
      const event = elementRegistry.get('StartEvent');

      // when
      selection.select([ shape, event ]);

      // then
      expect(domQuery('.djs-append-node')).not.to.exist;
    }));


    it('should not show for non allowed element', inject(function(elementRegistry, selection, appendNode) {

      // given
      const shape = elementRegistry.get('Task');

      appendNode.registerProvider({
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
      expect(domQuery('.djs-append-node')).not.to.exist;
    }));

  });


  describe('events', function() {

    it('should trigger on click event', inject(function(elementRegistry, appendNode) {

      // given
      const shape = elementRegistry.get('Task');
      const spy = sinon.stub(appendNode, 'trigger');

      appendNode.show(shape);
      const node = domQuery('.djs-append-node-circle');

      // when

      const event = new MouseEvent('click', {
        bubbles: true
      });
      node.dispatchEvent(event);


      // then
      expect(spy).to.have.been.calledWith('click', event);
    }));


    it('should trigger on dragstart event', inject(function(elementRegistry, appendNode) {

      // given
      const shape = elementRegistry.get('Task');
      const spy = sinon.stub(appendNode, 'trigger');

      appendNode.show(shape);
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

    it('#show', inject(function(elementRegistry, appendNode) {

      // given
      const shape = elementRegistry.get('Task');

      // when
      appendNode.show(shape);

      // then
      expect(domQuery('.djs-append-node')).to.exist;
    }));


    it('#hide', inject(function(elementRegistry, appendNode) {

      // given
      const shape = elementRegistry.get('Task');
      appendNode.show(shape);

      // when
      appendNode.hide();

      // then
      expect(domQuery('.djs-append-node')).not.to.exist;
    }));


    it('#isShown', inject(function(elementRegistry, appendNode) {

      // given
      const shape = elementRegistry.get('Task');

      // when
      appendNode.show(shape);

      // then
      expect(appendNode.isShown()).to.be.true;

      // when
      appendNode.hide(shape);

      // then
      expect(appendNode.isShown()).to.be.false;
    }));



    it('#isShown with target', inject(function(elementRegistry, appendNode) {

      // given
      const shape = elementRegistry.get('Task');

      // when
      appendNode.show(shape);

      // then
      expect(appendNode.isShown(shape)).to.be.true;

      // when
      appendNode.hide(shape);

      // then
      expect(appendNode.isShown(shape)).to.be.false;
    }));


    it('#registerProvider', inject(function(appendNode) {

      // given
      const provider = { getActions: () => {} };

      // when
      appendNode.registerProvider(provider);

      // then
      expect(appendNode._provider).to.equal(provider);
    }));


    it('#trigger', inject(function(elementRegistry, appendNode) {

      // given
      const shape = elementRegistry.get('Task');
      const spy = sinon.spy();

      appendNode.registerProvider({
        getActions: function() {
          return {
            'click': spy
          };
        },
        isAllowed: function() {
          return true;
        }
      });

      appendNode.show(shape);

      // when
      appendNode.trigger('click', shape);

      // then
      expect(spy).to.have.been.called;

    }));


    it('#trigger - node not shown', inject(function(elementRegistry, appendNode) {

      // given
      const shape = elementRegistry.get('Task');
      const spy = sinon.spy();

      appendNode.registerProvider({
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
      appendNode.trigger('click', shape);

      // then
      expect(spy).to.not.have.been.called;
    }));

  });

});
