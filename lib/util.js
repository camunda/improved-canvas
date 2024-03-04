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
