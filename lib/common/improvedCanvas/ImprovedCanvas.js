export default function ImprovedCanvas(canvas, eventBus) {
  eventBus.on('diagram.init', () => canvas.getContainer().classList.add('bio-improved-canvas'));
}

ImprovedCanvas.$inject = [ 'canvas', 'eventBus' ];