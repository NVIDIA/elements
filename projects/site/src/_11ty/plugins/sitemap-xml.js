import { promises as fsp } from 'node:fs';
import { getExplicitModifiedDate, normalizeContentDate } from '../utils/content-dates.js';
import { getReleaseVideo } from '../utils/release-video.js';
import { getSiteUrl } from '../utils/site-url.js';

const EXCLUDED_PREFIXES = ['/docs/changelog/', '/docs/metrics/', '/examples/', '/404'];
const UTILITY_FILE_URLS = ['/llms.txt', '/llms-full.txt'];
const ROBOTS_NOINDEX = /<meta\s+[^>]*name=["']robots["'][^>]*content=["'][^"']*\bnoindex\b/i;
const JSON_LD_SCRIPT =
  /<script\b[^>]*\btype=(?:"application\/ld\+json"|'application\/ld\+json'|application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/gi;

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

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

function getResultVideo(result) {
  if (!result.url?.startsWith('/docs/whats-new/')) return null;

  const video = getReleaseVideo(result.data);
  if (video) return video;

  for (const script of (result.content ?? '').matchAll(JSON_LD_SCRIPT)) {
    const structuredData = JSON.parse(script[1]);
    const videoNode = structuredData['@graph']?.find(node => node['@type'] === 'VideoObject');
    if (videoNode) {
      return {
        posterUrl: videoNode.thumbnailUrl,
        title: videoNode.name,
        description: videoNode.description,
        videoUrl: videoNode.contentUrl
      };
    }
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
      const video = getResultVideo(result);
      return [
        '<url>',
        `<loc>${escapeXml(loc)}</loc>`,
        ...(lastModified ? [`<lastmod>${lastModified}</lastmod>`] : []),
        ...(video
          ? [
              '<video:video>',
              `<video:thumbnail_loc>${escapeXml(video.posterUrl)}</video:thumbnail_loc>`,
              `<video:title>${escapeXml(video.title)}</video:title>`,
              `<video:description>${escapeXml(video.description)}</video:description>`,
              `<video:content_loc>${escapeXml(video.videoUrl)}</video:content_loc>`,
              '</video:video>'
            ]
          : []),
        '</url>'
      ].join('\n');
    });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">',
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
