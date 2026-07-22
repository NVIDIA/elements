import { describe, expect, it } from 'vitest';
import { isSitemapPageUrl, renderSitemap } from './sitemap-xml.js';

describe('isSitemapPageUrl', () => {
  it('should include crawlable html pages', () => {
    expect(isSitemapPageUrl('/')).toBe(true);
    expect(isSitemapPageUrl('/context/index.html')).toBe(true);
    expect(isSitemapPageUrl('/docs/cli/')).toBe(true);
    expect(isSitemapPageUrl('/docs/elements/')).toBe(true);
    expect(isSitemapPageUrl('/docs/foundations/')).toBe(true);
  });

  it('should exclude agent utility files from sitemap pages', () => {
    expect(isSitemapPageUrl('/llms.txt')).toBe(false);
    expect(isSitemapPageUrl('/llms-full.txt')).toBe(false);
  });

  it('should exclude non-indexable site sections', () => {
    expect(isSitemapPageUrl('/404.html')).toBe(false);
    expect(isSitemapPageUrl('/docs/changelog/')).toBe(false);
    expect(isSitemapPageUrl('/docs/metrics/')).toBe(false);
    expect(isSitemapPageUrl('/examples/')).toBe(false);
  });

  it('should emit lastmod only from explicit modification metadata', () => {
    const sitemap = renderSitemap([
      {
        content: '<script type="application/ld+json">{"dateModified":"2026-07-24T00:00:00.000Z"}</script>',
        url: '/docs/whats-new/06-2026/'
      },
      {
        content: '<code>{"dateModified":"2026-07-25T00:00:00.000Z"}</code>',
        url: '/docs/about/support/'
      }
    ]);

    expect(sitemap).toContain(
      '<loc>https://nvidia.github.io/elements/docs/whats-new/06-2026/</loc>\n<lastmod>2026-07-24T00:00:00.000Z</lastmod>'
    );
    expect(sitemap).toContain('<loc>https://nvidia.github.io/elements/docs/about/support/</loc>');
    expect(sitemap.match(/<lastmod>/g)).toHaveLength(1);
  });
});
