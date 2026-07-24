import { describe, expect, it } from 'vitest';
import {
  data,
  getRecentUpdates,
  render,
  renderRecentUpdates,
  renderUpdateDates,
  renderUpdatesFeedLink
} from './whats-new.11ty.js';

function createUpdate(month: number) {
  const monthLabel = String(month).padStart(2, '0');

  return {
    data: { updateMonth: `2026-${monthLabel}-01` },
    date: new Date('2026-07-22T00:00:00Z'),
    url: `/docs/whats-new/${monthLabel}-2026/`
  };
}

describe('What’s New layout', () => {
  it('should use the documentation layout', () => {
    expect(data).toEqual({ layout: 'docs.11ty.js' });
  });

  it('should render consistent post chrome around the update content', () => {
    const content = '<h2>Highlights</h2>';
    const current = createUpdate(7);
    const html = render({
      collections: { 'whats-new': [current] },
      content,
      dateModified: '2026-07-22',
      datePublished: '2026-07-22',
      page: { url: current.url },
      title: 'What’s new in NVIDIA Elements: July 2026'
    });

    expect(html).toContain('<h1 nve-text="display">What’s new in NVIDIA Elements: July 2026</h1>');
    expect(html).toContain('Published <time datetime="2026-07-22T00:00:00.000Z">July 22, 2026</time>');
    expect(html).toContain(renderUpdatesFeedLink());
    expect(html).toContain(content);
    expect(html).toContain('href="/docs/changelog/"');
    expect(html).toContain('href="https://github.com/NVIDIA/elements/releases"');
  });

  it('should show an updated date only after a genuine later revision', () => {
    expect(renderUpdateDates({ dateModified: '2026-07-22', datePublished: '2026-07-22' })).toBe(
      '<p nve-text="body sm muted">Published <time datetime="2026-07-22T00:00:00.000Z">July 22, 2026</time></p>'
    );
    expect(renderUpdateDates({ dateModified: '2026-07-24', datePublished: '2026-07-22' })).toContain(
      'Updated <time datetime="2026-07-24T00:00:00.000Z">July 24, 2026</time>'
    );
    expect(renderUpdateDates({})).toBe('');
  });

  it('should omit the updated date when modification predates publication', () => {
    const html = renderUpdateDates({ dateModified: '2026-07-20', datePublished: '2026-07-22' });

    expect(html).toContain('Published <time datetime="2026-07-22T00:00:00.000Z">July 22, 2026</time>');
    expect(html).not.toContain('Updated');
  });

  it('should list the six most recent updates newest first on every post', () => {
    const updates = [1, 2, 3, 4, 5, 6, 7, 8].map(createUpdate);
    const pageData = {
      collections: { 'whats-new': updates },
      page: { url: updates[0].url }
    };

    expect(getRecentUpdates(pageData)).toEqual(updates.slice(2).reverse());

    const html = renderRecentUpdates(pageData);
    expect(html).toContain('aria-label="Recent updates"');
    expect(html).toContain('August 2026');
    expect(html).toContain('March 2026');
    expect(html).not.toContain('February 2026');
    expect(html).not.toContain('January 2026');
  });

  it('should mark the viewed update as the current page when it is recent', () => {
    const current = createUpdate(6);
    const pageData = {
      collections: { 'whats-new': [createUpdate(5), current, createUpdate(7)] },
      page: { url: current.url }
    };

    expect(renderRecentUpdates(pageData)).toContain(`href="${current.url}" aria-current="page"`);
  });

  it('should omit the recent-updates navigation when no posts are available', () => {
    expect(renderRecentUpdates({ collections: { 'whats-new': [] } })).toBe('');
  });

  it('should link to the RSS feed with feed metadata', () => {
    const html = renderUpdatesFeedLink();

    expect(html).toContain('href="https://nvidia.github.io/elements/feed.xml"');
    expect(html).toContain('rel="alternate noopener"');
    expect(html).toContain('type="application/rss+xml"');
  });
});
