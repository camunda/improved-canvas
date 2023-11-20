import icons from './AlignElementsIcons';

export default function AlignElementsPopupProvider(popupMenu, eventBus) {
  this._eventBus = eventBus;

  popupMenu.registerProvider('align-elements', 100, this);
}

AlignElementsPopupProvider.prototype.getPopupMenuEntries = function() {

  return (entries) => {

    Object.keys(entries).forEach((key) => {
      updateIcon(entries[key], key);
    });

    return entries;
  };
};


AlignElementsPopupProvider.$inject = [ 'popupMenu', 'eventBus' ];


// helpers //////////

function updateIcon(entry, iconName) {
  delete entry['className'];
  entry.imageHtml = icons[iconName];
}