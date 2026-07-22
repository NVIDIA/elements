import { promises as fsp } from 'node:fs';
import { getExplicitModifiedDate, normalizeContentDate } from '../utils/content-dates.js';
import { getSiteUrl } from '../utils/site-url.js';

const EXCLUDED_PREFIXES = ['/docs/changelog/', '/docs/metrics/', '/examples/', '/404'];
const UTILITY_FILE_URLS = ['/llms.txt', '/llms-full.txt'];
const ROBOTS_NOINDEX = /<meta\s+[^>]*name=["']robots["'][^>]*content=["'][^"']*\bnoindex\b/i;
const JSON_LD_SCRIPT =
  /<script\b[^>]*\btype=(?:"application\/ld\+json"|'application\/ld\+json'|application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/gi;

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

function getResultModifiedDate(result) {
  const explicitDate = getExplicitModifiedDate(result.data);
  if (explicitDate) return explicitDate;

  for (const script of (result.content ?? '').matchAll(JSON_LD_SCRIPT)) {
    const structuredDate = /"dateModified":"([^"]+)"/.exec(script[1])?.[1];
    if (structuredDate) return normalizeContentDate(structuredDate);
  }

  return null;
}

export function renderSitemap(results = []) {
  const pages = new Map(results.filter(isPublishableResult).map(result => [result.url, result]));
  const entries = [...pages.values()]
    .sort((left, right) => left.url.localeCompare(right.url))
    .map(result => {
      const loc = getSiteUrl(result.url);
      const lastModified = getResultModifiedDate(result);
      return [
        '<url>',
        `<loc>${loc}</loc>`,
        ...(lastModified ? [`<lastmod>${lastModified}</lastmod>`] : []),
        '</url>'
      ].join('\n');
    });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    ''
  ].join('\n');
}

export function sitemapPlugin(eleventyConfig) {
  eleventyConfig.on('eleventy.after', async ({ results } = {}) => {
    await fsp.mkdir('./.11ty-vite/public/', { recursive: true });
    await fsp.writeFile('./.11ty-vite/public/sitemap.xml', renderSitemap(results), 'utf-8');
  });
}
