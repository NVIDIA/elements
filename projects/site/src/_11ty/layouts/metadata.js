import { join } from 'node:path';
import { siteData } from '../../index.11tydata.js';

export const BASE_URL = join('/', process.env.PAGES_BASE_URL ?? '', '/');

const SITE_URL = 'https://nvidia.github.io/elements';
export const SOFTWARE_ID = `${SITE_URL}/#software`;
const SOFTWARE_URL = `${SITE_URL}/`;
const CODE_SAMPLE_ROUTES = ['/docs/cli/', '/docs/code/', '/docs/integrations/', '/docs/lint/', '/docs/mcp/'];

const LANGUAGE_NAMES = {
  bash: 'Shell',
  css: 'CSS',
  go: 'Go',
  html: 'HTML',
  javascript: 'JavaScript',
  js: 'JavaScript',
  json: 'JSON',
  markdown: 'Markdown',
  md: 'Markdown',
  python: 'Python',
  shell: 'Shell',
  sh: 'Shell',
  toml: 'TOML',
  ts: 'TypeScript',
  tsx: 'TypeScript',
  typescript: 'TypeScript',
  xml: 'XML',
  yaml: 'YAML',
  yml: 'YAML',
  zsh: 'Shell'
};

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

function appendSiteName(title) {
  if (title === 'NVIDIA Elements' || title.endsWith(' | NVIDIA Elements')) return title;
  return `${title} | NVIDIA Elements`;
}

function resolveSectionTitle(data, title) {
  const url = data.page?.url ?? '';
  if (url === '/examples/') return 'Example Gallery';
  if (url.startsWith('/docs/internal/guidelines/')) return `${title} Guidelines`;
  if (url.startsWith('/docs/integrations/')) return `${title} Integration`;
  if (url.startsWith('/docs/foundations/themes/')) return `Theme ${title}`;
  if (url.startsWith('/docs/labs/layout/responsive/patterns/')) return 'Responsive Layout Patterns';
  if (url.startsWith('/docs/labs/') && !url.startsWith('/docs/labs/layout/')) return `${title} Lab`;
  return title;
}

function resolvePageTitle(data, title) {
  if (data.changelog?.title) return appendSiteName(`${data.changelog.title} Changelog`);
  if (data.isApiTab) return appendSiteName(`${title} API`);
  if (data.isExamplesTab) return appendSiteName(`${title} Examples`);
  return appendSiteName(resolveSectionTitle(data, title));
}

function hasGeneratedPage(data, generatedUrls, url) {
  if (!generatedUrls.size) return true;
  return url === '/' || url === data.page?.url || generatedUrls.has(url);
}

export function resolvePageMeta(data) {
  const url = data.page?.url ?? '/';
  const rawTitle = data.title ?? 'NVIDIA Elements';
  const title = resolvePageTitle(data, rawTitle);
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
  } else if (data.changelog?.description) {
    description = `Changelog for ${data.changelog.title}: ${data.changelog.description}`;
  } else if (componentDescription) {
    description = componentDescription;
  } else {
    description = `Documentation for ${rawTitle} in NVIDIA Elements, the framework-agnostic design system for AI/ML factories.`;
  }

  const canonicalUrl = `${SITE_URL}${url}`;
  const ogImage = `${SITE_URL}/favicon.svg`;
  return { title, description, canonicalUrl, ogImage, url };
}

function jsonLdEncode(value) {
  return JSON.stringify(value).replace(/<\//g, '<\\/');
}

function isApiReferencePage(data, meta) {
  return Boolean(
    data.tag ||
      data.isApiTab ||
      meta.url.startsWith('/docs/api-design/') ||
      meta.url.startsWith('/docs/cli/') ||
      meta.url.startsWith('/docs/integrations/') ||
      meta.url.startsWith('/docs/lint/') ||
      meta.url.startsWith('/docs/mcp/')
  );
}

function normalizeDate(value) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== 'string') return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function getContentDates(data) {
  return {
    datePublished: normalizeDate(data.datePublished ?? data.published ?? data.git?.created ?? data.git?.createdTime),
    dateModified: normalizeDate(data.dateModified ?? data.modified ?? data.git?.modified ?? data.git?.modifiedTime)
  };
}

function getArticle(data, meta) {
  const isDocs = meta.url.startsWith('/docs/');
  const isApiReference = isApiReferencePage(data, meta);
  const element = findElementByTag(data.tag ?? data.component?.data?.tag);
  const dates = getContentDates(data);
  const article = {
    '@id': meta.canonicalUrl,
    '@type': isApiReference ? 'APIReference' : isDocs ? 'TechArticle' : 'WebPage',
    headline: meta.title,
    description: meta.description,
    url: meta.canonicalUrl,
    mainEntityOfPage: meta.canonicalUrl,
    inLanguage: 'en',
    image: meta.ogImage,
    publisher: { '@type': 'Organization', name: 'NVIDIA', url: SITE_URL },
    author: { '@type': 'Organization', name: 'NVIDIA' }
  };

  if (isDocs || meta.url === '/') {
    article.about = { '@id': SOFTWARE_ID };
  }

  if (isApiReference && element?.manifest?.tagName) {
    article.programmingModel = 'Web Components';
    article.targetPlatform = 'Web';

    if (element?.version) {
      article.assemblyVersion = element.version;
    }
  }

  if (dates.datePublished) article.datePublished = dates.datePublished;
  if (dates.dateModified) article.dateModified = dates.dateModified;

  return article;
}

function getBreadcrumb(data, meta) {
  const generatedUrls = new Set(data.collections?.all?.map(entry => entry.url).filter(Boolean));
  const segments = meta.url.split('/').filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  const itemListElement = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` }];
  let cumulative = '';
  segments.forEach((seg, i) => {
    cumulative += `/${seg}`;
    const item = i === segments.length - 1 && !meta.url.endsWith('/') ? meta.url : `${cumulative}/`;
    if (!hasGeneratedPage(data, generatedUrls, item)) return;

    itemListElement.push({
      '@type': 'ListItem',
      position: itemListElement.length + 1,
      name: titleCaseSegment(seg),
      item: `${SITE_URL}${item}`
    });
  });

  return {
    '@id': `${meta.canonicalUrl}#breadcrumb`,
    '@type': 'BreadcrumbList',
    itemListElement
  };
}

function getSoftwareApplication(description) {
  return {
    '@id': SOFTWARE_ID,
    '@type': 'SoftwareApplication',
    name: 'NVIDIA Elements',
    description,
    url: SOFTWARE_URL,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    runtimePlatform: 'Web',
    softwareHelp: SOFTWARE_URL
  };
}

function getPageText(data) {
  return [data.content, data.rawInput, data.templateContent].filter(value => typeof value === 'string').join('\n');
}

function normalizeLanguage(language) {
  if (typeof language !== 'string') return null;
  return LANGUAGE_NAMES[language.toLowerCase()] ?? null;
}

function getProgrammingLanguages(data) {
  const languages = new Set();
  const declared = data.programmingLanguage ?? data.programmingLanguages;
  const declaredLanguages = Array.isArray(declared) ? declared : [declared].filter(Boolean);
  declaredLanguages
    .map(String)
    .map(normalizeLanguage)
    .filter(Boolean)
    .forEach(language => languages.add(language));

  if (data.isExamplesTab) {
    languages.add('HTML');
  }

  const pageText = getPageText(data);
  [...pageText.matchAll(/(?:language|lang)=["']([^"']+)["']/g)].forEach(match => {
    const language = normalizeLanguage(match[1]);
    if (language) languages.add(language);
  });

  [...pageText.matchAll(/class=["'][^"']*language-([a-z0-9+-]+)[^"']*["']/gi)].forEach(match => {
    const language = normalizeLanguage(match[1]);
    if (language) languages.add(language);
  });

  [...pageText.matchAll(/```([a-z0-9+-]+)/gi)].forEach(match => {
    const language = normalizeLanguage(match[1]);
    if (language) languages.add(language);
  });

  return [...languages];
}

function hasVisibleCode(data) {
  return getProgrammingLanguages(data).length > 0;
}

function shouldEmitSoftwareSourceCode(data, meta) {
  if (data.structuredData?.sourceCode === false) return false;
  if (data.structuredData?.sourceCode === true) return true;
  if (data.isExamplesTab) return true;
  if (!hasVisibleCode(data)) return false;
  return CODE_SAMPLE_ROUTES.some(route => meta.url.startsWith(route));
}

function getCodeSampleType(data, meta) {
  if (data.structuredData?.codeSampleType) return data.structuredData.codeSampleType;
  if (meta.url.startsWith('/starters/')) return 'template';
  if (data.isExamplesTab || meta.url.includes('/examples/')) return 'full solution';
  return 'code snippet';
}

function getRuntimePlatform(meta) {
  return meta.url.startsWith('/docs/cli/') || meta.url.startsWith('/docs/mcp/') ? 'Native binary' : 'Web';
}

function getSoftwareSourceCode(data, meta) {
  if (!shouldEmitSoftwareSourceCode(data, meta)) return null;

  const programmingLanguage = getProgrammingLanguages(data);
  if (!programmingLanguage.length) return null;

  return {
    '@id': `${meta.canonicalUrl}#source-code`,
    '@type': 'SoftwareSourceCode',
    name: meta.title,
    description: meta.description,
    url: meta.canonicalUrl,
    codeSampleType: getCodeSampleType(data, meta),
    programmingLanguage: programmingLanguage.length === 1 ? programmingLanguage[0] : programmingLanguage,
    runtimePlatform: getRuntimePlatform(meta),
    targetProduct: { '@id': SOFTWARE_ID, '@type': 'SoftwareApplication' }
  };
}

export function renderJsonLd(data, meta) {
  const article = getArticle(data, meta);
  const breadcrumb = getBreadcrumb(data, meta);
  const sourceCode = getSoftwareSourceCode(data, meta);
  const graph = [
    article,
    ...(breadcrumb ? [breadcrumb] : []),
    ...(meta.url === '/' ? [getSoftwareApplication(meta.description)] : []),
    ...(sourceCode ? [sourceCode] : [])
  ];

  if (sourceCode) {
    article.hasPart = { '@id': sourceCode['@id'] };
  }

  return `<script type="application/ld+json">${jsonLdEncode({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
}
