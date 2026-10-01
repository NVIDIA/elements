import { describe, expect, it } from 'vitest';
import { lintRules } from '../../docs/lint/rules.js';
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
    expect(isSitemapPageUrl('/DESIGN.md')).toBe(false);
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
    expect(sitemap).not.toContain('<loc>https://nvidia.github.io/elements/DESIGN.md</loc>');
    expect(sitemap.match(/<lastmod>/g)).toHaveLength(1);
  });

  it('should include every generated lint rule page', () => {
    const sitemap = renderSitemap(lintRules.map(rule => ({ content: '', url: rule.path })));
    const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);

    expect(locations).toEqual(lintRules.map(rule => `https://nvidia.github.io/elements${rule.path}`));
  });

  it('should include release video metadata and escape editorial text', () => {
    const sitemap = renderSitemap([
      {
        url: '/docs/whats-new/08-2026/',
        content: `<script type="application/ld+json">${JSON.stringify({
          '@graph': [
            {
              '@type': 'VideoObject',
              thumbnailUrl: 'https://nvidia.github.io/elements/static/video/releases/08-2026.webp',
              name: 'August 2026 NVIDIA Elements release highlights',
              description: 'Icons & media <release highlights>',
              contentUrl: 'https://nvidia.github.io/elements/static/video/releases/08-2026.webm'
            }
          ]
        })}</script>`
      }
    ]);

    expect(sitemap).toContain('xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"');
    expect(sitemap).toContain(
      '<video:thumbnail_loc>https://nvidia.github.io/elements/static/video/releases/08-2026.webp</video:thumbnail_loc>'
    );
    expect(sitemap).toContain('<video:description>Icons &amp; media &lt;release highlights&gt;</video:description>');
    expect(sitemap).toContain(
      '<video:content_loc>https://nvidia.github.io/elements/static/video/releases/08-2026.webm</video:content_loc>'
    );
    expect(sitemap.match(/<video:video>/g)).toHaveLength(1);
  });
});
