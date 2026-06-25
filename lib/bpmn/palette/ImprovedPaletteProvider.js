import icons from '../../common/contextPad/ContextPadIcons';

const VERY_LOW_PRIORITY = 100;

export default function ImprovedPaletteProvider(palette) {
  this._palette = palette;

  palette.registerProvider(VERY_LOW_PRIORITY, this);
}

ImprovedPaletteProvider.prototype.getPaletteEntries = function() {
  return (entries) => {

    // replace the "create element" ellipsis affordance with a "+" button
    if (entries['create']) {
      entries['create'].html = `<div class="entry djs-palette-create-entry"><div class="djs-palette-create-button">${icons.createElement}</div></div>`;
    }

    return entries;
  };
};

ImprovedPaletteProvider.$inject = [ 'palette' ];
