export default function ImprovedCanvas(canvas, eventBus) {

  // `bio-theme-parent` scopes the tokens; diagram-js sets it too, but only from
  // the version that adopted `@bpmn-io/theme`
  eventBus.on('diagram.init', () => canvas.getContainer().classList.add('bio-improved-canvas', 'bio-theme-parent'));
}

ImprovedCanvas.$inject = [ 'canvas', 'eventBus' ];