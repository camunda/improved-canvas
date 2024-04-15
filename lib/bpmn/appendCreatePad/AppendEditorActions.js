/**
 * Registers and executes append editor action.
 */
export default class AppendEditorActions {
  constructor(injector, palette, popupMenu, selection, translate) {
    this._injector = injector;
    this._palette = palette;
    this._popupMenu = popupMenu;
    this._selection = selection;
    this._translate = translate;

    this.unregisterActions();

    this.registerActions();
  }

  /**
   * Unregister conflicting actions.
   */
  unregisterActions() {
    const editorActions = this._injector.get('editorActions', false);

    if (editorActions && editorActions.isRegistered('appendElement')) {
      editorActions.unregister('appendElement');
    }
  }

  /**
   * Register actions.
   */
  registerActions() {
    const appendCreatePad = this._injector.get('appendCreatePad', false),
          editorActions = this._injector.get('editorActions', false);

    if (!appendCreatePad || !editorActions) {
      return;
    }

    editorActions.register({
      appendCreatePad: (event) => {
        const selected = this._selection.get();

        if (appendCreatePad.isOpen()) {
          const html = appendCreatePad.getHtml();

          const bBox = html.getBoundingClientRect();

          this._popupMenu.open(selected[ 0 ], 'bpmn-append', {
            x: bBox.left,
            y: bBox.top
          }, {
            title: this._translate('Append element'),
            width: 300,
            search: true
          });
        } else {
          this._palette.triggerEntry('create', 'click', event);
        }
      }
    });
  }
}

AppendEditorActions.$inject = [
  'injector',
  'palette',
  'popupMenu',
  'selection',
  'translate'
];
