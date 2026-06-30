import { expect } from 'chai';
import { spy, stub, useFakeTimers } from 'sinon';

import {
  insertCoreStyles,
  insertBpmnStyles,
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import CreatePad from 'lib/common/createPad/CreatePad';

import ErrorCreatePad from './ErrorCreatePad';

import diagramXML from '../../../fixtures/simple.bpmn';

insertCoreStyles();
insertBpmnStyles();


describe('<CreatePad>', function() {

  describe('#isOpen', function() {

    beforeEach(bootstrapModeler(diagramXML, {
      additionalModules: [
        createCustomCreatePadModule({
          className: 'djs-foobar'
        })
      ]
    }));


    it('should return false initially', inject(function(customCreatePad) {

      // then
      expect(customCreatePad.isOpen()).to.be.false;
    }));


    it('should return true after open', inject(function(customCreatePad, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      customCreatePad.open(task);

      // then
      expect(customCreatePad.isOpen()).to.be.true;
    }));


    it('should return false after close', inject(function(customCreatePad, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      customCreatePad.open(task);

      // when
      customCreatePad.close();

      // then
      expect(customCreatePad.isOpen()).to.be.false;
    }));


    it('should have custom class name', inject(function(canvas, customCreatePad, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      customCreatePad.open(task);

      // then
      expect(canvas.getContainer().querySelector('.djs-foobar')).to.exist;
    }));

  });


  describe('getHtml', function() {

    beforeEach(bootstrapModeler(diagramXML, {
      additionalModules: [
        createCustomCreatePadModule()
      ]
    }));


    it('shoud return HTML element', inject(function(customCreatePad, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      customCreatePad.open(task);

      // when
      const html = customCreatePad.getHtml();

      // then
      expect(html).to.exist;
      expect(html).to.be.an.instanceof(HTMLElement);
    }));

  });


  describe('errors', function() {

    beforeEach(bootstrapModeler(diagramXML, {
      additionalModules: [
        {
          errorCreatePad: [ 'type', ErrorCreatePad ]
        }
      ]
    }));


    [
      'canOpen',
      'getEntries',
      'getPosition'
    ].forEach(method => {

      it(`should throw error if ${ method } not implemented`, inject(function(errorCreatePad) {

        // given
        // when
        // then
        expect(() => errorCreatePad[ method ]()).to.throw();
      }));

    });

  });


  describe('events', function() {

    beforeEach(bootstrapModeler(diagramXML, {
      additionalModules: [
        createCustomCreatePadModule()
      ]
    }));


    it('should fire on open', inject(function(customCreatePad, eventBus, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      const openSpy = spy();

      eventBus.on('createPad.open', openSpy);

      // when
      customCreatePad.open(task);

      // then
      expect(openSpy).to.have.been.calledWithMatch({
        target: task
      });
    }));


    it('should fire on close', inject(function(customCreatePad, eventBus, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      const closeSpy = spy();

      eventBus.on('createPad.close', closeSpy);

      customCreatePad.open(task);

      expect(customCreatePad.isOpen()).to.be.true;

      // when
      customCreatePad.close();

      // then
      expect(closeSpy).to.have.been.calledWithMatch({
        target: task
      });
    }));


    it('should open on selection changed (single element)', inject(function(customCreatePad, elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      selection.select(task);

      // then
      expect(customCreatePad.isOpen()).to.be.true;
    }));


    it('should not open on selection changed (multiple elements)', inject(function(customCreatePad, elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1'),
            task = elementRegistry.get('Task_1');


      // when
      selection.select([ startEvent, task ]);

      // then
      expect(customCreatePad.isOpen()).to.be.false;
    }));


    it('should re-open on elements changed (target changed)', inject(function(customCreatePad, elementRegistry, eventBus, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      selection.select(task);

      const openSpy = spy(customCreatePad, 'open'),
            closeSpy = spy(customCreatePad, 'close');

      // when
      eventBus.fire('elements.changed', {
        elements: [
          task
        ]
      });

      // then
      expect(closeSpy).to.have.been.called;
      expect(openSpy).to.have.been.called;
      expect(customCreatePad.isOpen()).to.be.true;
    }));


    it('should not re-open on elements changed (target unchanged)', inject(function(customCreatePad, elementRegistry, eventBus, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1'),
            task = elementRegistry.get('Task_1');

      selection.select(task);

      const openSpy = spy(customCreatePad, 'open'),
            closeSpy = spy(customCreatePad, 'close');

      // when
      eventBus.fire('elements.changed', {
        elements: [
          startEvent
        ]
      });

      // then
      expect(closeSpy).not.to.have.been.called;
      expect(openSpy).not.to.have.been.called;
      expect(customCreatePad.isOpen()).to.be.true;
    }));

  });


  describe('entries', function() {

    beforeEach(bootstrapModeler(diagramXML, {
      additionalModules: [
        createCustomCreatePadModule({
          getEntries: () => ({
            foo: {
              className: 'foo'
            },
            bar: {
              className: 'bar'
            }
          }),
          getPosition: () => ({ x: 100, y: 100 })
        })
      ]
    }));


    it('should render entries', inject(function(customCreatePad, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      customCreatePad.open(task);

      // then
      expect(domQuery('.foo', customCreatePad.getHtml())).to.exist;
      expect(domQuery('.bar', customCreatePad.getHtml())).to.exist;
    }));


    it('should add title', inject(function(customCreatePad, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      stub(customCreatePad, 'getEntries').callsFake(() => ({
        baz: {
          className: 'baz',
          title: 'Baz'
        }
      }));

      // when
      customCreatePad.open(task);

      // then
      expect(domQuery('.baz', customCreatePad.getHtml())).to.exist;
      expect(domQuery('.baz', customCreatePad.getHtml()).getAttribute('title')).to.equal('Baz');
    }));


    it('should render custom HTML', inject(function(customCreatePad, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_1');

      stub(customCreatePad, 'getEntries').callsFake(() => ({
        baz: {
          html: '<div class="baz">Baz</div>'
        }
      }));

      // when
      customCreatePad.open(task);

      // then
      expect(domQuery('.baz', customCreatePad.getHtml())).to.exist;
    }));


    describe('action', function() {

      it('should add click action', inject(function(customCreatePad, elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        const clickSpy = spy();

        stub(customCreatePad, 'getEntries').callsFake(() => ({
          baz: {
            className: 'baz',
            action: {
              click: clickSpy
            }
          }
        }));

        // when
        customCreatePad.open(task);

        // then
        const entry = domQuery('.baz', customCreatePad.getHtml());

        entry.click();

        expect(clickSpy).to.have.been.called;
      }));


      it('should add dragstart action', inject(function(customCreatePad, elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        const dragstartSpy = spy();

        stub(customCreatePad, 'getEntries').callsFake(() => ({
          baz: {
            className: 'baz',
            action: {
              dragstart: dragstartSpy
            }
          }
        }));

        // when
        customCreatePad.open(task);

        // then
        const entry = domQuery('.baz', customCreatePad.getHtml());

        entry.dispatchEvent(new DragEvent('dragstart'));

        expect(dragstartSpy).to.have.been.called;
      }));


      describe('hover action', function() {

        let clock;

        beforeEach(function() {
          clock = useFakeTimers();
        });

        afterEach(function() {
          clock.restore();
        });


        it('should handle mouseenter and mouseleave', inject(function(customCreatePad, elementRegistry) {

          // given
          const task = elementRegistry.get('Task_1');

          const mouseenterSpy = spy(),
                mouseleaveSpy = spy();

          stub(customCreatePad, 'getEntries').callsFake(() => ({
            baz: {
              className: 'baz',
              action: {
                hover: () => {
                  mouseenterSpy();

                  return mouseleaveSpy;
                }
              }
            }
          }));

          // when
          customCreatePad.open(task);

          // then
          const entry = domQuery('.baz', customCreatePad.getHtml());

          entry.dispatchEvent(new MouseEvent('mouseenter'));

          clock.tick(500);

          expect(mouseenterSpy).to.have.been.called;

          entry.dispatchEvent(new MouseEvent('mouseleave'));

          expect(mouseleaveSpy).to.have.been.called;
        }));


        it('should not handle mouseenter', inject(function(customCreatePad, elementRegistry) {

          // given
          const task = elementRegistry.get('Task_1');

          const mouseenterSpy = spy(),
                mouseleaveSpy = spy();

          stub(customCreatePad, 'getEntries').callsFake(() => ({
            baz: {
              className: 'baz',
              action: {
                hover: () => {
                  mouseenterSpy();

                  return mouseleaveSpy;
                }
              }
            }
          }));

          // when
          customCreatePad.open(task);

          // then
          const entry = domQuery('.baz', customCreatePad.getHtml());

          entry.dispatchEvent(new MouseEvent('mouseenter'));

          clock.tick(100);

          entry.dispatchEvent(new MouseEvent('mouseleave'));

          expect(mouseenterSpy).not.to.have.been.called;
          expect(mouseleaveSpy).not.to.have.been.called;
        }));


        it('should always handle mouseleave after mouseenter', inject(function(customCreatePad, elementRegistry) {

          // given
          const task = elementRegistry.get('Task_1');

          const mouseenterSpy = spy(),
                mouseleaveSpy = spy();

          stub(customCreatePad, 'getEntries').callsFake(() => ({
            baz: {
              className: 'baz',
              action: {
                hover: () => {
                  mouseenterSpy();

                  return mouseleaveSpy;
                }
              }
            }
          }));

          // when
          customCreatePad.open(task);

          // then
          const entry = domQuery('.baz', customCreatePad.getHtml());

          entry.dispatchEvent(new MouseEvent('mouseenter'));

          clock.tick(500);

          expect(mouseenterSpy).to.have.been.called;

          customCreatePad.close();

          expect(mouseleaveSpy).to.have.been.called;
        }));

      });

    });

  });

});

function createCustomCreatePadModule(options) {
  return {
    __init__: [
      'customCreatePad'
    ],
    customCreatePad: [ 'type', createCustomCreatePad(options) ]
  };

}

function createCustomCreatePad(options = {}) {
  const {
    className,
    canOpen = () => true,
    getEntries = () => ({}),
    getPosition = () => ({ x: 0, y: 0 })
  } = options;

  class CustomCreatePad extends CreatePad {
    constructor(canvas, eventBus) {
      super(canvas, eventBus, className);
    }

    canOpen(element) {
      return canOpen(element);
    }

    getEntries(element) {
      return getEntries(element);
    }

    getPosition(element) {
      return getPosition(element);
    }
  }

  CustomCreatePad.$inject = [ 'canvas', 'eventBus' ];

  return CustomCreatePad;
}