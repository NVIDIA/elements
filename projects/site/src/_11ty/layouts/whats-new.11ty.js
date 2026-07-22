import { getContentDates } from '../utils/content-dates.js';
import { getSiteUrl } from '../utils/site-url.js';

export const data = {
  layout: 'docs.11ty.js'
};

export function renderUpdatesFeedLink() {
  return /* html */ `
    <nve-button container="flat">
      <a href="${getSiteUrl('/feed.xml')}" target="_blank" rel="alternate noopener" type="application/rss+xml">
        Subscribe via RSS <nve-icon name="sensor" size="sm"></nve-icon>
      </a>
    </nve-button>
  `;
}

export function getUpdateMonth(entry) {
  return new Date(entry.data?.updateMonth ?? entry.date);
}

export function formatUpdateMonth(entry) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric'
  }).format(getUpdateMonth(entry));
}

function formatContentDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric'
  }).format(new Date(date));
}

export function sortUpdatesNewestFirst(entries) {
  return [...entries].sort((left, right) => getUpdateMonth(right) - getUpdateMonth(left));
}

export function renderUpdateDates(data) {
  const { datePublished, dateModified } = getContentDates(data);
  const dates = [];

  if (datePublished) {
    dates.push(`Published <time datetime="${datePublished}">${formatContentDate(datePublished)}</time>`);
  }

  if (dateModified && datePublished && Date.parse(dateModified) > Date.parse(datePublished)) {
    dates.push(`Updated <time datetime="${dateModified}">${formatContentDate(dateModified)}</time>`);
  }

  return dates.length > 0 ? `<p nve-text="body sm muted">${dates.join(' · ')}</p>` : '';
}

export function getRecentUpdates(data) {
  return sortUpdatesNewestFirst(data.collections?.['whats-new'] ?? []).slice(0, 6);
}

export function renderRecentUpdates(data) {
  const entries = getRecentUpdates(data);
  if (entries.length === 0) return '';

  return /* html */ `
    <aside nve-layout="column gap:sm span:12 &xl|span:3 pad-left:lg">
      ${renderUpdatesFeedLink()}
      <nav aria-label="Recent updates" nve-layout="column gap:sm">
        <ul nve-text="list" nve-layout="column gap:xs">
          ${entries.map(entry => `<li><a href="${entry.url}" ${entry.url === data.page?.url ? 'aria-current="page"' : ''} nve-text="link no-visit">What’s New - ${formatUpdateMonth(entry)}</a></li>`).join('')}
        </ul>
      </nav>
    </aside>
  `;
}

export function render(data) {
  const recentUpdates = renderRecentUpdates(data);

  return /* html */ `
    <header nve-layout="column gap:xs">
      <h1 nve-text="display">${data.title}</h1>
    </header>
    <div nve-layout="grid gap:xl">
      <article nve-layout="column gap:xl ${recentUpdates ? 'span:12 &xl|span:9' : 'span:12'}">
        ${renderUpdateDates(data)}
        ${data.content}
        <footer>
          <p nve-text="body">
            <a href="/docs/changelog/" nve-text="link no-visit">Browse package changelogs</a> or
            <a href="https://github.com/NVIDIA/elements/releases" target="_blank" rel="noopener" nve-text="link no-visit">view all GitHub releases</a>.
          </p>
        </footer>
      </article>
      ${recentUpdates}
    </div>
  `;
}
