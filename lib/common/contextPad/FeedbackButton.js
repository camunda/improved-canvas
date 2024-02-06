import { OFFSET } from '../contextPad/ImprovedContextPad';

export default class FeedbackButton {
  constructor(eventBus) {
    eventBus.on('contextPad.open', ({ current }) => {
      const { pad } = current;

      const {
        html,
        htmlContainer
      } = pad;

      const button = document.createElement('button');

      button.className = 'feedback-button';

      button.textContent = 'Send feedback';

      const {
        offsetHeight,
        offsetWidth
      } = html;

      button.style.transform = `translate(${ offsetWidth / 2 }px, ${ -offsetHeight - OFFSET / 2 }px) translate(-100%, -100%)`;

      button.addEventListener('click', () => {
        eventBus.fire('contextPad.feedback');
      });

      htmlContainer.prepend(button);

      eventBus.once('contextPad.close', () => {
        htmlContainer.removeChild(button);
      });
    });
  }
}

FeedbackButton.$inject = [ 'eventBus' ];