import inherits from 'inherits-browser';

import KeyboardBindings from 'diagram-js/lib/features/keyboard/KeyboardBindings';


/**
 * BPMN 2.0 specific keyboard bindings.
 *
 * @param {Injector} injector
 */
export default function AppendNodeKeyboardBindings(injector) {

  this._injector = injector;
  this._keyboard = this._injector.get('keyboard', false);
  this._editorActions = this._injector.get('editorActions', false);

  if (this._keyboard) {
    this._injector.invoke(KeyboardBindings, this);
  }
}

inherits(AppendNodeKeyboardBindings, KeyboardBindings);

AppendNodeKeyboardBindings.$inject = [
  'injector'
];


/**
 * Register available keyboard bindings.
 *
 * @param {Keyboard} keyboard
 * @param {EditorActions} editorActions
 */
AppendNodeKeyboardBindings.prototype.registerBindings = function() {

  const keyboard = this._keyboard;
  const editorActions = this._editorActions;

  // inherit default bindings
  KeyboardBindings.prototype.registerBindings.call(this, keyboard, editorActions);

  /**
   * Add keyboard binding if respective editor action
   * is registered.
   *
   * @param {string} action name
   * @param {Function} fn that implements the key binding
   */
  function addListener(action, fn) {

    if (editorActions && editorActions.isRegistered(action)) {
      keyboard && keyboard.addListener(fn);
    }
  }

  // activate append element via append node
  // A
  addListener('appendNode', function(context) {

    const event = context.keyEvent;

    if (keyboard && keyboard.hasModifier(event)) {
      return;
    }

    if (keyboard && keyboard.isKey([ 'a', 'A' ], event)) {

      editorActions && editorActions.trigger('appendNode', event);
      return true;
    }
  });

};