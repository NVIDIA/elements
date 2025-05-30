let isStoryViewer = false;
let isIframe = false;
let editor = false;

try {
  isIframe = globalThis.window.self !== globalThis.window.top;
  isStoryViewer = !!globalThis.window.top?.location?.href?.includes('/stories/');
} catch {
  editor = true;
}

if ((isStoryViewer && isIframe) || editor) {
  const links = globalThis.document.getElementById('iframe-links')!;
  if (links) {
    links.hidden = false;
  }
}
