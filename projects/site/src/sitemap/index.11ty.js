import markdown from '../_11ty/libraries/markdown.js';

export const data = {
  title: 'Sitemap',
  description:
    'Browse public NVIDIA Elements pages by category, including component APIs, examples, integrations, release updates, changelogs, and quality metrics.',
  layout: 'docs.11ty.js',
  permalink: '/sitemap/'
};

const CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started and Tools',
    paths: ['/', '/docs/cli/', '/docs/mcp/', '/docs/skills/', '/docs/lint/']
  },
  { id: 'whats-new', title: 'What’s New', paths: ['/docs/whats-new/'] },
  { id: 'integrations', title: 'Integrations', paths: ['/docs/integrations/'] },
  { id: 'foundations', title: 'Foundations', paths: ['/docs/foundations/', '/docs/design-md/'] },
  {
    id: 'components',
    title: 'Components',
    paths: ['/docs/elements/', '/docs/code/', '/docs/media/', '/docs/monaco/', '/docs/markdown/']
  },
  { id: 'patterns', title: 'Patterns', paths: ['/docs/patterns/'] },
  { id: 'lint-rules', title: 'Lint Rules', paths: ['/docs/lint/rules/'] },
  { id: 'labs', title: 'Labs', paths: ['/docs/labs/'] },
  { id: 'api-design', title: 'API Design', paths: ['/docs/api-design/'] },
  { id: 'changelogs', title: 'Changelogs', paths: ['/docs/changelog/'] },
  { id: 'metrics', title: 'Metrics', paths: ['/docs/metrics/'] },
  { id: 'about', title: 'About', paths: ['/docs/about/'] },
  { id: 'visualization', title: 'Visualization', paths: ['/docs/plot/', '/docs/scene/'] },
  { id: 'other', title: 'Other Pages', paths: [] }
];

const EXCLUDED_PATHS = ['/docs/internal/', '/examples/', '/context/', '/starters/', '/404/', '/404.html', '/sitemap/'];
const LINK_ORDER = ['Overview', 'API', 'Examples'];

function normalizeUrl(url) {
  return url.replace(/\/{2,}/g, '/').replace(/\/index\.html$/, '/');
}

export function isHumanSitemapPage(page) {
  if (typeof page.url !== 'string' || !page.url.startsWith('/')) return false;
  const url = normalizeUrl(page.url);
  if (!url.endsWith('/') && !url.endsWith('.html')) return false;
  if (EXCLUDED_PATHS.some(path => url === path || url.startsWith(path))) return false;
  if (page.data?.noindex) return false;
  return !(url.endsWith('/examples/') && page.data?.component?.data?.hideExamplesTab);
}

function getPageTitle(page) {
  if (page.data?.component) return page.data.component.data.title;
  if (page.data?.changelog) return `Changelog — ${page.data.changelog.title}`;
  return page.data?.title ?? page.url;
}

export function getSitemapCategories(pages = []) {
  const entries = new Map();
  for (const page of pages.filter(isHumanSitemapPage)) {
    const url = normalizeUrl(page.url);
    const component = page.data?.component;
    const baseUrl = normalizeUrl(component?.url ?? url);
    const entry = entries.get(baseUrl) ?? { url: baseUrl, title: getPageTitle(page), links: new Map() };
    const label = component ? (url.endsWith('/api/') ? 'API' : 'Examples') : 'Overview';
    entry.links.set(url, { url, label });
    entries.set(baseUrl, entry);
  }

  const categories = CATEGORIES.map(category => ({ ...category, entries: [] }));
  for (const entry of entries.values()) {
    const category =
      categories.findLast(category =>
        category.paths.some(path => entry.url === path || (path !== '/' && entry.url.startsWith(path)))
      ) ?? categories.at(-1);
    category.entries.push({
      ...entry,
      links: [...entry.links.values()].sort(
        (left, right) => LINK_ORDER.indexOf(left.label) - LINK_ORDER.indexOf(right.label)
      )
    });
  }

  return categories
    .filter(category => category.entries.length)
    .map(category => ({
      ...category,
      entries: category.entries.sort((left, right) => left.title.localeCompare(right.title, 'en'))
    }));
}

function renderEntry(entry) {
  const title = markdown.utils.escapeHtml(entry.title);
  if (entry.links.length === 1 && entry.links[0].label === 'Overview') {
    return `<a href="${markdown.utils.escapeHtml(entry.links[0].url)}" nve-text="link">${title}</a>`;
  }

  return /* html */ `<div nve-layout="row align:wrap gap:sm">
    <span nve-text="body medium">${title}</span>
    ${entry.links.map(link => `<a href="${markdown.utils.escapeHtml(link.url)}" nve-text="link" aria-label="${title} ${link.label}">${link.label}</a>`).join('\n')}
  </div>`;
}

export function render(data) {
  const categories = getSitemapCategories(data.collections.all);
  return /* html */ `
<h1 nve-text="display emphasis semibold">Sitemap</h1>
<p nve-text="body">Browse public NVIDIA Elements pages by category.</p>

<section nve-layout="column gap:md" aria-labelledby="sitemap-crawlers">
  <h2 id="sitemap-crawlers" nve-text="heading xl emphasis mkd">Robots and crawlers</h2>
  <p nve-text="body">Robots and crawlers can access crawl instructions and XML sitemaps at these locations:</p>
  <ul nve-text="list" nve-layout="column gap:sm">
    <li><a href="http://nvidia.github.io/robots.txt" nve-text="link">NVIDIA robots.txt</a></li>
    <li><a href="https://nvidia.github.io/sitemap.xml" nve-text="link">NVIDIA XML sitemap</a></li>
    <li><a href="https://nvidia.github.io/elements/sitemap.xml" nve-text="link">Elements XML sitemap</a></li>
  </ul>
</section>

<div id="sitemap-pages" nve-layout="column gap:xl">
${categories
  .map(
    category => /* html */ `
<section nve-layout="column gap:md" aria-labelledby="sitemap-${category.id}">
  <h2 id="sitemap-${category.id}" nve-text="heading xl emphasis mkd">${category.title}</h2>
  <ul nve-text="list" nve-layout="grid span-items:12 &md|span-items:6 gap:sm">
    ${category.entries.map(entry => `<li>${renderEntry(entry)}</li>`).join('\n')}
  </ul>
</section>`
  )
  .join('\n')}
</div>
`;
}
