import '/_internal/canvas/canvas.js';

void import('/_internal/search/search.js');

// panel toggles
let loadedSystemsPanel = false;
const systemOptionsPanel = globalThis.document.querySelector<HTMLElement>('#system-options-panel')!;
const systemOptionsPanelBtn = globalThis.document.querySelector<HTMLElement>('#system-options-panel-btn')!;
systemOptionsPanel.addEventListener('close', () => (systemOptionsPanel.hidden = true));
systemOptionsPanelBtn.addEventListener('click', async () => {
  if (!loadedSystemsPanel) {
    await import('/_internal/system-settings/system-settings.js');
    loadedSystemsPanel = true;
  }
  systemOptionsPanel.hidden = !systemOptionsPanel.hidden;
});

// resize panels
const handle = globalThis.document.querySelector<HTMLElement>('nve-resize-handle[slot="left"]')!;
const panel = globalThis.document.querySelector<HTMLElement>('nve-page-panel[slot="left"]')!;
handle.addEventListener('input', e => (panel.style.width = (e.target as HTMLInputElement).value + 'px'));

// auto-scroll to deep-link headers
setTimeout(() => {
  const url = new URL(globalThis.window.parent.location.href);
  const isExamplesRoute = url.pathname.includes('/examples');
  const isEditMode = url.searchParams.get('edit') === 'true' || url.searchParams.get('edit') === '1';
  if (isExamplesRoute && isEditMode) return;

  const headerId = new URL(globalThis.window.parent.location.href).hash.replace('#', '');
  globalThis.document.getElementById(headerId)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}, 500);

// preserve scroll position between page transitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const content = globalThis.document.querySelector<any>('#sidenav-panel nve-page-panel-content')!;
globalThis.window.addEventListener('beforeunload', () => {
  sessionStorage.setItem('sidenav-scroll-position', content.scrollTop);
});

const savedPosition = sessionStorage.getItem('sidenav-scroll-position');
if (savedPosition) {
  await customElements.whenDefined('nve-page-panel-content');
  content.scrollTop = parseInt(savedPosition);
  await content.updateComplete;
  content.scrollTop = parseInt(savedPosition);
}

// search
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const docsSearch = globalThis.document.querySelector<any>('#docs-search')!;
const docsNav = globalThis.document.querySelector<HTMLElement>('#docs-nav')!;
const docsNavDisplay = docsNav.style.display;

let isSearching = false;
docsSearch.addEventListener('search-change', (event: CustomEvent) => (isSearching = event.detail.length > 0));
docsSearch.addEventListener('search-reset', () => ((isSearching = false), toggleSideNav(true)));
docsSearch.addEventListener('search-focus', () => toggleSideNav(false));
docsSearch.addEventListener('search-blur', () => !isSearching && toggleSideNav(true));

const toggleSideNav = (state: boolean) => {
  docsNav.style.display = state ? docsNavDisplay : 'none';
};

const searchParams = new URLSearchParams(globalThis.location.search);
const query = searchParams.get('q');
if (query) {
  if (globalThis.gtag) {
    globalThis.gtag('event', 'elements-docs-search', { query: query });
  }
}
