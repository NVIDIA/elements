import { describe, expect, it } from 'vitest';
import { isSitemapPageUrl } from './sitemap-xml.js';

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
});
