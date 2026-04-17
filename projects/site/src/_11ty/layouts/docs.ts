// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ResizeHandle } from '@nvidia-elements/core/resize-handle';
import type { Tree } from '@nvidia-elements/core/tree';
import { FILTER_VALUES, type DocsSearch } from '../../_internal/search/search.js';
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
 * like nve-page which has overflow:hidden but can still scroll programmatically.
 */
function scrollToHeading(headerId: string, behavior: ScrollBehavior = 'smooth') {
  if (!headerId) return;
  const heading = globalThis.document.getElementById(headerId);
  if (!heading || !docsMain) return;

  // Calculate the scroll position relative to the scrollable container
  // Respect the element's scroll-margin-top for consistent padding above the heading
  const headingRect = heading.getBoundingClientRect();
  const containerRect = docsMain.getBoundingClientRect();
  const scrollMargin = parseFloat(getComputedStyle(heading).scrollMarginTop) || 0;
  const scrollTop = docsMain.scrollTop + (headingRect.top - containerRect.top) - scrollMargin;

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

const docsSearch = globalThis.document.querySelector<DocsSearch>('#docs-search')!;
const docsNav = globalThis.document.querySelector<Tree>('#docs-nav')!;

// Track the current search and filter state
let isSearching = false;
let currentFilter: string | null = null;

/**
 * Syncs the current search query and active filter to URL parameters.
 * Updates browser history without triggering navigation or adding new entries.
 */
function syncSearchStateToUrl(query: string, filter: string | null) {
  const currentUrl = new URL(globalThis.location.href);
  let urlHasChanged = false;

  // Handle search query parameter
  if (query.length > 0) {
    currentUrl.searchParams.set('q', query);
    urlHasChanged = true;
  } else if (currentUrl.searchParams.has('q')) {
    currentUrl.searchParams.delete('q');
    urlHasChanged = true;
  }

  // Handle filter parameter (only if it's a valid filter value)
  const isValidFilter = filter && FILTER_VALUES.includes(filter as (typeof FILTER_VALUES)[number]);

  if (isValidFilter) {
    currentUrl.searchParams.set('filter', filter);
    urlHasChanged = true;
  } else if (currentUrl.searchParams.has('filter')) {
    currentUrl.searchParams.delete('filter');
    urlHasChanged = true;
  }

  // Only update browser history if something actually changed
  if (urlHasChanged) {
    const newUrl = currentUrl.pathname + currentUrl.search + currentUrl.hash;
    globalThis.history.replaceState(null, '', newUrl);
  }
}

// Listen for any search state change (query input, filter selection, or reset)
// The search component emits a single 'search-change' event for all state transitions
docsSearch.addEventListener('search-change', ((event: CustomEvent) => {
  const { query, filter } = event.detail as { query: string; filter: string | null };

  isSearching = query.length > 0;
  currentFilter = filter;
  syncSearchStateToUrl(query, filter);

  // Restore navigation when search is fully cleared (no query and no filter)
  if (!isSearching && filter === null) {
    toggleSideNav(true);
  }
}) as EventListener);

// Listen for search results loaded
// Hides the navigation tree and expands the side panel to accommodate results
docsSearch.addEventListener('search-results', () => {
  toggleSideNav(false);
});

// Listen for no results found
// Restores the navigation tree since there are no results to display
docsSearch.addEventListener('search-no-results', () => {
  toggleSideNav(true);
});

// Listen for search input blur
// Restores navigation if user is not actively searching
docsSearch.addEventListener('search-blur', () => !isSearching && toggleSideNav(true));

const defaultWidth = `${handle.getAttribute('value')}px`;
const toggleSideNav = (state: boolean) => {
  if (state) {
    // Showing nav - shrink panel to default width
    panel.style.width = defaultWidth;
  } else {
    // Hiding nav for search - expand panel for search results
    panel.style.width = `${handle.max}px`;
  }
  docsNav.hidden = !state;
};

// Initialize search from URL parameters (if present)
// This allows for shareable search links with pre-filled queries and filters
const searchParams = new URLSearchParams(globalThis.location.search);
const searchQuery = searchParams.get('q');
const filterParam = searchParams.get('filter');

// Check and apply filter from URL
const isValidFilterParam = filterParam && FILTER_VALUES.includes(filterParam as (typeof FILTER_VALUES)[number]);

if (isValidFilterParam) {
  currentFilter = filterParam;
}

// If there's a search query in the URL, initialize the search component
if (searchQuery) {
  // Track search analytics if Google Analytics is available
  if (globalThis.gtag) {
    globalThis.gtag('event', 'elements-docs-search', { query: searchQuery });
  }

  // Wait for the search component to register and become ready
  await customElements.whenDefined('nvd-search');
  await docsSearch.updateComplete;

  // Apply filter if the URL contains one
  if (currentFilter) {
    docsSearch.filter = currentFilter;
  }

  // Populate the search input and trigger the search
  const searchInputElement = docsSearch.shadowRoot?.querySelector<HTMLInputElement>('#search-input');

  if (searchInputElement) {
    searchInputElement.value = searchQuery;
    searchInputElement.focus();

    // Hide navigation and show search results
    toggleSideNav(false);
    isSearching = true;

    void docsSearch.search(searchQuery);
  }
} else if (currentFilter) {
  // If there's only a filter (no query), just apply the filter
  await customElements.whenDefined('nvd-search');
  await docsSearch.updateComplete;

  docsSearch.filter = currentFilter;
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
