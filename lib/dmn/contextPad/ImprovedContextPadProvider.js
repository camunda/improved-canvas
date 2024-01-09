export default function DMNImprovedContextPadProvider(contextPad) {
  this._contextPad = contextPad;

  contextPad.registerProvider(100, this);
}

DMNImprovedContextPadProvider.prototype.getContextPadEntries = function() {

  return (entries) => {

    // match order to bpmn
    const newEntries = {};

    if (entries['append.decision']) {
      newEntries['append.decision'] = entries['append.decision'];
    }

    if (entries['append.input-data']) {
      newEntries['append.input-data'] = entries['append.input-data'];
    }

    if (entries['append.knowledge-source']) {
      newEntries['append.knowledge-source'] = entries['append.knowledge-source'];
    }

    if (entries['append.business-knowledge-model']) {
      newEntries['append.business-knowledge-model'] = entries['append.business-knowledge-model'];
    }

    if (entries['replace']) {
      newEntries['replace'] = entries['replace'];
    }

    if (entries['append.text-annotation']) {
      newEntries['append.text-annotation'] = entries['append.text-annotation'];
    }

    if (entries['connect']) {
      newEntries['connect'] = entries['connect'];
    }

    if (entries['delete']) {
      newEntries['delete'] = entries['delete'];
    }

    return newEntries;
  };
};

DMNImprovedContextPadProvider.$inject = [ 'contextPad' ];
