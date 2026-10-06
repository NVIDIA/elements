import { readdir, readFile } from 'node:fs/promises';
import { parse, parseFragment, type DefaultTreeAdapterMap } from 'parse5';
import { describe, expect, it } from 'vitest';
import { getSitemapCategories, isHumanSitemapPage, render } from './index.11ty.js';

interface SitemapPage {
  url: string | false;
  data?: {
    title?: string;
    noindex?: boolean;
    component?: { url: string; data: { title: string; hideExamplesTab?: boolean } };
    changelog?: { title: string };
  };
}

function page(url: string, title = url): SitemapPage {
  return { url, data: { title } };
}

function findElements(
  node: DefaultTreeAdapterMap['node'],
  predicate: (element: DefaultTreeAdapterMap['element']) => boolean
): DefaultTreeAdapterMap['element'][] {
  const matches = 'tagName' in node && predicate(node) ? [node] : [];
  if ('childNodes' in node) {
    for (const child of node.childNodes) matches.push(...findElements(child, predicate));
  }
  return matches;
}

function attribute(element: DefaultTreeAdapterMap['element'], name: string) {
  return element.attrs.find(attr => attr.name === name)?.value;
}

describe('human sitemap', () => {
  it('should include reader-facing pages and exclude internal and utility pages', () => {
    const included = [
      '/',
      '/docs/changelog/core/',
      '/docs/metrics/',
      '/docs/lint/rules/no-unknown-tags/',
      '/new-section/'
    ];
    const excluded = [
      '/docs/internal/guidelines/',
      '/examples/',
      '/context/index.html',
      '/starters/',
      '/404.html',
      '/sitemap/',
      '/llms.txt',
      '/sitemap.xml',
      '/updates/rss.xml'
    ];

    expect(included.filter(url => !isHumanSitemapPage(page(url)))).toEqual([]);
    expect(excluded.filter(url => isHumanSitemapPage(page(url)))).toEqual([]);
    expect(isHumanSitemapPage({ url: false })).toBe(false);
    expect(isHumanSitemapPage({ url: '/docs/hidden/', data: { noindex: true } })).toBe(false);
  });

  it('should categorize and sort pages, deduplicate index URLs, and retain new sections', () => {
    const categories = getSitemapCategories([
      page('/docs/integrations/vue/', 'Vue'),
      page('/docs/integrations/angular/', 'Angular'),
      page('/docs/integrations/vue/index.html', 'Vue'),
      page('/docs/design-md/', 'DESIGN.md'),
      page('/docs/code/codeblock/', 'Codeblock'),
      page('/docs/plot/', 'Plot'),
      page('/docs/patterns/', 'Patterns'),
      page('/docs/labs/', 'Labs'),
      page('/docs/api-design/', 'API Design'),
      page('/docs/whats-new/', 'What’s New'),
      { url: '/docs/changelog/themes/', data: { title: 'Changelog', changelog: { title: '@nvidia-elements/themes' } } },
      page('/docs/metrics/', 'Metrics'),
      page('/docs/about/support/', 'Support'),
      page('/docs/cli/', 'CLI'),
      page('/docs/lint/', 'NVIDIA Elements Lint'),
      page('/docs/lint/rules/no-unknown-tags/', 'no-unknown-tags Lint Rule'),
      page('/new-section/', 'New Section')
    ]);

    expect(categories.map(category => category.id)).toEqual([
      'getting-started',
      'whats-new',
      'integrations',
      'foundations',
      'components',
      'patterns',
      'lint-rules',
      'labs',
      'api-design',
      'changelogs',
      'metrics',
      'about',
      'visualization',
      'other'
    ]);
    expect(categories.find(category => category.id === 'getting-started')?.entries.map(entry => entry.url)).toEqual([
      '/docs/cli/',
      '/docs/lint/'
    ]);
    expect(categories.find(category => category.id === 'lint-rules')?.entries.map(entry => entry.url)).toEqual([
      '/docs/lint/rules/no-unknown-tags/'
    ]);
    expect(categories.find(category => category.id === 'integrations')?.entries.map(entry => entry.title)).toEqual([
      'Angular',
      'Vue'
    ]);
    expect(categories.find(category => category.id === 'changelogs')?.entries[0].title).toBe(
      'Changelog — @nvidia-elements/themes'
    );
    expect(categories.at(-1)?.entries[0].url).toBe('/new-section/');
  });

  it('should group generated tabs by source page and retain separate component subpages', () => {
    const component = { url: '/docs/elements/data-grid/', data: { title: 'Data Grid' } };
    const categories = getSitemapCategories([
      { url: '/docs/elements/data-grid/examples/', data: { component } },
      { url: '/docs/elements/data-grid/api/', data: { component } },
      page('/docs/elements/data-grid/', 'Data Grid'),
      page('/docs/elements/data-grid/footer/', 'Grid Footer')
    ]);

    expect(categories[0].entries).toHaveLength(2);
    expect(categories[0].entries[0].links).toEqual([
      { url: component.url, label: 'Overview' },
      { url: '/docs/elements/data-grid/api/', label: 'API' },
      { url: '/docs/elements/data-grid/examples/', label: 'Examples' }
    ]);
    expect(categories[0].entries[1].title).toBe('Grid Footer');
  });

  it('should retain overview and API links when a component hides examples', () => {
    const component = { url: '/docs/markdown/', data: { title: 'Markdown', hideExamplesTab: true } };
    const categories = getSitemapCategories([
      page(component.url, 'Markdown'),
      { url: '/docs//markdown/api/', data: { component } },
      { url: '/docs//markdown/examples/', data: { component } }
    ]);

    expect(categories[0].entries[0].links).toEqual([
      { url: '/docs/markdown/', label: 'Overview' },
      { url: '/docs/markdown/api/', label: 'API' }
    ]);
  });

  it('should escape titles and provide descriptive tab links and crawler resources', () => {
    const component = { url: '/docs/elements/button/', data: { title: 'Button <action> & "state"' } };
    const content = render({
      collections: {
        all: [page(component.url, component.data.title), { url: '/docs/elements/button/api/', data: { component } }]
      }
    });
    const document = parseFragment(content);
    const links = findElements(document, element => element.tagName === 'a');

    expect(content).toContain('Button &lt;action&gt; &amp; &quot;state&quot;');
    expect(
      attribute(links.find(link => attribute(link, 'href') === '/docs/elements/button/api/') ?? links[0], 'aria-label')
    ).toBe('Button <action> & "state" API');
    expect(links.map(link => attribute(link, 'href'))).toEqual([
      'http://nvidia.github.io/robots.txt',
      'https://nvidia.github.io/sitemap.xml',
      'https://nvidia.github.io/elements/sitemap.xml',
      '/docs/elements/button/',
      '/docs/elements/button/api/'
    ]);
  });

  it('should link every eligible built page exactly once and include itself in the XML sitemap', async () => {
    const output = new URL('../../dist/', import.meta.url);
    const document = parse(await readFile(new URL('sitemap/index.html', output), 'utf8'));
    const pageLists = findElements(document, element => attribute(element, 'id') === 'sitemap-pages');
    expect(pageLists).toHaveLength(1);
    const links = findElements(pageLists[0], element => element.tagName === 'a');
    const paths = links.map(link =>
      new URL(attribute(link, 'href') ?? '', 'https://nvidia.github.io').pathname.replace(/^\/elements/, '')
    );
    const files = (await readdir(output, { recursive: true })).filter(
      file =>
        file === 'index.html' ||
        (file.startsWith('docs/') && file.endsWith('/index.html') && !file.startsWith('docs/internal/'))
    );
    const eligiblePaths = (
      await Promise.all(
        files.map(async file => {
          const content = await readFile(new URL(file, output), 'utf8');
          const headEnd = content.indexOf('</head>');
          expect(headEnd, `Missing head in ${file}`).toBeGreaterThan(-1);
          // Parse only meta tags; styles and JSON-LD make full pages expensive to parse.
          const head = content.slice(0, headEnd);
          const html = parseFragment((head.match(/<meta\b[^>]*>/gi) ?? []).join(''));
          const noindex = findElements(
            html,
            element =>
              element.tagName === 'meta' &&
              attribute(element, 'name') === 'robots' &&
              (attribute(element, 'content') ?? '').includes('noindex')
          );
          return noindex.length ? null : `/${file.replace(/index\.html$/, '')}`;
        })
      )
    ).filter(path => path !== null);

    expect(paths.toSorted()).toEqual(eligiblePaths.toSorted());
    expect(new Set(paths).size).toBe(paths.length);
    const missingDestinations = paths.filter(path => !files.includes(`${path.slice(1)}index.html`));
    expect(missingDestinations).toEqual([]);
    const sitemapLink = findElements(
      document,
      element => element.tagName === 'a' && attribute(element, 'href')?.endsWith('/sitemap/') === true
    );
    expect(
      sitemapLink.some(
        link =>
          link.parentNode &&
          'tagName' in link.parentNode &&
          link.parentNode.tagName === 'nve-tree-node' &&
          attribute(link.parentNode, 'selected') !== undefined
      )
    ).toBe(true);
    expect(await readFile(new URL('sitemap.xml', output), 'utf8')).toContain(
      '<loc>https://nvidia.github.io/elements/sitemap/</loc>'
    );
  });
});
