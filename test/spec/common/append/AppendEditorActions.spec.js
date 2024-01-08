import {
  bootstrapModeler,
  inject,
  getBpmnJS
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';
import Append from 'lib/bpmn/append';

import {
  CreateAppendAnythingModule
} from 'bpmn-js-create-append-anything';

import diagramXML from './AppendNode.bpmn';

describe('<AppendEditorActions>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      CreateAppendAnythingModule,
      Append
    ]
  }));


  it('should unregister "appendElement"', inject(function(editorActions) {

    // then
    expect(editorActions.isRegistered('appendElement')).to.be.false;
  }));


  describe('#appendNode', function() {

    it('should open append element', inject(function(elementRegistry, selection, editorActions, eventBus) {

      // given
      const element = elementRegistry.get('Task');

      selection.select(element);
      const changedSpy = sinon.spy();

      // when
      eventBus.once('popupMenu.open', changedSpy);

      editorActions.trigger('appendNode', {});

      // then
      expect(changedSpy).to.have.been.called;
      expect(isMenu('bpmn-append')).to.be.true;
    }));


    it('should open create element if multiple elements selected', inject(function(elementRegistry, selection, editorActions, eventBus) {

      // given
      const elementIds = [ 'StartEvent', 'Task' ];
      const elements = elementIds.map(function(id) {
        return elementRegistry.get(id);
      });

      selection.select(elements);
      const changedSpy = sinon.spy();

      // when
      eventBus.once('popupMenu.open', changedSpy);

      editorActions.trigger('appendNode', {});

      // then
      expect(changedSpy).to.have.been.called;
      expect(isMenu('bpmn-create')).to.be.true;
    }));


    it('should open create element if no selection', inject(function(editorActions, eventBus) {

      // given
      const changedSpy = sinon.spy();

      // when
      eventBus.once('popupMenu.open', changedSpy);

      editorActions.trigger('appendNode', {});

      // then
      expect(changedSpy).to.have.been.called;
      expect(isMenu('bpmn-create')).to.be.true;
    }));


    it('should open create element if append not allowed', inject(function(elementRegistry, selection, editorActions, eventBus) {

      // given
      const element = elementRegistry.get('EndEvent');

      selection.select(element);
      const changedSpy = sinon.spy();

      // when
      eventBus.once('popupMenu.open', changedSpy);

      editorActions.trigger('appendNode', {});

      // then
      expect(changedSpy).to.have.been.called;
      expect(isMenu('bpmn-create')).to.be.true;
    }));

  });

});

// helpers //////////////////////
function isMenu(menuId) {
  const popup = getBpmnJS().get('popupMenu');
  const popupElement = popup._current && domQuery('.djs-popup', popup._current.container);

  return popupElement.classList.contains(menuId);
}