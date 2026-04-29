import { join } from 'node:path';
import { ELEMENTS_SITE_URL } from '../utils/env.js';
import { siteData } from '../../index.11tydata.js';

export const BASE_URL = join('/', process.env.PAGES_BASE_URL ?? '', '/');

const SITE_ORIGIN = ELEMENTS_SITE_URL.replace(/\/$/, '');
const PATH_PREFIX = BASE_URL.replace(/\/$/, '');

const BREADCRUMB_TERMS = {
  api: 'API',
  cli: 'CLI',
  mcp: 'MCP',
  ssr: 'SSR',
  i18n: 'i18n',
  ui: 'UI',
  nextjs: 'Next.js',
  solidjs: 'SolidJS',
  nuxt: 'Nuxt',
  typescript: 'TypeScript',
  go: 'Go',
  vue: 'Vue',
  react: 'React',
  svelte: 'Svelte',
  preact: 'Preact',
  lit: 'Lit',
  hugo: 'Hugo',
  angular: 'Angular',
  monaco: 'Monaco',
  jsdoc: 'JSDoc',
  json: 'JSON',
  html: 'HTML',
  css: 'CSS',
  nvidia: 'NVIDIA',
  npm: 'npm'
};

export function escapeAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function titleCaseSegment(segment) {
  if (BREADCRUMB_TERMS[segment]) return BREADCRUMB_TERMS[segment];
  return segment
    .split('-')
    .map(part => BREADCRUMB_TERMS[part] ?? part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function findElementByTag(tag) {
  if (!tag) return null;
  return siteData.elements.find(e => e.name === tag) ?? null;
}

export function resolvePageMeta(data) {
  const url = data.page?.url ?? '/';
  const title = data.title ?? 'NVIDIA Elements';
  const tag = data.tag ?? data.component?.data?.tag;
  const element = findElementByTag(tag);
  const componentDescription = element?.manifest?.description?.trim();

  let description;
  if (data.description) {
    description = data.description;
  } else if (data.isApiTab && componentDescription) {
    description = `${componentDescription} — API reference for <${tag}>.`;
  } else if (data.isExamplesTab && componentDescription) {
    description = `${componentDescription} — Interactive examples for <${tag}>.`;
  } else if (componentDescription) {
    description = componentDescription;
  } else {
    description = `Documentation for ${title} in NVIDIA Elements, the framework-agnostic design system for AI/ML factories.`;
  }

  const canonicalUrl = `${SITE_ORIGIN}${PATH_PREFIX}${url}`;
  const ogImage = `${SITE_ORIGIN}${PATH_PREFIX}/favicon.svg`;
  return { title, description, canonicalUrl, ogImage, url };
}

function jsonLdEncode(value) {
  return JSON.stringify(value).replace(/<\//g, '<\\/');
}

export function renderJsonLd(data, meta) {
  const isDocs = meta.url.startsWith('/docs/');
  const articleType = isDocs ? 'TechArticle' : 'WebPage';
  const date = data.page?.date instanceof Date ? data.page.date.toISOString() : new Date().toISOString();

  const article = {
    '@context': 'https://schema.org',
    '@type': articleType,
    headline: meta.title,
    description: meta.description,
    url: meta.canonicalUrl,
    mainEntityOfPage: meta.canonicalUrl,
    inLanguage: 'en',
    image: meta.ogImage,
    datePublished: date,
    dateModified: date,
    publisher: { '@type': 'Organization', name: 'NVIDIA', url: SITE_ORIGIN },
    author: { '@type': 'Organization', name: 'NVIDIA' }
  };

  const segments = meta.url.split('/').filter(Boolean);
  const articleScript = `<script type="application/ld+json">${jsonLdEncode(article)}</script>`;
  if (segments.length === 0) {
    return articleScript;
  }

  const itemListElement = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}${PATH_PREFIX}/` }];
  let cumulative = '';
  segments.forEach((seg, i) => {
    cumulative += `/${seg}`;
    itemListElement.push({
      '@type': 'ListItem',
      position: i + 2,
      name: titleCaseSegment(seg),
      item: `${SITE_ORIGIN}${PATH_PREFIX}${cumulative}/`
    });
  });

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement
  };
  return `${articleScript}\n  <script type="application/ld+json">${jsonLdEncode(breadcrumb)}</script>`;
}
