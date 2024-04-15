import CreatePad from 'lib/common/createPad/CreatePad';

export default class ErrorCreatePad extends CreatePad {
  constructor(eventBus, overlays) {
    super(eventBus, overlays);
  }
}

ErrorCreatePad.$inject = [ 'eventBus', 'overlays' ];