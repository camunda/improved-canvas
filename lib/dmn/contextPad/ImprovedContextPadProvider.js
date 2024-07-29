import { omit } from 'min-dash';

const VERY_LOW_PRIORITY = 100;

export default function DMNImprovedContextPadProvider(contextPad) {
  this._contextPad = contextPad;

  contextPad.registerProvider(VERY_LOW_PRIORITY, this);
}

DMNImprovedContextPadProvider.prototype.getContextPadEntries = function() {

  return (entries) => {

    // move replace entry to front
    if (entries['replace']) {
      entries = {
        'replace': entries['replace'],
        ...omit(entries, 'replace')
      };
    }

    // move append entries to end
    const appendEntriesKeys = Object.keys(entries).filter((key) => key.startsWith('append'));

    entries = {
      ...omit(entries, appendEntriesKeys),
      ...appendEntriesKeys.reduce((appendEntries, key) => {
        return {
          ...appendEntries,
          [ key ]: entries[ key ]
        };
      }, {})
    };

    // move delete entry to end
    if (entries['delete']) {
      entries = {
        ...omit(entries, 'delete'),
        delete: entries['delete']
      };
    }

    return entries;
  };
};

DMNImprovedContextPadProvider.$inject = [ 'contextPad' ];
