/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('didi').Injector} Injector
 */

/**
 * Integrates the append create pad and append indicator with
 * diagram-js-canvas-lock.
 *
 * The features stay lock-agnostic: the create pad fires `createPad.open.allowed`
 * (diagram-js `*.allowed` convention) and this module vetoes it while the canvas
 * is locked. Because a veto only gates new interactions, this module also tears
 * down the already-open append UI on `canvasLock.changed` and restores it on
 * unlock, mirroring how diagram-js-canvas-lock closes open UI on lock.
 *
 * No-op when diagram-js-canvas-lock is not present.
 *
 * @param {EventBus} eventBus
 * @param {Injector} injector
 */
export default function AppendCanvasLock(eventBus, injector) {
  const canvasLock = injector.get('canvasLock', false);

  if (!canvasLock) {
    return;
  }

  const appendCreatePad = injector.get('appendCreatePad', false);
  const appendIndicator = injector.get('appendIndicator', false);
  const selection = injector.get('selection', false);

  // veto opening the create pad while the canvas is locked
  eventBus.on('createPad.open.allowed', function() {
    if (canvasLock.isLocked()) {
      return false;
    }
  });

  // close open append UI on lock, restore it on unlock
  eventBus.on('canvasLock.changed', function({ locked }) {
    if (appendIndicator) {
      appendIndicator.setEnabled(!locked);
    }

    if (!appendCreatePad) {
      return;
    }

    if (locked) {
      appendCreatePad.close();

      return;
    }

    // reopen the pad for a single selection once unlocked
    const selected = selection && selection.get();

    if (selected && selected.length === 1) {
      appendCreatePad.open(selected[0]);
    }
  });
}

AppendCanvasLock.$inject = [ 'eventBus', 'injector' ];
