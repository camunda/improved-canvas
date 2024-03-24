import { is } from 'bpmn-js/lib/util/ModelUtil';
import icons from '../../common/contextPad/ContextPadIcons';

import {
  query as domQuery
} from 'min-dom';

import {
  assign
} from 'min-dash';

export default function BPMNImprovedContextPadProvider(contextPad, eventBus, popupMenu) {
  this._eventBus = eventBus;
  this._contextPad = contextPad;
  this._popupMenu = popupMenu;

  contextPad.registerProvider(100, this);
}

BPMNImprovedContextPadProvider.prototype.getContextPadEntries = function(target) {
  const self = this;

  return (entries) => {
    delete entries['append.end-event'];
    delete entries['append.gateway'];
    delete entries['append.intermediate-event'];
    delete entries['append.append-task'];
    delete entries['append'];
    delete entries['append.text-annotation'];

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

    // remove preview (e.g. for text annotations)
    Object.values(entries).forEach(entry => {
      const { action = {} } = entry;

      if (action.hover) {
        delete action.hover;
      }
    });

    return entries;
  };
};

BPMNImprovedContextPadProvider.prototype.getMultiElementContextPadEntries = function() {
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

BPMNImprovedContextPadProvider.prototype._updatePopupMenuOpenPosition = function(entry, menuId) {
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

BPMNImprovedContextPadProvider.prototype._getMenuPosition = function(elements) {
  const Y_OFFSET = 5;

  const pad = this._contextPad.getPad(elements).html;

  const padRect = pad.getBoundingClientRect();

  const pos = {
    x: padRect.left,
    y: padRect.top - padRect.height - Y_OFFSET
  };

  return pos;
};

BPMNImprovedContextPadProvider.$inject = [ 'contextPad', 'eventBus', 'popupMenu' ];

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