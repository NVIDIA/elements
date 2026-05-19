import { afterAll, describe, expect, it, vi } from 'vitest';

vi.stubEnv('ELEMENTS_SITE_URL', 'https://nvidia.github.io');
vi.stubEnv('PAGES_BASE_URL', '/elements/');

afterAll(() => {
  vi.unstubAllEnvs();
});

vi.mock('../../index.11tydata.js', () => ({
  siteData: {
    elements: [
      {
        name: 'nve-button',
        version: '1.2.3',
        manifest: {
          tagName: 'nve-button'
        }
      },
      {
        name: 'nve-codeblock',
        version: '1.2.3',
        manifest: {
          tagName: 'nve-codeblock'
        }
      }
    ]
  }
}));

const { renderJsonLd, SOFTWARE_ID } = await import('./metadata.js');

interface JsonLdListItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

interface BreadcrumbList {
  '@type': 'BreadcrumbList';
  itemListElement: JsonLdListItem[];
}

type JsonLdNode = Record<string, unknown>;

interface JsonLdGraph {
  '@graph': JsonLdNode[];
}

interface MetadataInput {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage: string;
  url: string;
}

interface PageData {
  page: {
    url: string;
    date?: Date;
  };
  collections: {
    all: { url: string }[];
  };
  content?: string;
  tag?: string;
}

function createMeta(url: string, overrides: Partial<MetadataInput> = {}): MetadataInput {
  return {
    title: 'Test Page | NVIDIA Elements',
    description: 'Test description.',
    canonicalUrl: `https://nvidia.github.io/elements${url}`,
    ogImage: 'https://nvidia.github.io/elements/favicon.svg',
    url,
    ...overrides
  };
}

function createData(overrides: Partial<PageData> = {}): PageData {
  return {
    page: { url: '/' },
    collections: { all: [] },
    ...overrides
  };
}

function isBreadcrumbList(value: unknown): value is BreadcrumbList {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Record<string, unknown>;

  return candidate['@type'] === 'BreadcrumbList' && Array.isArray(candidate.itemListElement);
}

function isJsonLdGraph(value: unknown): value is JsonLdGraph {
  if (typeof value !== 'object' || value === null) return false;

  return Array.isArray((value as Record<string, unknown>)['@graph']);
}

function getBreadcrumbJsonLd(html: string): BreadcrumbList {
  const breadcrumb = getGraphJsonLd(html).find(isBreadcrumbList);

  if (breadcrumb) return breadcrumb;

  throw new TypeError('BreadcrumbList JSON-LD was not rendered.');
}

function getGraphJsonLd(html: string): JsonLdNode[] {
  const [script] = [...html.matchAll(/<script type="application\/ld\+json">(.+?)<\/script>/g)];
  const graph = JSON.parse(script?.[1] ?? '{}') as unknown;

  if (isJsonLdGraph(graph)) return graph['@graph'];

  throw new TypeError('JSON-LD graph was not rendered.');
}

function getGraph(data: PageData, meta: MetadataInput): JsonLdNode[] {
  return getGraphJsonLd(renderJsonLd(data, meta));
}

function findNode(graph: JsonLdNode[], type: string): JsonLdNode | undefined {
  return graph.find(node => node['@type'] === type);
}

describe('renderJsonLd', () => {
  it('should emit APIReference for component pages', () => {
    const graph = getGraph(createData({ tag: 'nve-button' }), createMeta('/docs/elements/button/'));
    const article = findNode(graph, 'APIReference');

    expect(article).toMatchObject({
      headline: 'Test Page | NVIDIA Elements',
      description: 'Test description.',
      url: 'https://nvidia.github.io/elements/docs/elements/button/',
      mainEntityOfPage: 'https://nvidia.github.io/elements/docs/elements/button/',
      inLanguage: 'en',
      image: 'https://nvidia.github.io/elements/favicon.svg',
      programmingModel: 'Web Components',
      targetPlatform: 'Web',
      about: { '@id': SOFTWARE_ID }
    });
  });

  it('should include one site-level SoftwareApplication on the root page', () => {
    const graph = getGraph(
      createData(),
      createMeta('/', {
        description: 'Get started with NVIDIA Elements.'
      })
    );
    const softwareNodes = graph.filter(node => node['@type'] === 'SoftwareApplication');

    expect(softwareNodes).toHaveLength(1);
    expect(softwareNodes[0]).toEqual({
      '@id': SOFTWARE_ID,
      '@type': 'SoftwareApplication',
      name: 'NVIDIA Elements',
      description: 'Get started with NVIDIA Elements.',
      url: 'https://nvidia.github.io/elements/',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      runtimePlatform: 'Web',
      softwareHelp: 'https://nvidia.github.io/elements/'
    });
  });

  it('should emit SoftwareSourceCode for code example pages', () => {
    const graph = getGraph(
      createData({
        tag: 'nve-codeblock',
        content: '<nve-codeblock language="typescript"><template>const value = true;</template></nve-codeblock>'
      }),
      createMeta('/docs/code/codeblock/')
    );
    const sourceCode = findNode(graph, 'SoftwareSourceCode');

    expect(sourceCode).toMatchObject({
      '@id': 'https://nvidia.github.io/elements/docs/code/codeblock/#source-code',
      name: 'Test Page | NVIDIA Elements',
      description: 'Test description.',
      url: 'https://nvidia.github.io/elements/docs/code/codeblock/',
      codeSampleType: 'code snippet',
      programmingLanguage: 'TypeScript',
      runtimePlatform: 'Web',
      targetProduct: { '@id': SOFTWARE_ID, '@type': 'SoftwareApplication' }
    });
    expect(findNode(graph, 'APIReference')?.hasPart).toEqual({
      '@id': 'https://nvidia.github.io/elements/docs/code/codeblock/#source-code'
    });
  });

  it('should not emit SoftwareSourceCode for prose-only docs pages', () => {
    const graph = getGraph(
      createData({ content: '<p>Accessibility documentation.</p>' }),
      createMeta('/docs/about/accessibility/')
    );

    expect(findNode(graph, 'SoftwareSourceCode')).toBeUndefined();
  });

  it('should emit valid JSON-LD', () => {
    const graph = getGraph(createData({ content: '```shell\nnve project.setup\n```' }), createMeta('/docs/cli/'));

    expect(graph).toEqual(expect.any(Array));
  });

  it('should emit native binary runtime platform for cli and mcp pages', () => {
    ['/docs/cli/', '/docs/mcp/'].forEach(url => {
      const graph = getGraph(createData({ content: '```shell\nnve project.setup\n```' }), createMeta(url));
      const sourceCode = findNode(graph, 'SoftwareSourceCode');

      expect(sourceCode).toMatchObject({
        runtimePlatform: 'Native binary'
      });
    });
  });

  it('should not emit component metadata for non-component API reference pages', () => {
    const graph = getGraph(createData({ content: '```shell\nnve project.setup\n```' }), createMeta('/docs/cli/'));
    const article = findNode(graph, 'APIReference');

    expect(article).not.toHaveProperty('programmingModel');
    expect(article).not.toHaveProperty('assemblyVersion');
  });

  it('should not emit dates from page build timestamps', () => {
    const graph = getGraph(
      createData({
        page: {
          date: new Date('2026-05-19T00:00:00.000Z'),
          url: '/docs/about/support/'
        }
      }),
      createMeta('/docs/about/support/')
    );
    const article = findNode(graph, 'TechArticle');

    expect(article).not.toHaveProperty('datePublished');
    expect(article).not.toHaveProperty('dateModified');
  });

  it('should omit non-generated breadcrumb pages from structured data', () => {
    const html = renderJsonLd(
      {
        page: { url: '/docs/api-design/composition/', date: new Date('2026-05-17T00:00:00.000Z') },
        collections: {
          all: [{ url: '/' }, { url: '/docs/api-design/' }, { url: '/docs/api-design/composition/' }]
        }
      },
      {
        title: 'Composition | NVIDIA Elements',
        description: 'Composition guidelines for NVIDIA Elements.',
        canonicalUrl: 'https://nvidia.github.io/elements/docs/api-design/composition/',
        ogImage: 'https://nvidia.github.io/elements/favicon.svg',
        url: '/docs/api-design/composition/'
      }
    );

    const breadcrumb = getBreadcrumbJsonLd(html);

    expect(breadcrumb.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://nvidia.github.io/elements/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'API Design',
        item: 'https://nvidia.github.io/elements/docs/api-design/'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Composition',
        item: 'https://nvidia.github.io/elements/docs/api-design/composition/'
      }
    ]);
  });

  it('should include generated breadcrumb section pages', () => {
    const html = renderJsonLd(
      {
        page: { url: '/docs/api-design/composition/', date: new Date('2026-05-17T00:00:00.000Z') },
        collections: {
          all: [{ url: '/' }, { url: '/docs/' }, { url: '/docs/api-design/' }, { url: '/docs/api-design/composition/' }]
        }
      },
      {
        title: 'Composition | NVIDIA Elements',
        description: 'Composition guidelines for NVIDIA Elements.',
        canonicalUrl: 'https://nvidia.github.io/elements/docs/api-design/composition/',
        ogImage: 'https://nvidia.github.io/elements/favicon.svg',
        url: '/docs/api-design/composition/'
      }
    );

    const breadcrumb = getBreadcrumbJsonLd(html);

    expect(breadcrumb.itemListElement.map(item => item.name)).toEqual(['Home', 'Docs', 'API Design', 'Composition']);
    expect(breadcrumb.itemListElement.map(item => item.position)).toEqual([1, 2, 3, 4]);
    expect(breadcrumb.itemListElement.every(item => item.item)).toBe(true);
  });
});
