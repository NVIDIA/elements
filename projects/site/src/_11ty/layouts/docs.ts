import type { ResizeHandle } from '@nvidia-elements/core/resize-handle';
import type { Tree } from '@nvidia-elements/core/tree';
import type { DocsSearch } from '../../_internal/search/search.js';
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
const handle = globalThis.document.querySelector<ResizeHandle>('nve-resize-handle[slot="left-aside"]')!;
const panel = globalThis.document.querySelector<HTMLElement>('nve-page-panel[slot="left-aside"]')!;
handle.addEventListener('input', e => (panel.style.width = (e.target as HTMLInputElement).value + 'px'));

// auto-scroll to deep-link headers
const docsMain = globalThis.document.querySelector<HTMLElement>('#docs-main')!;

/**
 * Scrolls to an element by ID within the #docs-main container.
 * Uses manual scroll calculation to avoid scrollIntoView scrolling ancestor elements
 * like nve-page which has overflow:hidden but can still be scrolled programmatically.
 */
function scrollToHeading(headerId: string, behavior: ScrollBehavior = 'smooth') {
  if (!headerId) return;
  const heading = globalThis.document.getElementById(headerId);
  if (!heading || !docsMain) return;

  // Calculate the scroll position relative to the scrollable container
  const headingRect = heading.getBoundingClientRect();
  const containerRect = docsMain.getBoundingClientRect();
  const scrollTop = docsMain.scrollTop + (headingRect.top - containerRect.top);

  docsMain.scrollTo({ top: scrollTop, behavior });
}

setTimeout(() => {
  const url = new URL(globalThis.window.parent.location.href);
  const isExamplesRoute = url.pathname.includes('/examples');
  const isEditMode = url.searchParams.get('edit') === 'true' || url.searchParams.get('edit') === '1';
  if (isExamplesRoute && isEditMode) return;

  const headerId = url.hash.replace('#', '');
  scrollToHeading(headerId);
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
const docsSearch = globalThis.document.querySelector<DocsSearch>('#docs-search')!;
const docsNav = globalThis.document.querySelector<Tree>('#docs-nav')!;

let isSearching = false;
docsSearch.addEventListener('search-change', (event: CustomEvent) => (isSearching = event.detail.length > 0));
docsSearch.addEventListener('search-reset', () => ((isSearching = false), toggleSideNav(true)));
docsSearch.addEventListener('search-focus', () => toggleSideNav(false));
docsSearch.addEventListener('search-blur', () => !isSearching && toggleSideNav(true));

let prevWidth = panel.style.width;
const toggleSideNav = (state: boolean) => {
  if (state) {
    // Showing nav - shrink panel to default width
    panel.style.width = prevWidth;
  } else {
    // Hiding nav for search - expand panel for search results
    prevWidth = panel.style.width;
    panel.style.width = `${handle.max}px`;
  }
  docsNav.hidden = !state;
};

const searchParams = new URLSearchParams(globalThis.location.search);
const query = searchParams.get('q');
if (query) {
  if (globalThis.gtag) {
    globalThis.gtag('event', 'elements-docs-search', { query: query });
  }

  // Pre-load search from URL query param
  await customElements.whenDefined('nvd-search');
  await docsSearch.updateComplete;
  const searchInput = docsSearch.shadowRoot?.querySelector('#search-input');
  if (searchInput) {
    searchInput.value = query;
    searchInput.focus();
    toggleSideNav(false);
    isSearching = true;
    void docsSearch.search(query);
  }
}

// Add clickable anchor links to headings
function addHeadingAnchors() {
  // Find all h2 and h3 elements with mkd class
  const headings = globalThis.document.querySelectorAll('h2[nve-text*="mkd"], h3[nve-text*="mkd"]');

  headings.forEach(heading => {
    // Skip if anchor already exists
    if (heading.querySelector('.heading-anchor')) return;

    // Get or generate ID
    const id = heading.id;

    // Create anchor element
    const anchor = globalThis.document.createElement('a');
    anchor.className = 'heading-anchor';
    anchor.href = `${globalThis.window.parent.location.pathname}#${id}`;
    anchor.setAttribute('aria-label', 'Copy link to this section');
    anchor.innerHTML = '<nve-icon-button container="inline" icon-name="link"></nve-icon-button>';

    // Add click handler
    anchor.addEventListener('click', e => {
      e.preventDefault();

      // Update URL hash without triggering default scroll
      globalThis.history.pushState(null, '', `${globalThis.window.location.pathname}#${id}`);

      // Scroll to heading using controlled scroll
      scrollToHeading(id);

      // Copy to clipboard
      if (globalThis.navigator.clipboard) {
        void globalThis.navigator.clipboard.writeText(
          `${globalThis.window.location.origin}${globalThis.window.location.pathname}#${id}`
        );
      }
    });

    // Insert anchor as first child of heading
    heading.insertBefore(anchor, heading.firstChild);
  });
}

// Run on initial load
addHeadingAnchors();
