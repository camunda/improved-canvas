import { expect } from 'chai';
import { spy, useFakeTimers } from 'sinon';

import {
  insertCoreStyles,
  insertBpmnStyles,
  insertCSS,
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { query as domQuery } from 'min-dom';

import CanvasLockModule from '@bpmn-io/diagram-js-canvas-lock';

import AppendIndicator from 'lib/bpmn/appendIndicator';

import AppendCanvasLockModule from 'lib/bpmn/appendCanvasLock';

import diagramXML from './AppendIndicator.bpmn';

insertCoreStyles();
insertBpmnStyles();


describe('<AppendIndicator>', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      AppendIndicator
    ]
  }));


  function getIndicator(id, canvas) {
    return domQuery(`.djs-append-indicator[data-element="${id}"]`, canvas.getContainer());
  }


  it('should show indicator for appendable element without outgoing flow', inject(
    function(canvas) {

      // then
      expect(getIndicator('Task_NoOutgoing', canvas)).to.exist;
    }
  ));


  it('should not show indicator when element has outgoing sequence flow', inject(
    function(canvas) {

      // then
      expect(getIndicator('Task_WithOutgoing', canvas)).not.to.exist;
    }
  ));


  it('should show indicator for a boundary event without outgoing flow', inject(
    function(canvas) {

      // then
      expect(getIndicator('BoundaryEvent_NoOutgoing', canvas)).to.exist;
    }
  ));


  it('should not show indicator for elements inside an ad-hoc subprocess', inject(
    function(canvas) {

      // then
      expect(getIndicator('Task_InAdHoc', canvas)).not.to.exist;
    }
  ));

  it('should not show indicator for a compensation activity', inject(
    function(canvas) {

      // then appending is not allowed after a compensation activity
      expect(getIndicator('Task_Compensation', canvas)).not.to.exist;
    }
  ));


  it('should show indicator after an expanded sub-process', inject(
    function(canvas) {

      // then
      expect(getIndicator('SubProcess_1', canvas)).to.exist;
    }
  ));


  it('should position the indicator past the element right edge', inject(
    function(overlays, elementRegistry) {

      // given
      const element = elementRegistry.get('Task_NoOutgoing');

      // when
      const [ overlay ] = overlays.get({ element, type: 'append-indicator' });

      // then it sits outside the element
      expect(overlay.position.left).to.be.above(element.width);
    }
  ));


  it('should not scale the indicator larger than default when zooming in', inject(
    function(canvas) {

      // given
      canvas.zoom(1);

      const indicator = getIndicator('Task_NoOutgoing', canvas);

      const defaultWidth = indicator.getBoundingClientRect().width;

      // when
      canvas.zoom(2);

      // then it keeps its default size instead of growing with the zoom
      expect(indicator.getBoundingClientRect().width).to.be.closeTo(defaultWidth, 1);
    }
  ));


  it('should open the append menu on hover', inject(
    function(appendCreatePad, canvas, elementRegistry) {

      // given
      const open = spy(appendCreatePad, 'open');

      const indicator = getIndicator('Task_NoOutgoing', canvas);

      // when
      indicator.dispatchEvent(new MouseEvent('mouseenter'));

      // then
      expect(open).to.have.been.calledWith(elementRegistry.get('Task_NoOutgoing'));
    }
  ));


  describe('integration with diagram-js-canvas-lock', function() {

    insertCSS(
      'canvas-lock.css',
      require('@bpmn-io/diagram-js-canvas-lock/assets/canvas-lock.css').default
    );

    beforeEach(bootstrapModeler(diagramXML, {
      additionalModules: [
        AppendCanvasLockModule,
        CanvasLockModule
      ]
    }));


    it('should hide the indicator while the canvas is locked', inject(
      function(canvas, canvasLock) {

        // given
        const indicator = getIndicator('Task_NoOutgoing', canvas);

        // assume
        expect(getComputedStyle(indicator).display).not.to.equal('none');

        // when
        canvasLock.lock();

        // then
        expect(getComputedStyle(indicator).display).to.equal('none');
      }
    ));


    it('should show the indicator again after the canvas is unlocked', inject(
      function(canvas, canvasLock) {

        // given
        const indicator = getIndicator('Task_NoOutgoing', canvas);

        canvasLock.lock();

        // when
        canvasLock.unlock();

        // then
        expect(getComputedStyle(indicator).display).not.to.equal('none');
      }
    ));

  });


  it('should close the append menu shortly after the pointer leaves', inject(
    function(appendCreatePad, canvas) {

      // given
      const clock = useFakeTimers();

      const close = spy(appendCreatePad, 'close');

      const indicator = getIndicator('Task_NoOutgoing', canvas);

      indicator.dispatchEvent(new MouseEvent('mouseenter'));

      const pad = appendCreatePad.getHtml();

      // when
      pad.dispatchEvent(new MouseEvent('mouseleave'));

      clock.tick(500);

      // then
      expect(close).to.have.been.called;

      clock.restore();
    }
  ));


  it('should return to the selected element\'s pad when a hovered pad closes', inject(
    function(appendCreatePad, canvas, elementRegistry, selection) {

      // given a selected element (its pad opens on selection)
      const clock = useFakeTimers();

      const selected = elementRegistry.get('AdHocSubProcess_1');

      selection.select(selected);

      // hovering another element's indicator opens that element's pad instead
      const indicator = getIndicator('Task_NoOutgoing', canvas);

      indicator.dispatchEvent(new MouseEvent('mouseenter'));

      const open = spy(appendCreatePad, 'open');

      const pad = appendCreatePad.getHtml();

      // when the pointer leaves the hovered pad
      pad.dispatchEvent(new MouseEvent('mouseleave'));

      clock.tick(500);

      // then the selected element's pad is restored
      expect(open).to.have.been.calledWith(selected);

      clock.restore();
    }
  ));


  it('should keep other indicators visible while the append menu is open', inject(
    function(appendCreatePad, canvas, elementRegistry) {

      // given
      const other = getIndicator('Task_NoOutgoing', canvas);

      // when opening the menu for a different element
      appendCreatePad.open(elementRegistry.get('AdHocSubProcess_1'));

      // then the other element's indicator stays visible
      expect(other.style.display).not.to.equal('none');
    }
  ));


  it('should hide indicators while dragging and restore them afterwards', inject(
    function(canvas, eventBus) {

      // given
      const indicator = getIndicator('Task_NoOutgoing', canvas);

      // when a drag is active
      eventBus.fire('drag.start', {});

      // then the indicator is hidden
      expect(indicator.style.display).to.equal('none');

      // when the drag settles
      eventBus.fire('drag.cleanup', {});

      // then it is restored
      expect(indicator.style.display).not.to.equal('none');
    }
  ));


  it('should keep the source indicator hidden when a drag starts from its pad', inject(
    function(appendCreatePad, canvas, eventBus, elementRegistry) {

      // given the pad is open for the element (which hides its indicator)
      const indicator = getIndicator('Task_NoOutgoing', canvas);

      appendCreatePad.open(elementRegistry.get('Task_NoOutgoing'));

      // when a drag starts from the pad and the pad closes as a result
      eventBus.fire('drag.start', {});

      appendCreatePad.close();

      // then the indicator does not reappear mid-drag
      expect(indicator.style.display).to.equal('none');
    }
  ));


  it('should hide indicators while a label is edited and restore them afterwards', inject(
    function(canvas, directEditing, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_NoOutgoing');

      // when a label is edited directly
      directEditing.activate(task);

      // then the indicator is hidden so it does not overlap the edit box
      expect(getIndicator('Task_NoOutgoing', canvas).style.display).to.equal('none');

      // when editing ends
      directEditing.cancel();

      // then it is restored
      expect(getIndicator('Task_NoOutgoing', canvas).style.display).not.to.equal('none');
    }
  ));

  it('should keep indicators hidden when a drag-append hands over to editing', inject(
    function(canvas, directEditing, elementRegistry, eventBus) {

      // given a drag-append: editing activates before the drag is cleaned up
      const task = elementRegistry.get('Task_NoOutgoing');

      eventBus.fire('drag.start', {});
      directEditing.activate(task);
      eventBus.fire('drag.cleanup', {});

      // then indicators stay hidden while editing continues
      expect(getIndicator('Task_NoOutgoing', canvas).style.display).to.equal('none');

      // when editing ends
      directEditing.cancel();

      // then they are restored
      expect(getIndicator('Task_NoOutgoing', canvas).style.display).not.to.equal('none');
    }
  ));


  it('should hide the indicator when an outgoing flow is added', inject(
    function(canvas, elementRegistry, modeling) {

      // given
      const source = elementRegistry.get('Task_NoOutgoing');
      const target = elementRegistry.get('Task_WithOutgoing');

      // assume the source has an indicator while unconnected
      expect(getIndicator('Task_NoOutgoing', canvas)).to.exist;

      // when
      modeling.connect(source, target);

      // then
      expect(getIndicator('Task_NoOutgoing', canvas)).not.to.exist;
    }
  ));


  it('should restore the indicator when an outgoing flow is removed', inject(
    function(canvas, elementRegistry, modeling) {

      // given
      const source = elementRegistry.get('Task_NoOutgoing');
      const target = elementRegistry.get('Task_WithOutgoing');

      const connection = modeling.connect(source, target);

      // assume the indicator is gone while connected
      expect(getIndicator('Task_NoOutgoing', canvas)).not.to.exist;

      // when
      modeling.removeConnection(connection);

      // then
      expect(getIndicator('Task_NoOutgoing', canvas)).to.exist;
    }
  ));


  it('should update both indicators when a flow\'s source is reconnected', inject(
    function(canvas, elementRegistry, modeling) {

      // given
      const connection = elementRegistry.get('SequenceFlow_1');
      const newSource = elementRegistry.get('Task_NoOutgoing');

      // assume the old source has no indicator and the new source has one
      expect(getIndicator('Task_WithOutgoing', canvas)).not.to.exist;
      expect(getIndicator('Task_NoOutgoing', canvas)).to.exist;

      // when
      modeling.reconnectStart(connection, newSource, { x: 210, y: 120 });

      // then
      expect(getIndicator('Task_WithOutgoing', canvas)).to.exist;
      expect(getIndicator('Task_NoOutgoing', canvas)).not.to.exist;
    }
  ));


  it('should restore both indicators when a delete is undone', inject(
    function(canvas, elementRegistry, modeling, commandStack) {

      // given
      const source = elementRegistry.get('Task_NoOutgoing');
      const target = elementRegistry.get('Task_WithOutgoing');

      const connection = modeling.connect(source, target);

      modeling.removeConnection(connection);

      // assume the source's indicator is back while disconnected
      expect(getIndicator('Task_NoOutgoing', canvas)).to.exist;

      // when the removal is undone
      commandStack.undo();

      // then the source is connected again and its indicator is gone
      expect(getIndicator('Task_NoOutgoing', canvas)).not.to.exist;
    }
  ));


  it('should restore both indicators when a reconnect is undone', inject(
    function(canvas, elementRegistry, modeling, commandStack) {

      // given
      const connection = elementRegistry.get('SequenceFlow_1');
      const newSource = elementRegistry.get('Task_NoOutgoing');

      modeling.reconnectStart(connection, newSource, { x: 210, y: 120 });

      // when the reconnect is undone
      commandStack.undo();

      // then both ends return to their original indicator state
      expect(getIndicator('Task_WithOutgoing', canvas)).not.to.exist;
      expect(getIndicator('Task_NoOutgoing', canvas)).to.exist;
    }
  ));


  it('should restore the indicator when an append is undone', inject(
    function(canvas, elementRegistry, modeling, commandStack) {

      // given
      const source = elementRegistry.get('Task_NoOutgoing');

      modeling.appendShape(source, { type: 'bpmn:Task' }, { x: 400, y: 120 });

      // assume the source's indicator is gone once it has an outgoing flow
      expect(getIndicator('Task_NoOutgoing', canvas)).not.to.exist;

      // when the append is undone
      commandStack.undo();

      // then the source has no outgoing flow again and its indicator is back
      expect(getIndicator('Task_NoOutgoing', canvas)).to.exist;
    }
  ));

});
