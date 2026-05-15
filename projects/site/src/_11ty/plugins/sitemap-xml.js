import { promises as fsp } from 'node:fs';
import { BASE_URL } from '../layouts/metadata.js';
import { ELEMENTS_SITE_URL } from '../utils/env.js';

const SITE_ORIGIN = ELEMENTS_SITE_URL.replace(/\/$/, '');
const PATH_PREFIX = BASE_URL.replace(/\/$/, '');
const EXCLUDED_PREFIXES = ['/docs/changelog/', '/docs/metrics/', '/examples/', '/404'];
const ROBOTS_NOINDEX = /<meta\s+[^>]*name=["']robots["'][^>]*content=["'][^"']*\bnoindex\b/i;

function isPublishable(url) {
  if (!url) return false;
  if (!url.endsWith('/') && !url.endsWith('.html')) return false;
  if (EXCLUDED_PREFIXES.some(prefix => url.startsWith(prefix))) return false;
  return true;
}

function isPublishableResult(result) {
  if (!isPublishable(result.url) || result.data?.noindex || result.data?.component?.data?.hideExamplesTab) return false;
  return !ROBOTS_NOINDEX.test(result.content ?? '');
}

export function sitemapPlugin(eleventyConfig) {
  eleventyConfig.on('eleventy.after', async ({ results } = {}) => {
    const urls = [...new Set((results ?? []).filter(isPublishableResult).map(result => result.url))].sort();
    const entries = urls.map(url => {
      const loc = `${SITE_ORIGIN}${PATH_PREFIX}${url}`;
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
