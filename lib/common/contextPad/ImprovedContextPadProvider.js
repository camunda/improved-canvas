import icons from '../../common/contextPad/ContextPadIcons';

import {
  query as domQuery
} from 'min-dom';

import {
  assign
} from 'min-dash';

export default function ImprovedContextPadProvider(contextPad, eventBus, popupMenu) {
  this._eventBus = eventBus;
  this._contextPad = contextPad;
  this._popupMenu = popupMenu;

  contextPad.registerProvider(100, this);
}

ImprovedContextPadProvider.prototype.getContextPadEntries = function(target) {
  const self = this;

  return (entries) => {

    // replace
    if (entries['replace']) {
      // updateIcon(entries['replace'], 'replace');
      const className = getClassName(target);

      if (className) {
        entries['replace'].className = className;
      }

      // manage active state
      const action = entries['replace'].action.click;

      entries['replace'].action.click = updateAction(
        self._eventBus, entries, 'replace', action
      );
    }

    // connect
    if (entries['connect']) {
      updateIcon(entries['connect'], 'connect');
    }

    if (entries['append.text-annotation']) {
      entries['append.text-annotation'].group = 'connect';
    }

    // delete
    if (entries['delete']) {
      updateIcon(entries['delete'], 'delete');
      entries['delete'].group = 'delete';
    }

    return entries;
  };
};


ImprovedContextPadProvider.prototype._updatePopupMenuOpenPosition = function(entry, menuId) {
  entry.action = {
    click: (event, target) => {
      const position = this._getMenuPosition(target);

      assign(position, {
        cursor: {
          x: event.x,
          y: event.y
        }
      });

      this._popupMenu.open(target, menuId, position);
    }
  };
};

ImprovedContextPadProvider.prototype._getMenuPosition = function(elements) {
  const Y_OFFSET = 5;

  const pad = this._contextPad.getPad(elements).html;

  const padRect = pad.getBoundingClientRect();

  const pos = {
    x: padRect.left,
    y: padRect.top - padRect.height - Y_OFFSET
  };

  return pos;
};

ImprovedContextPadProvider.$inject = [ 'contextPad', 'eventBus', 'popupMenu' ];

// helpers //////////
function getIcon(iconName, entry) {
  if (entry.action.dragstart) {
    return `<div class="entry" draggable="true">${icons[iconName]}</div>`;
  }

  return `<div class="entry">${icons[iconName]}</div>`;
}

function updateIcon(entry, iconName) {
  delete entry['className'];

  entry.html = getIcon(iconName, entry);
}

function getEntry(entries, id) {
  return domQuery(`.djs-context-pad .entry[aria-label="${entries[id].title}"`);
}

function updateAction(eventBus, entries, id, action) {
  return (event, element) => {
    action(event, element);
    const entry = getEntry(entries, id);
    entry.classList.add('active');

    eventBus.on('popupMenu.close', function() {
      entry.classList.remove('active');
    });
  };
}

function getClassName(target) {
  const type = target.businessObject.$type;

  if (type === 'bpmn:Task') {
    return 'bpmn-icon-task';
  }

  if (type === 'bpmn:UserTask') {
    return 'bpmn-icon-user';
  }

  if (type === 'bpmn:ServiceTask') {
    return 'bpmn-icon-service-task';
  }

  if (type === 'bpmn:ScriptTask') {
    return 'bpmn-icon-script-task';
  }

  if (type === 'bpmn:SendTask') {
    return 'bpmn-icon-send-task';
  }

  if (type === 'bpmn:ReceiveTask') {
    return 'bpmn-icon-receive-task';
  }

  if (type === 'bpmn:ManualTask') {
    return 'bpmn-icon-manual-task';
  }

  if (type === 'bpmn:BusinessRuleTask') {
    return 'bpmn-icon-business-rule';
  }

  if (type === 'bpmn:ExclusiveGateway') {
    return 'bpmn-icon-gateway-xor';
  }
}