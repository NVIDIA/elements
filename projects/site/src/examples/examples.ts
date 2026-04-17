// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import './examples.css';
import type { PagePanelContent } from '@nvidia-elements/core/page';

const iframe = globalThis.document.querySelector('iframe');
const list = globalThis.document.querySelector('ul.examples');

list?.addEventListener('click', e => {
  e.preventDefault();
  const target = e.target as HTMLElement;
  const link = target.closest('a');
  if (link && iframe) {
    iframe.src = link.href;

    // set the example href as a query param on the parent page
    const url = new URL(globalThis.window.location.href);
    const example = link.href.split('/examples/')[1];
    url.searchParams.set('example', example);
    globalThis.window.history.replaceState({}, '', url.toString());
    setSelected(example);
  }
});

// on page load, check for a query param and load the example
globalThis.window.addEventListener('load', () => {
  const url = new URL(globalThis.window.location.href);
  const example = url.searchParams.get('example')!;
  if (example && iframe) {
    iframe.src = `examples/${example}`;
  }
  setSelected(example);
});

function setSelected(url: string) {
  globalThis.document.querySelectorAll('a').forEach(a => a.removeAttribute('selected'));
  const link = globalThis.document.querySelector(`a[href*="${url}"]`);
  if (link) {
    link.setAttribute('selected', '');
  }
}

// preserve scroll position between page transitions

const content = globalThis.document.querySelector<PagePanelContent>('#examples-sidenav-panel nve-page-panel-content')!;
globalThis.window.addEventListener('beforeunload', () => {
  if (content.scrollTop !== 0) {
    sessionStorage.setItem('sidenav-scroll-position', content.scrollTop.toString());
  }
});

const savedPosition = sessionStorage.getItem('sidenav-scroll-position');
if (savedPosition) {
  await customElements.whenDefined('nve-page-panel-content');
  content.scrollTop = parseInt(savedPosition);
  await content.updateComplete;
  content.scrollTop = parseInt(savedPosition);
}
