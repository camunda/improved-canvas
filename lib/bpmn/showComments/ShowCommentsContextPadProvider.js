import { isLabel } from 'diagram-js/lib/util/ModelUtil';

const COMMENTS_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M17.74,30,16,29l4-7h6a2,2,0,0,0,2-2V8a2,2,0,0,0-2-2H6A2,2,0,0,0,4,8V20a2,2,0,0,0,2,2h9v2H6a4,4,0,0,1-4-4V8A4,4,0,0,1,6,4H26a4,4,0,0,1,4,4V20a4,4,0,0,1-4,4H21.16Z" transform="translate(0 0)"/>
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