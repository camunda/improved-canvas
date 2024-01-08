import {
  bootstrapModeler,
  inject,
  getBpmnJS
} from 'test/TestHelper';

import {
  createKeyEvent
} from 'bpmn-js/test/util/KeyEvents';

import {
  query as domQuery
} from 'min-dom';
import Append from 'lib/bpmn/append';

import { forEach } from 'min-dash';

import {
  CreateAppendAnythingModule
} from 'bpmn-js-create-append-anything';

import diagramXML from './AppendNode.bpmn';

describe('<AppendKeyboardBindings>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      Append,
      CreateAppendAnythingModule
    ]
  }));


  it('should include triggers inside editorActions', inject(function(editorActions) {

    // given
    const expectedActions = [
      'appendNode'
    ];
    const actualActions = editorActions.getActions();

    // then
    expect(
      expectedActions.every(action => actualActions.includes(action))
    ).to.be.true;
  }));


  forEach([ 'a', 'A' ], function(key) {

    it('should trigger append menu',
      inject(function(keyboard, popupMenu, elementRegistry, selection) {

        sinon.spy(popupMenu, 'open');

        // given
        const task = elementRegistry.get('Task');

        selection.select(task);

        const e = createKeyEvent(key);

        // when
        keyboard._keyHandler(e);

        // then
        expect(popupMenu.open).to.have.been.calledOnce;
        expect(isMenu('bpmn-append')).to.be.true;
      }));


    it('should trigger create menu',
      inject(function(keyboard, popupMenu) {

        sinon.spy(popupMenu, 'open');

        // given
        const e = createKeyEvent(key);

        // when
        keyboard._keyHandler(e);

        // then
        expect(popupMenu.open).to.have.been.calledOnce;
        expect(isMenu('bpmn-create')).to.be.true;
      }));


    it('should not trigger create or append menus',
      inject(function(keyboard, popupMenu) {

        sinon.spy(popupMenu, 'open');

        // given
        const e = createKeyEvent(key, { ctrlKey: true });

        // when
        keyboard._keyHandler(e);

        // then
        expect(popupMenu.open).to.not.have.been.called;
      }));

  });

});


// helpers //////////////////////
function isMenu(menuId) {
  const popup = getBpmnJS().get('popupMenu');
  const popupElement = popup._current && domQuery('.djs-popup', popup._current.container);

  return popupElement.classList.contains(menuId);
}