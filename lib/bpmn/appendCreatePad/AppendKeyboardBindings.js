const HIGH_PRIORITY = 2000;

/**
 * Append keyboard bindings.
 */
export default class AppendKeyboardBindings {
  constructor(injector) {
    const editorActions = injector.get('editorActions', false),
          keyboard = injector.get('keyboard', false);

    if (!editorActions || !keyboard) {
      return;
    }

    if (editorActions.isRegistered('appendCreatePad')) {
      keyboard.addListener(HIGH_PRIORITY, ({ keyEvent }) => {
        if (keyboard && keyboard.hasModifier(keyEvent)) {
          return;
        }

        if (keyboard && keyboard.isKey([ 'a', 'A' ], keyEvent)) {
          editorActions && editorActions.trigger('appendCreatePad', keyEvent);

          return true;
        }
      });
    }
  }
}

AppendKeyboardBindings.$inject = [
  'injector'
];