import {
  insertCoreStyles,
  insertBpmnStyles,
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import {
  forEach
} from 'min-dash';

import Append from 'lib/features/append';

import {
  CreateAppendAnythingModule
} from 'bpmn-js-create-append-anything';

import diagramXML from './AppendNode.bpmn';

insertCoreStyles();
insertBpmnStyles();

describe('<AppendNodeProvider>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      Append,
      CreateAppendAnythingModule
    ]
  }));


  describe('should trigger action', function() {

    it('click', inject(function(elementRegistry, appendNode) {

      // given
      const shape = elementRegistry.get('Task');

      // when
      appendNode.show(shape);
      appendNode.trigger('click', shape);

      // then
      expect(domQuery('.djs-popup.bpmn-append')).to.exist;
    }));

    it('dragstart', inject(function(elementRegistry, appendNode, dragging) {

      // given
      const shape = elementRegistry.get('Task');

      // when
      appendNode.show(shape);
      appendNode.trigger('dragstart', shape);

      // then
      expect(dragging.context().data.context.start).to.eql(shape);
    }));

  });


  describe('#isAllowed', function() {

    it('should return true', inject(function(elementRegistry, appendNodeProvider) {

      // given
      const shape = elementRegistry.get('Task');

      // when
      const allowed = appendNodeProvider.isAllowed(shape);

      // then
      expect(allowed).to.be.true;
    }));


    describe('should return false', function() {

      // given
      const ids = [
        'EndEvent',
        'Group',
        'TextAnnotation',
        'Lane',
        'Participant',
        'DataStoreReference',
        'DataObjectReference'
      ];

      forEach(ids, function(id) {

        it(`should dissalow for element <${id}>`, inject(function(elementRegistry, appendNodeProvider) {
          const shape = elementRegistry.get(id);

          // when
          const allowed = appendNodeProvider.isAllowed(shape);

          // then
          expect(allowed).to.be.false;
        }));
      });
    });

  });

});
