let isExampleViewer = false;
let isIframe = false;
let editor = false;

try {
  isIframe = globalThis.window.self !== globalThis.window.top;
  isExampleViewer = !!globalThis.window.top?.location?.href?.includes('/example/');
} catch {
  editor = true;
}

if ((isExampleViewer && isIframe) || editor) {
  const links = globalThis.document.getElementById('iframe-links')!;
  if (links) {
    links.hidden = false;
  }
}
