import type { PagePanelContent } from '@nvidia-elements/core/page';

const iframe = globalThis.document.querySelector('iframe');
const list = globalThis.document.querySelector('ul.stories');

list?.addEventListener('click', e => {
  e.preventDefault();
  const target = e.target as HTMLElement;
  const link = target.closest('a');
  if (link && iframe) {
    iframe.src = link.href;

    // set the story href as a query param on the parent page
    const url = new URL(globalThis.window.location.href);
    const story = link.href.split('/stories/')[1];
    url.searchParams.set('story', story);
    globalThis.window.history.replaceState({}, '', url.toString());
    setSelected(story);
  }
});

// on page load, check for a query param and load the story
globalThis.window.addEventListener('load', () => {
  const url = new URL(globalThis.window.location.href);
  const story = url.searchParams.get('story')!;
  if (story && iframe) {
    iframe.src = `stories/${story}`;
  }
  setSelected(story);
});

function setSelected(url: string) {
  globalThis.document.querySelectorAll('a').forEach(a => a.removeAttribute('selected'));
  const link = globalThis.document.querySelector(`a[href*="${url}"]`);
  if (link) {
    link.setAttribute('selected', '');
  }
}

// preserve scroll position between page transitions

const content = globalThis.document.querySelector<PagePanelContent>('#stories-sidenav-panel nve-page-panel-content')!;
globalThis.window.addEventListener('beforeunload', () => {
  sessionStorage.setItem('sidenav-scroll-position', content.scrollTop.toString());
});

const savedPosition = sessionStorage.getItem('sidenav-scroll-position');
if (savedPosition) {
  await customElements.whenDefined('nve-page-panel-content');
  content.scrollTop = parseInt(savedPosition);
  await content.updateComplete;
  content.scrollTop = parseInt(savedPosition);
}
