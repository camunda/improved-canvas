import { getBBox } from 'diagram-js/lib/util/Elements';

import { isEventSubProcess } from 'bpmn-js/lib/util/DiUtil';
import { is } from 'bpmn-js/lib/util/ModelUtil';

import CreatePad from '../../common/createPad/CreatePad';

const CREATE_PAD_MARGIN_X = -25,
      CREATE_PAD_MARGIN_Y = 5;

export default class AttachCreatePad extends CreatePad {
  constructor(appendContextPadProvider, attachPreview, create, elementFactory, eventBus, injector, modeling, overlays, selection, translate) {
    super(eventBus, overlays);

    this._appendContextPadProvider = appendContextPadProvider;
    this._attachPreview = attachPreview;
    this._create = create;
    this._elementFactory = elementFactory;
    this._injector = injector;
    this._modeling = modeling;
    this._selection = selection;
    this._translate = translate;
  }

  canOpen(target) {
    const { attachers = [] } = target;

    if (attachers.length) {
      return false;
    }

    return is(target, 'bpmn:Task') || (is(target, 'bpmn:SubProcess') && !isEventSubProcess(target));
  }

  getPosition(target) {
    const bBox = getBBox([ target ]);

    return {
      left: bBox.width + CREATE_PAD_MARGIN_X,
      top: bBox.height + CREATE_PAD_MARGIN_Y
    };
  }

  getEntries(target) {
    const createBoundaryEvent = (event, element, eventDefinitionType = null) => {
      const shape = this._elementFactory.createShape({ type: 'bpmn:BoundaryEvent', eventDefinitionType });

      this._create.start(event, shape, {
        source: element
      });
    };

    const entries = [
      [ null, 'bpmn-icon-intermediate-event-none' ],
      [ 'bpmn:MessageEventDefinition', 'bpmn-icon-intermediate-event-catch-message' ],
      [ 'bpmn:TimerEventDefinition', 'bpmn-icon-intermediate-event-catch-timer' ],
      [ 'bpmn:ConditionalEventDefinition', 'bpmn-icon-intermediate-event-catch-condition' ],
      [ 'bpmn:ErrorEventDefinition', 'bpmn-icon-intermediate-event-catch-error' ]
    ].reduce((entries, [ eventDefinitionType, className ]) => {
      return {
        ...entries,
        [ className ]: {
          action: {
            click: (event, element) => {
              this._attachPreview.cleanUp();

              const shape = this._elementFactory.createShape({ type: 'bpmn:BoundaryEvent', eventDefinitionType });

              const bBox = getBBox(element);

              const position = {
                x: bBox.x + bBox.width / 2,
                y: bBox.y + bBox.height
              };

              const { attachers = [] } = element;

              if (!attachers.length) {
                this._modeling.createElements(shape, position, element, { attach: true });

                this._selection.select(shape);
              } else {
                createBoundaryEvent(event, element, eventDefinitionType);
              }
            },
            dragstart: (event, element) => {
              this._attachPreview.cleanUp();

              createBoundaryEvent(event, element, eventDefinitionType);
            },
            hover: (event, element) => {
              const { attachers = [] } = element;

              if (attachers.length) {
                return;
              }

              // mouseover
              this._attachPreview.create(element, 'bpmn:BoundaryEvent', { eventDefinitionType });

              return () => {

                // mouseout
                this._attachPreview.cleanUp();
              };
            }
          },
          className,
          title: this._translate(target.attachers.length ? 'Create boundary event' : 'Attach boundary event')
        }
      };
    }, {});

    const appendContextPadProvider = this._injector.get('appendContextPadProvider', false);

    if (!appendContextPadProvider) {
      return entries;
    }

    const appendEntries = this._appendContextPadProvider.getContextPadEntries(target);

    return {
      ...entries,
      ...appendEntries
    };
  }
}

AttachCreatePad.$inject = [
  'appendContextPadProvider',
  'attachPreview',
  'create',
  'elementFactory',
  'eventBus',
  'injector',
  'modeling',
  'overlays',
  'selection',
  'translate'
];