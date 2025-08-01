import { is } from 'bpmn-js/lib/util/ModelUtil';

import {
  assign,
  omit
} from 'min-dash';

import {
  getIcon,
  updateAction,
  updateIcon
} from '../../common/contextPad/ImprovedContextPadProvider';

const VERY_LOW_PRIORITY = 1;

export default function BPMNImprovedContextPadProvider(contextPad, eventBus, popupMenu) {
  this._eventBus = eventBus;
  this._contextPad = contextPad;
  this._popupMenu = popupMenu;

  contextPad.registerProvider(VERY_LOW_PRIORITY, this);
}

BPMNImprovedContextPadProvider.prototype.getContextPadEntries = function(target) {
  return (entries) => {

    // move replace entry to front
    if (entries['replace']) {
      entries = {
        'replace': entries['replace'],
        ...omit(entries, 'replace')
      };
    }

    const textAnnotationEntry = entries['append.text-annotation'];

    for (const id in entries) {
      if (id === 'append') {
      // if (id.startsWith('append')) {
        delete entries[ id ];
      }
    }

    if (textAnnotationEntry) {
      entries = {
        ...entries,
        'append.text-annotation': textAnnotationEntry
      };
    }

    if (is(target, 'bpmn:Participant') || is(target, 'bpmn:Lane')) {
      [
        'lane-insert-above',
        'lane-insert-below',
        'lane-divide-two',
        'lane-divide-three'
      ].forEach((id) => {
        if (entries[id]) {
          entries[id].group = 'lanes';
        }
      });
    }

    // color picker
    if (entries['set-color']) {
      updateIcon(entries['set-color'], 'colorPicker');

      entries['set-color'].group = 'edit';

      this._updatePopupMenuOpenPosition(entries['set-color'], 'color-picker');

      // manage active state
      const action = entries['set-color'].action.click;

      entries['set-color'].action.click = updateAction(
        this._eventBus, entries, 'set-color', action
      );
    }

    // delete
    if (entries['delete']) {
      const entry = entries['delete'];

      updateIcon(entry, 'delete');

      entries = {
        delete: {
          ...entry,
          group: 'delete'
        },
        ...omit(entries, 'delete'),
      };
    }

    // move connect to the back
    if (entries['connect']) {
      entries = {
        ...omit(entries, 'connect'),
        connect: {
          ...entries['connect'],
          group: 'connect'
        }
      };
    }

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
      const deleteEntry = entries['delete'];

      updateIcon(deleteEntry, 'delete');

      deleteEntry.group = 'delete';
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