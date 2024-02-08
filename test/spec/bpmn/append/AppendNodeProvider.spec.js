import {
  insertCoreStyles,
  insertBpmnStyles,
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import Append from 'lib/bpmn/append';

import {
  CreateAppendAnythingModule
} from 'bpmn-js-create-append-anything';

import diagramXML from '../../common/append/AppendNode.bpmn';

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

    it('should return true', inject(function(elementRegistry, appendNode) {

      // given
      const shape = elementRegistry.get('Task');

      // when
      const allowed = appendNode.isAllowed(shape);

      // then
      expect(allowed).to.be.true;
    }));


    describe('should return false', function() {

      [
        'EndEvent',
        'Group',
        'TextAnnotation',
        'Lane',
        'Participant',
        'DataStoreReference',
        'DataObjectReference',
        'SequenceFlow_1'
      ].forEach(function(id) {

        it(`should disallow for element <${id}>`, inject(function(appendNode, elementRegistry, popupMenu) {

          // given
          popupMenu.registerProvider('bpmn-append', {
            getPopupMenuEntries: () => entries => entries,
            getPopupMenuHeaderEntries: () => headerEntries => {
              return {
                ...headerEntries,
                foo: {
                  action: () => {}
                }
              };
            }
          });

          const shape = elementRegistry.get(id);

          // when
          const allowed = appendNode.isAllowed(shape);

          // then
          expect(allowed).to.be.false;
        }));

      });

    });

  });

});
