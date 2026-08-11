export function insertCSS(name, css) {
  const id = `bio-improved-canvas-${name}`;

  if (document.querySelector(`[data-css-file="${ id }"]`)) {
    return;
  }

  var head = document.head || document.getElementsByTagName('head')[0],
      style = document.createElement('style');

  style.setAttribute('data-css-file', id);

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);
}

// popup menu width as a CSS custom property, so a specific menu can be widened
// by defining `--<menuId>-popup-width` (defaults to 300px)
export function popupWidth(menuId) {
  return `var(--${ menuId }-popup-width, 300px)`;
}
