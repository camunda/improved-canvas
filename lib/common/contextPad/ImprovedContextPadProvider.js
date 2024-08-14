import icons from '../../common/contextPad/ContextPadIcons';

import {
  query as domQuery
} from 'min-dom';

import {
  assign,
  omit
} from 'min-dash';

const VERY_LOW_PRIORITY = 100;

export default function ImprovedContextPadProvider(contextPad, eventBus, popupMenu) {
  this._eventBus = eventBus;
  this._contextPad = contextPad;
  this._popupMenu = popupMenu;

  contextPad.registerProvider(VERY_LOW_PRIORITY, this);
}

ImprovedContextPadProvider.prototype.getContextPadEntries = function(target) {
  return (entries) => {

    // replace
    if (entries['replace']) {
      updateIcon(entries['replace'], 'replace');

      // manage active state
      const action = entries['replace'].action.click;
      entries['replace'].action.click = updateAction(
        this._eventBus, entries, 'replace', action
      );
    }

    // connect
    if (entries['connect']) {
      updateIcon(entries['connect'], 'connect');
      entries['connect'].group = 'edit';
    }

    // delete
    if (entries['delete']) {
      const entry = entries['delete'];

      updateIcon(entry, 'delete');
      entry.group = 'delete';

      entries = {
        ...omit(entries, 'delete'),
        delete: entry
      };
    }

    return entries;
  };
};

ImprovedContextPadProvider.prototype.getMultiElementContextPadEntries = function(target) {
  return (entries) => {

    // replace
    if (entries['replace']) {
      updateIcon(entries['replace'], 'replace');

      // manage active state
      const action = entries['replace'].action.click;
      entries['replace'].action.click = updateAction(
        this._eventBus, entries, 'replace', action
      );
    }

    // connect
    if (entries['connect']) {
      updateIcon(entries['connect'], 'connect');
      entries['connect'].group = 'edit';
    }

    // delete
    if (entries['delete']) {
      const entry = entries['delete'];

      updateIcon(entry, 'delete');
      entry.group = 'delete';

      entries = {
        ...omit(entries, 'delete'),
        delete: entry
      };
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
export function getEntry(entries, id) {
  return domQuery(`.djs-context-pad .entry[aria-label="${entries[id].title}"`);
}

export function getIcon(iconName, entry) {
  if (entry.action.dragstart) {
    return `<div class="entry" draggable="true">${icons[iconName]}</div>`;
  }

  return `<div class="entry">${icons[iconName]}</div>`;
}

export function updateIcon(entry, iconName) {
  delete entry['className'];
  entry.html = getIcon(iconName, entry);
}

export function updateAction(eventBus, entries, id, action) {
  return (event, element) => {
    action(event, element);
    const entry = getEntry(entries, id);
    entry.classList.add('active');

    eventBus.once('popupMenu.close', function() {
      entry.classList.remove('active');
    });
  };
}