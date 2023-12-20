import { assign } from 'min-dash';

/**
 * Registers and executes BPMN specific editor actions.
 *
 * @param {Injector} injector
 */
export default function AppendNodeEditorActions(injector) {
  this._injector = injector;

  this.unregisterActions();

  this.registerActions();
}

AppendNodeEditorActions.$inject = [
  'injector'
];


/**
 * Unregister conflicting actions.
 */
AppendNodeEditorActions.prototype.unregisterActions = function() {

  const editorActions = this._injector.get('editorActions', false);

  if (editorActions && editorActions.isRegistered('appendElement')) {
    editorActions.unregister('appendElement');
  }

};

/**
 * Register actions.
 *
 * @param {Injector} injector
 */
AppendNodeEditorActions.prototype.registerActions = function() {
  const editorActions = this._injector.get('editorActions', false);
  const selection = this._injector.get('selection', false);
  const appendNode = this._injector.get('appendNode', false);
  const palette = this._injector.get('palette', false);

  const actions = {};

  // append
  if (selection && appendNode && palette) {

    assign(actions, {
      'appendNode': function(event) {
        const selected = selection && selection.get();

        if (selected.length == 1 && appendNode.isAllowed(selected[0])) {
          appendNode.trigger('click', event);
        } else {
          palette.triggerEntry('create', 'click', event);
        }
      }
    });

  }

  editorActions && editorActions.register(actions);

};
