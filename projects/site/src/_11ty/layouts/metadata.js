import { siteData } from '../../index.11tydata.js';
import { BASE_URL, DEPLOYED_SITE_URL } from '../utils/site-url.js';

export { BASE_URL };

const SITE_URL = DEPLOYED_SITE_URL;
const ORGANIZATION_URL = 'https://www.nvidia.com/';
const REPOSITORY_URL = 'https://github.com/NVIDIA/elements';
const SOFTWARE_URL = `${SITE_URL}/`;
export const SOCIAL_IMAGE_URL = `${SITE_URL}/static/images/social-card.png`;
export const SOCIAL_IMAGE_ALT = 'NVIDIA Elements design system preview.';
export const AUTHOR_ID = `${SITE_URL}/#author`;
export const AUTHOR_NAME = 'NVIDIA Elements Team';
export const AUTHOR_URL = SOFTWARE_URL;
export const AUTHOR_CREDENTIALS = 'NVIDIA design system engineers for Web Components and AI/ML interface tooling.';
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const SOFTWARE_ID = `${SITE_URL}/#software`;
const SOFTWARE_DESCRIPTION =
  'NVIDIA Elements is a framework-agnostic Design System and UI Agent Harness for AI/ML Infrastructure, Robotics, and Autonomous Vehicles';
const SITE_TITLE_SUFFIX = ' | NVIDIA Elements';
const MIN_TITLE_LENGTH = 50;
const MIN_DESCRIPTION_LENGTH = 150;
const DEFAULT_TITLE_QUALIFIER = 'Documentation and API Reference';
const CODE_SAMPLE_ROUTES = ['/docs/cli/', '/docs/code/', '/docs/integrations/', '/docs/lint/', '/docs/mcp/'];

const TITLE_QUALIFIERS = [
  { route: '/docs/about/', qualifiers: ['Project Guide and Resources'] },
  { route: '/docs/api-design/', qualifiers: ['API Guide for Web Components'] },
  { route: '/docs/changelog/', qualifiers: ['Release Notes', 'Release Notes and Package Changelog'] },
  { route: '/docs/cli/', qualifiers: ['Command Line Interface Guide for Web Components'] },
  { route: '/docs/code/', qualifiers: ['Package Guide', 'Package Documentation and Examples'] },
  {
    route: '/docs/elements/',
    qualifiers: ['Component Guide', 'Component API Reference', 'Web Component API Reference Guide']
  },
  { route: '/docs/foundations/layout/', qualifiers: ['Layout Foundations Guide for Web Components'] },
  { route: '/docs/foundations/', qualifiers: ['Design Foundations Guide', 'Design Foundations Guide for UI'] },
  { route: '/docs/integrations/', qualifiers: ['Web Component Guide', 'Web Component Integration Guide'] },
  { route: '/docs/labs/', qualifiers: ['Guide for Web Components', 'Experimental UI Guide'] },
  { route: '/docs/lint/', qualifiers: ['Static Analysis Guide for Web Components'] },
  { route: '/docs/markdown/', qualifiers: ['Package Guide', 'Package Documentation and Examples'] },
  { route: '/docs/mcp/', qualifiers: ['Model Context Protocol Guide'] },
  { route: '/docs/metrics/', qualifiers: ['Quality Metrics and Reports'] },
  { route: '/docs/monaco/', qualifiers: ['Package Guide', 'Package Documentation and Examples'] },
  { route: '/docs/patterns/', qualifiers: ['Pattern Guide', 'UI Pattern Library Guide'] },
  { route: '/examples/', qualifiers: ['Component Example Gallery'] },
  { route: '/starters/', qualifiers: ['Starter Templates', 'Starter Templates for Web Apps'] }
];

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
  if (title === 'NVIDIA Elements' || title.endsWith(SITE_TITLE_SUFFIX)) return title;
  return `${title}${SITE_TITLE_SUFFIX}`;
}

function resolveThemeTitle(url, title) {
  if (url === '/docs/foundations/themes/') return 'Theme System';
  if (title === 'Design Tokens' || title.endsWith('Themes')) return title;
  return `${title} Theme Tokens`;
}

function resolveSectionTitle(data, title) {
  const url = data.page?.url ?? '';
  if (url === '/starters/') return 'Starter Templates';
  if (url === '/docs/changelog/') return 'Package Changelog';
  if (url === '/docs/elements/') return 'NVIDIA Elements Components';
  if (url === '/docs/metrics/') return 'Site Quality Metrics';
  if (url === '/examples/') return 'Example Gallery';
  if (url.startsWith('/docs/internal/guidelines/')) return `${title} Guidelines`;
  if (url.startsWith('/docs/integrations/')) return `${title} Integration`;
  if (url === '/docs/foundations/') return 'Design Foundations';
  if (url.startsWith('/docs/foundations/themes/')) return resolveThemeTitle(url, title);
  if (url.startsWith('/docs/labs/layout/responsive/patterns/')) return 'Responsive Layout Patterns';
  if (url.startsWith('/docs/labs/') && !url.startsWith('/docs/labs/layout/')) return `${title} Lab`;
  return title;
}

function appendTitleQualifier(title, qualifier) {
  return `${title} ${qualifier}`;
}

function getRouteTitleQualifiers(url, title) {
  if (url.startsWith('/docs/api-design/') && title.endsWith('Guidelines')) return ['for Web Components'];
  return TITLE_QUALIFIERS.find(({ route }) => url.startsWith(route))?.qualifiers ?? [DEFAULT_TITLE_QUALIFIER];
}

function getTitleQualifiers(data, url, title) {
  if (url === '/') return [];
  if (url === '/docs/elements/') return ['Catalog'];
  if (url === '/examples/' || url === '/starters/') return ['for Web Components'];
  if (url === '/docs/changelog/') return ['and Release Notes'];
  if (url === '/docs/metrics/') return ['and Reports'];
  if (url === '/docs/foundations/') return ['Guide for Web Components'];
  if (url === '/docs/foundations/themes/') return ['Guide for Web Components'];
  if (url.startsWith('/docs/foundations/themes/')) return ['for Web Components'];
  if (url.includes('/examples/')) return ['and Code Samples', 'and Code Samples for Web Components'];
  if (data.isApiTab) return ['Reference', 'Reference for Web Components'];
  return getRouteTitleQualifiers(url, title);
}

function expandShortTitle(data, title) {
  if (appendSiteName(title).length >= MIN_TITLE_LENGTH) return title;

  const url = data.page?.url ?? '';
  const qualifiers = getTitleQualifiers(data, url, title);
  if (!qualifiers.length) return title;

  const qualifier =
    qualifiers.find(qualifier => appendSiteName(appendTitleQualifier(title, qualifier)).length >= MIN_TITLE_LENGTH) ??
    qualifiers.at(-1) ??
    DEFAULT_TITLE_QUALIFIER;

  return appendTitleQualifier(title, qualifier);
}

function resolvePageTitle(data, title) {
  if (data.changelog?.title) return appendSiteName(expandShortTitle(data, `${data.changelog.title} Changelog`));
  if (data.isApiTab) return appendSiteName(expandShortTitle(data, `${title} API`));
  if (data.isExamplesTab) return appendSiteName(expandShortTitle(data, `${title} Examples`));
  return appendSiteName(expandShortTitle(data, resolveSectionTitle(data, title)));
}

function getDescriptionContexts(data) {
  const url = data.page?.url ?? '';

  if (data.isApiTab) {
    return [
      'Includes API and usage guidance.',
      'Includes properties, events, slots, CSS hooks, examples, and integration guidance for production interfaces.'
    ];
  }

  if (data.isExamplesTab || url.includes('/examples/')) {
    return [
      'Includes usage examples.',
      'Includes runnable UI examples.',
      'Includes working examples, markup patterns, and implementation guidance for production NVIDIA Elements interfaces.'
    ];
  }

  if (data.tag || data.component?.data?.tag) {
    return [
      'Includes API and usage guidance.',
      'Includes examples, API details, accessibility guidance, and production UI workflow patterns.',
      'Use it with examples, API details, accessibility guidance, and production UI patterns in app views.',
      'Use it with NVIDIA Elements Web Components, examples, accessibility guidance, API details, and production UI workflows.'
    ];
  }

  if (url.startsWith('/starters/')) {
    return [
      'Includes practical setup guidance.',
      'Includes setup, examples, and production guidance for app teams.',
      'Compare starter templates for modern application stacks, local development, bundling, and deployment with NVIDIA Elements.'
    ];
  }

  if (url.startsWith('/docs/patterns/')) {
    return [
      'Includes UI workflow guidance.',
      'Includes practical usage guidance.',
      'Includes responsive production UI workflow guidance.',
      'Use these patterns to assemble accessible, responsive NVIDIA Elements interfaces for dashboards, tools, and AI/ML products.'
    ];
  }

  if (url.startsWith('/docs/foundations/themes/')) {
    return [
      'Includes token usage guidance.',
      'Includes token and theme guidance.',
      'Includes token and theme usage guidance for apps.',
      'Understand tokens, themes, CSS custom properties, and visual primitives that keep NVIDIA Elements interfaces consistent.'
    ];
  }

  if (url.startsWith('/docs/foundations/layout/')) {
    return [
      'Includes practical layout guidance.',
      'Layout foundations — utilities, responsive rules, spacing, alignment, and grid patterns — for production NVIDIA Elements interfaces.'
    ];
  }

  if (url.startsWith('/docs/foundations/')) {
    return [
      'Includes practical design guidance.',
      'Design foundations — typography, iconography, color, layout, motion, and theming — that form the consistent visual system beneath every NVIDIA Elements interface.'
    ];
  }

  if (url.startsWith('/docs/integrations/')) {
    return [
      'Includes setup and usage guidance.',
      'Includes setup and framework guidance for apps.',
      'Follow setup guidance, framework examples, package entry points, and integration notes for using NVIDIA Elements in applications.'
    ];
  }

  if (url.startsWith('/docs/api-design/')) {
    return [
      'Includes API design guidance.',
      'Apply API design rules for Web Components, accessibility, composition, styling, events, packaging, and long-term maintainability.'
    ];
  }

  if (url.startsWith('/docs/changelog/')) {
    return [
      'Includes release guidance.',
      'Track package releases, compatibility notes, fixes, and documentation updates across NVIDIA Elements projects.'
    ];
  }

  if (url.startsWith('/docs/metrics/')) {
    return [
      'Includes quality signals.',
      'Review testing, performance, package size, API status, and generated metadata signals for NVIDIA Elements.'
    ];
  }

  if (url.startsWith('/docs/monaco/')) {
    return [
      'Includes editor integration guidance.',
      'Use Monaco-based editor components with NVIDIA Elements patterns for code editing, validation, diagnostics, and AI/ML workflows.'
    ];
  }

  if (url.startsWith('/docs/labs/')) {
    return [
      'Includes experimental usage guidance.',
      'Includes experimental adoption guidance for apps.',
      'Review experimental NVIDIA Elements APIs, usage constraints, examples, and migration context before adopting them in applications.'
    ];
  }

  if (url.startsWith('/docs/about/')) {
    return [
      'Includes project guidance.',
      'Learn project workflows, support paths, contribution guidance, accessibility commitments, and migration practices for NVIDIA Elements.'
    ];
  }

  return [
    'Includes practical NVIDIA Elements guidance.',
    'Includes practical NVIDIA Elements guidance for app teams.',
    'Learn how this documentation supports Web Component implementation, design-system usage, and AI/ML interface work.'
  ];
}

function expandShortDescription(data, description) {
  if (description.length >= MIN_DESCRIPTION_LENGTH) return description;

  const contexts = getDescriptionContexts(data);
  const context = contexts
    .filter(candidate => `${description} ${candidate}`.length >= MIN_DESCRIPTION_LENGTH)
    .sort((a, b) => a.length - b.length)[0];
  const expandedDescription = `${description} ${context ?? contexts.at(-1)}`;

  return expandedDescription.length >= MIN_DESCRIPTION_LENGTH
    ? expandedDescription
    : `${expandedDescription} This guidance supports production NVIDIA Elements teams.`;
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
  } else if (url === '/starters/') {
    description =
      'NVIDIA Elements starter templates for application projects: compare framework setup, local development, bundling, deployment, and production UI workflows.';
  } else {
    description = `Documentation for ${rawTitle} in NVIDIA Elements, the framework-agnostic design system for AI/ML factories.`;
  }

  description = expandShortDescription(data, description);

  const canonicalUrl = `${SITE_URL}${url}`;
  const ogImage = SOCIAL_IMAGE_URL;
  const ogImageAlt = SOCIAL_IMAGE_ALT;
  return { title, description, canonicalUrl, ogImage, ogImageAlt, url };
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

function getAuthor() {
  return {
    '@id': AUTHOR_ID,
    '@type': 'Organization',
    name: AUTHOR_NAME,
    url: AUTHOR_URL,
    description: AUTHOR_CREDENTIALS,
    sameAs: [REPOSITORY_URL],
    parentOrganization: { '@type': 'Organization', name: 'NVIDIA', url: ORGANIZATION_URL },
    knowsAbout: [
      'Web Components',
      'Design Systems',
      'UI Foundations',
      'UI Component Libraries',
      'AI/ML Interface Tooling'
    ]
  };
}

function getArticle(data, meta) {
  const isDocs = meta.url.startsWith('/docs/');
  const isApiReference = isApiReferencePage(data, meta);
  const element = findElementByTag(data.tag ?? data.component?.data?.tag);
  const dates = getContentDates(data);
  const article = {
    '@id': meta.canonicalUrl,
    '@type':
      meta.url === '/docs/elements/'
        ? 'CollectionPage'
        : isApiReference
          ? 'APIReference'
          : isDocs
            ? 'TechArticle'
            : 'WebPage',
    headline: meta.title,
    description: meta.description,
    url: meta.canonicalUrl,
    mainEntityOfPage: meta.canonicalUrl,
    inLanguage: 'en',
    image: meta.ogImage,
    publisher: { '@type': 'Organization', name: 'NVIDIA', url: ORGANIZATION_URL },
    author: getAuthor()
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

function getWebSite(description) {
  return {
    '@id': WEBSITE_ID,
    '@type': 'WebSite',
    url: SOFTWARE_URL,
    name: 'NVIDIA Elements',
    description,
    publisher: { '@type': 'Organization', name: 'NVIDIA', url: ORGANIZATION_URL },
    inLanguage: 'en'
  };
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

function getSoftwareApplication() {
  return {
    '@id': SOFTWARE_ID,
    '@type': 'SoftwareApplication',
    name: 'NVIDIA Elements',
    description: SOFTWARE_DESCRIPTION,
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
    targetProduct: getSoftwareApplication()
  };
}

export function renderJsonLd(data, meta) {
  const article = getArticle(data, meta);
  const breadcrumb = getBreadcrumb(data, meta);
  const sourceCode = getSoftwareSourceCode(data, meta);
  const graph = [
    article,
    ...(breadcrumb ? [breadcrumb] : []),
    ...(meta.url === '/' ? [getWebSite(meta.description), getSoftwareApplication()] : []),
    ...(sourceCode ? [sourceCode] : [])
  ];

  if (sourceCode) {
    article.hasPart = { '@id': sourceCode['@id'] };
  }

  return `<script type="application/ld+json">${jsonLdEncode({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
}
