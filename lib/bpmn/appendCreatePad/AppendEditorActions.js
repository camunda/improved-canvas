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

        const target = selected.length === 1 ? selected[ 0 ] : null;

        if (!target || !appendCreatePad.canAppend(target)) {
          this._palette.triggerEntry('create', 'click', event);

          return;
        }

        // the pad anchors the popup, so make sure it is open
        appendCreatePad.open(target);

        const html = appendCreatePad.getHtml();

        // opening was vetoed, e.g. while the canvas is locked; do not fall back
        // to the palette either, creating elements is not allowed then
        if (!html) {
          return;
        }

        const { left, top } = html.getBoundingClientRect();

        // leave no pad behind the popup for a target that only ever shows its
        // indicator; closing it in the same tick keeps it from ever showing
        if (!appendCreatePad.canAutoOpen(target)) {
          appendCreatePad.close();
        }

        this._popupMenu.open(target, 'bpmn-append', {
          x: left,
          y: top
        }, {
          title: this._translate('Append element'),
          width: 'var(--bpmn-append-popup-width, 300px)',
          search: true
        });
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
