import { promises as fsp } from 'node:fs';
import { getSiteUrl } from '../utils/site-url.js';

const EXCLUDED_PREFIXES = ['/docs/changelog/', '/docs/metrics/', '/examples/', '/404'];
const UTILITY_FILE_URLS = ['/llms.txt', '/llms-full.txt'];
const ROBOTS_NOINDEX = /<meta\s+[^>]*name=["']robots["'][^>]*content=["'][^"']*\bnoindex\b/i;

export function isSitemapPageUrl(url) {
  if (!url) return false;
  if (UTILITY_FILE_URLS.includes(url)) return false;
  if (!url.endsWith('/') && !url.endsWith('.html')) return false;
  if (EXCLUDED_PREFIXES.some(prefix => url.startsWith(prefix))) return false;
  return true;
}

function isPublishableResult(result) {
  if (!isSitemapPageUrl(result.url) || result.data?.noindex || result.data?.component?.data?.hideExamplesTab) {
    return false;
  }
  return !ROBOTS_NOINDEX.test(result.content ?? '');
}

export function sitemapPlugin(eleventyConfig) {
  eleventyConfig.on('eleventy.after', async ({ results } = {}) => {
    const urls = [...new Set((results ?? []).filter(isPublishableResult).map(result => result.url))].sort();
    const entries = urls.map(url => {
      const loc = getSiteUrl(url);
      return ['<url>', `<loc>${loc}</loc>`, '</url>'].join('\n');
    });

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...entries,
      '</urlset>',
      ''
    ].join('\n');

    await fsp.mkdir('./.11ty-vite/public/', { recursive: true });
    await fsp.writeFile('./.11ty-vite/public/sitemap.xml', xml, 'utf-8');
  });
}
