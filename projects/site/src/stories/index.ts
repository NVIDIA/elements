const isStoryViewer = globalThis.window.top?.location.href.includes('/stories/');
const isIframe = globalThis.window.self !== globalThis.window.top;

if (isStoryViewer && isIframe) {
  const links = globalThis.document.getElementById('iframe-links')!;
  if (links) {
    links.hidden = false;
  }
}
