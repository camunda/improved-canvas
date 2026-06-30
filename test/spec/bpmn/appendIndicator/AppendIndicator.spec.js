import {
  insertCoreStyles,
  insertBpmnStyles,
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { query as domQuery } from 'min-dom';

import AppendIndicator from 'lib/bpmn/appendIndicator';

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


  it('should not show indicator for elements inside an ad-hoc subprocess', inject(
    function(canvas) {

      // then
      expect(getIndicator('Task_InAdHoc', canvas)).not.to.exist;
    }
  ));


  it('should not show indicator when the slot would not fit inside a sub-process', inject(
    function(canvas) {

      // then
      expect(getIndicator('Task_NearEdge', canvas)).not.to.exist;
    }
  ));


  it('should show indicator after an expanded sub-process', inject(
    function(canvas) {

      // then
      expect(getIndicator('SubProcess_1', canvas)).to.exist;
    }
  ));


  it('should hide a child indicator when the container is resized onto it', inject(
    function(canvas, elementRegistry, modeling) {

      // given
      expect(getIndicator('Task_RoomInSub', canvas)).to.exist;

      // when the sub-process right edge is moved onto the child's slot
      modeling.resizeShape(
        elementRegistry.get('SubProcess_2'),
        { x: 160, y: 800, width: 180, height: 160 }
      );

      // then
      expect(getIndicator('Task_RoomInSub', canvas)).not.to.exist;
    }
  ));


  it('should not show indicator when the slot overlaps a neighbor', inject(
    function(canvas, modeling) {

      // when a shape is created over the indicator's slot
      modeling.createShape(
        { type: 'bpmn:Task', width: 100, height: 80 },
        { x: 320, y: 120 },
        canvas.getRootElement()
      );

      // then
      expect(getIndicator('Task_NoOutgoing', canvas)).not.to.exist;
    }
  ));


  it('should restore a neighbor indicator when the overlapping shape moves away', inject(
    function(canvas, modeling) {

      // given
      const overlapping = modeling.createShape(
        { type: 'bpmn:Task', width: 100, height: 80 },
        { x: 320, y: 120 },
        canvas.getRootElement()
      );

      // when
      modeling.moveShape(overlapping, { x: 400, y: 0 });

      // then
      expect(getIndicator('Task_NoOutgoing', canvas)).to.exist;
    }
  ));


  it('should restore a neighbor indicator when the overlapping shape is removed', inject(
    function(canvas, modeling) {

      // given
      const overlapping = modeling.createShape(
        { type: 'bpmn:Task', width: 100, height: 80 },
        { x: 320, y: 120 },
        canvas.getRootElement()
      );

      expect(getIndicator('Task_NoOutgoing', canvas)).not.to.exist;

      // when
      modeling.removeShape(overlapping);

      // then
      expect(getIndicator('Task_NoOutgoing', canvas)).to.exist;
    }
  ));


  it('should open the append menu on hover', inject(
    function(appendCreatePad, canvas, elementRegistry) {

      // given
      const open = sinon.spy(appendCreatePad, 'open');

      const indicator = getIndicator('Task_NoOutgoing', canvas);

      // when
      indicator.dispatchEvent(new MouseEvent('mouseenter'));

      // then
      expect(open).to.have.been.calledWith(elementRegistry.get('Task_NoOutgoing'));
    }
  ));


  it('should close the append menu shortly after the pointer leaves', inject(
    function(appendCreatePad, canvas) {

      // given
      const clock = sinon.useFakeTimers();

      const close = sinon.spy(appendCreatePad, 'close');

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
      const clock = sinon.useFakeTimers();

      const selected = elementRegistry.get('AdHocSubProcess_1');

      selection.select(selected);

      // hovering another element's indicator opens that element's pad instead
      const indicator = getIndicator('Task_NoOutgoing', canvas);

      indicator.dispatchEvent(new MouseEvent('mouseenter'));

      const open = sinon.spy(appendCreatePad, 'open');

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

});
