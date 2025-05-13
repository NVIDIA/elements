if (globalThis.window.self === globalThis.window.top) {
  const links = globalThis.document.getElementById('iframe-links');
  if (links) {
    links.hidden = false;
  }
}
