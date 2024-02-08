import { assign } from 'min-dash';

export default function AppendNodeProvider(appendNode, eventBus, popupMenu, translate, connect) {
  this._eventBus = eventBus;
  this._popupMenu = popupMenu;
  this._translate = translate;
  this._appendNode = appendNode;
  this._connect = connect;

  appendNode.registerProvider(this);
}

AppendNodeProvider.prototype.getActions = function() {
  return {
    'click': (event, element) => {
      const position = assign(this._getAppendMenuPosition(element), {
        cursor: { x: event.x, y: event.y }
      });

      this._popupMenu.open(element, 'bpmn-append', position, {
        title: this._translate('Append element'),
        width: 300,
        search: true
      });
    },
    'dragstart': (event, element) => {
      this._connect.start(event, element);
    }
  };
};

AppendNodeProvider.prototype.isAllowed = function(element) {
  const { entries } = this._popupMenu._getContext(element, 'bpmn-append');

  return Object.keys(entries).length > 0;
};

AppendNodeProvider.prototype._getAppendMenuPosition = function(element) {
  const appendNode = this._appendNode;

  const X_OFFSET = 20;
  const Y_OFFSET = 30;

  const node = appendNode.getNode(element).html;

  const nodeRect = node.getBoundingClientRect();

  const pos = {
    x: nodeRect.left - X_OFFSET,
    y: nodeRect.top - Y_OFFSET
  };

  return pos;
};

AppendNodeProvider.$inject = [
  'appendNode',
  'eventBus',
  'popupMenu',
  'translate',
  'connect'
];