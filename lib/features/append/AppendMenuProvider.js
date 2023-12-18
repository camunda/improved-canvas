export default function AppendMenuProvider(popupMenu, eventBus) {
  this._eventBus = eventBus;

  popupMenu.registerProvider('bpmn-append', 100, this);
}

AppendMenuProvider.prototype.getPopupMenuEntries = function() {

  return (entries) => {

    const options = {
      group: { id:'common', name: 'Common' },
      searchable: false
    };

    const common = {};

    if (entries['append-task']) {
      common['common-append-task'] = {
        ...entries['append-task'],
        ...options
      };
    }

    if (entries['append-exclusive-gateway']) {
      common['common-append-gateway'] = {
        ...entries['append-exclusive-gateway'],
        ...options
      };
    }

    if (entries['append-none-end-event']) {
      common['common-append-end-event'] = {
        ...entries['append-none-end-event'],
        ...options
      };
    }

    return {
      ...common,
      ...entries
    };
  };
};


AppendMenuProvider.$inject = [ 'popupMenu', 'eventBus' ];
