import { is } from 'bpmn-js/lib/util/ModelUtil';
import icons from './ContextPadIcons';

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
    delete entries['append.end-event'];
    delete entries['append.gateway'];
    delete entries['append.intermediate-event'];
    delete entries['append.append-task'];
    delete entries['append'];

    if (is(target, 'bpmn:EventBasedGateway')) {
      delete entries['append.receive-task'];
      delete entries['append.message-intermediate-event'];
      delete entries['append.timer-intermediate-event'];
      delete entries['append.condition-intermediate-event'];
      delete entries['append.signal-intermediate-event'];
    }

    if (is(target, 'bpmn:Participant') || is(target, 'bpmn:Lane')) {
      if (entries['lane-insert-above']) {
        entries['lane-insert-above'].group = 'lanes';
      }

      if (entries['lane-insert-below']) {
        entries['lane-insert-below'].group = 'lanes';
      }

      if (entries['lane-divide-two']) {
        entries['lane-divide-two'].group = 'lanes';
      }

      if (entries['lane-divide-three']) {
        entries['lane-divide-three'].group = 'lanes';
      }
    }

    // replace
    if (entries['replace']) {
      updateIcon(entries['replace'], 'replace');

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

    // color picker
    if (entries['set-color']) {
      updateIcon(entries['set-color'], 'colorPicker');
      this._updatePopupMenuOpenPosition(entries['set-color'], 'color-picker');

      // manage active state
      const action = entries['set-color'].action.click;
      entries['set-color'].action.click = updateAction(
        self._eventBus, entries, 'set-color', action
      );
    }

    // delete
    if (entries['delete']) {
      updateIcon(entries['delete'], 'delete');
      entries['delete'].group = 'delete';
    }

    return entries;
  };
};

ImprovedContextPadProvider.prototype.getMultiElementContextPadEntries = function() {
  return (entries) => {

    // align elements
    if (entries['align-elements']) {
      entries['align-elements']['html'] = getIcon('alignElements', entries['align-elements']);
      this._updatePopupMenuOpenPosition(entries['align-elements'], 'align-elements');

      // manage active state
      const action = entries['align-elements'].action.click;
      entries['align-elements'].action.click = updateAction(
        this._eventBus, entries, 'align-elements', action
      );
    }

    // color picker
    if (entries['set-color']) {
      updateIcon(entries['set-color'], 'colorPicker');
      this._updatePopupMenuOpenPosition(entries['set-color'], 'color-picker');

      // manage active state
      const action = entries['set-color'].action.click;
      entries['set-color'].action.click = updateAction(
        this._eventBus, entries, 'set-color', action
      );
    }

    // delete
    if (entries['delete']) {

      // move delete to the end
      const deleteEntry = entries['delete'];
      delete entries['delete'];

      updateIcon(deleteEntry, 'delete');
      deleteEntry.group = 'delete';

      entries['delete'] = deleteEntry;
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