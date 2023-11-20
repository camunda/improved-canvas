export default function ColorPickerPopupProvider(popupMenu, eventBus) {
  this._eventBus = eventBus;

  popupMenu.registerProvider('color-picker', 100, this);
}

ColorPickerPopupProvider.prototype.getPopupMenuEntries = function() {

  const iconSvg = `
    <svg viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.5 16C12.6422 16 16 12.6422 16 8.5C16 4.35787 12.6422 1 8.5 1C4.35787 1 1 4.35787 1 8.5C1 12.6422 4.35787 16 8.5 16Z" fill="var(--fill-color)" stroke="var(--stroke-color)" stroke-width="1.2"/>
    </svg>`;

  return (entries) => {

    delete entries['blue-color'].imageUrl;
    entries['blue-color'].imageHtml = iconSvg.replace('var(--fill-color)', '#D0E2FF')
      .replace('var(--stroke-color)', '#00539A');

    delete entries['green-color'].imageUrl;
    entries['green-color'].imageHtml = iconSvg.replace('var(--fill-color)', '#A7F0BA')
      .replace('var(--stroke-color)', '#0E6027');

    delete entries['orange-color'].imageUrl;
    entries['orange-color'].imageHtml = iconSvg.replace('var(--fill-color)', '#FFE0B1')
      .replace('var(--stroke-color)', '#F1C21B');

    delete entries['red-color'].imageUrl;
    entries['red-color'].imageHtml = iconSvg.replace('var(--fill-color)', '#FFD6E8')
      .replace('var(--stroke-color)', '#9F1853');

    delete entries['purple-color'].imageUrl;
    entries['purple-color'].imageHtml = iconSvg.replace('var(--fill-color)', '#E8DAFF')
      .replace('var(--stroke-color)', '#6929C4');

    const defaultColor = entries['default-color'];
    delete defaultColor.imageUrl;
    defaultColor.imageHtml = iconSvg.replace('var(--fill-color)', '#FFFFFF')
      .replace('var(--stroke-color)', '#000000');
    defaultColor.group = 'default-color';

    // move default to end
    delete entries['default-color'];
    entries['default-color'] = defaultColor;

    return entries;
  };
};


ColorPickerPopupProvider.$inject = [ 'popupMenu', 'eventBus' ];
