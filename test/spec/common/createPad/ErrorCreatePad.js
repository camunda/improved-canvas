import CreatePad from 'lib/common/createPad/CreatePad';

export default class ErrorCreatePad extends CreatePad {
  constructor(canvas, eventBus) {
    super(canvas, eventBus);
  }
}

ErrorCreatePad.$inject = [ 'canvas', 'eventBus' ];