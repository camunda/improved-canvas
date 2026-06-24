import { isLabel } from 'diagram-js/lib/util/ModelUtil';

const COMMENTS_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
</svg>`;

const VERY_LOW_PRIORITY = 100;

/**
 * @type {import('diagram-js/lib/features/context-pad/ContextPad').default} ContextPad
 * @type {import('diagram-js/lib/core/EventBus').default} EventBus
 */

/**
 * Context pad provider that adds an entry to show the comments.
 * Fires an event that can be listened to handle showing the comments.
 *
 * @example
 *
 * eventBus.on('contextPad.showComments', ({ element, originalEvent }) => {
 *
 *   // handle showing comments
 * });
 *
 * @param {ContextPad} contextPad
 * @param {EventBus} eventBus
 **/
export default function ShowComments(contextPad, eventBus) {
  this._eventBus = eventBus;
  this._contextPad = contextPad;

  contextPad.registerProvider(VERY_LOW_PRIORITY, this);
}

ShowComments.$inject = [
  'contextPad',
  'eventBus'
];

ShowComments.prototype.getContextPadEntries = function(target) {
  return (entries) => {
    if (isLabel(target)) {
      return entries;
    }

    return {
      ...entries,
      'show-comments': {
        title: 'Show comments',
        html: `<div class="entry">${ COMMENTS_ICON }</div>`,
        action: (event) => this._eventBus.fire('contextPad.showComments', {
          element: target,
          originalEvent: event
        }),
        group: 'edit'
      }
    };
  };
};