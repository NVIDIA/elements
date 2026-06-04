import { readdir, readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
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

const {
  AUTHOR_CREDENTIALS,
  AUTHOR_ID,
  AUTHOR_NAME,
  AUTHOR_URL,
  renderJsonLd,
  resolvePageMeta,
  SOFTWARE_ID,
  WEBSITE_ID,
  SOCIAL_IMAGE_URL,
  SOCIAL_IMAGE_ALT
} = await import('./metadata.js');
const { renderBaseHead } = await import('./common.js');

const SOFTWARE_DESCRIPTION =
  'NVIDIA Elements is a framework-agnostic Design System and UI Agent Harness for AI/ML Infrastructure, Robotics, and Autonomous Vehicles';
const ORGANIZATION_URL = 'https://www.nvidia.com/';
const AUTHOR_SCHEMA = {
  '@id': AUTHOR_ID,
  '@type': 'Organization',
  name: AUTHOR_NAME,
  url: AUTHOR_URL,
  description: AUTHOR_CREDENTIALS,
  sameAs: ['https://github.com/NVIDIA/elements'],
  parentOrganization: { '@type': 'Organization', name: 'NVIDIA', url: ORGANIZATION_URL },
  knowsAbout: [
    'Web Components',
    'Design Systems',
    'UI Foundations',
    'UI Component Libraries',
    'AI/ML Interface Tooling'
  ]
};

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
  ogImageAlt?: string;
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
    ogImage: SOCIAL_IMAGE_URL,
    ogImageAlt: SOCIAL_IMAGE_ALT,
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

function isString(value: string | null): value is string {
  return value !== null;
}

function hasFrontMatterField(frontMatter: string, field: string) {
  return new RegExp(`^\\s*${field}\\s*:`, 'm').test(frontMatter);
}

function hasTrueFrontMatterField(frontMatter: string, field: string) {
  return new RegExp(`^\\s*${field}\\s*:\\s*true\\s*(?:#.*)?$`, 'm').test(frontMatter);
}

function getFrontMatter(content: string) {
  return content.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
}

async function getMarkdownFiles(dir: URL): Promise<URL[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(entry => {
      const path = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, dir);
      if (entry.isDirectory()) return getMarkdownFiles(path);
      return entry.name.endsWith('.md') ? [path] : [];
    })
  );

  return nestedFiles.flat();
}

describe('resolvePageMeta', () => {
  it('should use the dedicated social preview image by default', () => {
    const meta = resolvePageMeta({
      page: { url: '/' },
      title: 'NVIDIA Elements Design System for AI UI',
      description: 'Framework-agnostic Web Components for AI infrastructure UI.'
    });

    expect(meta).toMatchObject({
      title: 'NVIDIA Elements Design System for AI UI | NVIDIA Elements',
      canonicalUrl: 'https://nvidia.github.io/elements/',
      ogImage: SOCIAL_IMAGE_URL,
      ogImageAlt: SOCIAL_IMAGE_ALT
    });
  });

  it('should expand short routed titles with page context', () => {
    [
      {
        data: { page: { url: '/docs/elements/dot/' }, title: 'Dot' },
        title: 'Dot Web Component API Reference Guide | NVIDIA Elements'
      },
      {
        data: { page: { url: '/docs/elements/dot/api/' }, title: 'Dot', isApiTab: true },
        title: 'Dot API Reference for Web Components | NVIDIA Elements'
      },
      {
        data: { page: { url: '/docs/elements/dot/examples/' }, title: 'Dot', isExamplesTab: true },
        title: 'Dot Examples and Code Samples for Web Components | NVIDIA Elements'
      },
      {
        data: { page: { url: '/docs/integrations/go/' }, title: 'Go' },
        title: 'Go Integration Web Component Guide | NVIDIA Elements'
      },
      {
        data: { page: { url: '/docs/api-design/slots/' }, title: 'Slots' },
        title: 'Slots API Guide for Web Components | NVIDIA Elements'
      },
      {
        data: { page: { url: '/docs/foundations/themes/' }, title: 'Themes' },
        title: 'Theme System Guide for Web Components | NVIDIA Elements'
      },
      {
        data: { page: { url: '/docs/foundations/themes/tokens/' }, title: 'Design Tokens' },
        title: 'Design Tokens for Web Components | NVIDIA Elements'
      },
      {
        data: { page: { url: '/starters/' }, title: 'Starters' },
        title: 'Starter Templates for Web Components | NVIDIA Elements'
      }
    ].forEach(({ data, title }) => {
      const meta = resolvePageMeta(data);

      expect(meta.title).toBe(title);
      expect(meta.title.length).toBeGreaterThanOrEqual(50);
    });
  });

  it('should expand short descriptions with route context', () => {
    [
      {
        data: { page: { url: '/docs/elements/card/' }, title: 'Card', tag: 'nve-card' },
        text: 'production UI workflow patterns'
      },
      {
        data: { page: { url: '/docs/api-design/styles/' }, title: 'Styles', description: 'CSS styling rules.' },
        text: 'API design rules'
      },
      {
        data: { page: { url: '/starters/' }, title: 'Starters' },
        text: 'starter templates'
      }
    ].forEach(({ data, text }) => {
      const meta = resolvePageMeta(data);

      expect(meta.description.length).toBeGreaterThanOrEqual(150);
      expect(meta.description).toContain(text);
    });
  });

  it('should preserve sufficiently long descriptions', () => {
    const description =
      'A complete NVIDIA Elements guide for Web Component integration, API design, accessibility, examples, and production interface implementation across applications.';
    const meta = resolvePageMeta({
      page: { url: '/docs/integrations/react/' },
      title: 'React',
      description
    });

    expect(meta.description).toBe(description);
  });
});

describe('renderBaseHead', () => {
  it('should emit Open Graph and Twitter card metadata', () => {
    const data = {
      page: { url: '/' },
      collections: { all: [] },
      title: 'Test Page',
      description: 'Test description.'
    };
    const description = resolvePageMeta(data).description;
    const html = renderBaseHead(data);

    expect(html).toContain(`<meta property="og:image" content="${SOCIAL_IMAGE_URL}">`);
    expect(html).toContain(`<meta property="og:image:alt" content="${SOCIAL_IMAGE_ALT}">`);
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
    expect(html).toContain('<meta name="twitter:title" content="Test Page | NVIDIA Elements">');
    expect(html).toContain(`<meta name="twitter:description" content="${description}">`);
    expect(html).toContain(`<meta name="twitter:image" content="${SOCIAL_IMAGE_URL}">`);
    expect(html).toContain(`<meta name="twitter:image:alt" content="${SOCIAL_IMAGE_ALT}">`);
    expect(html).toContain(`<meta name="author" content="${AUTHOR_NAME}">`);
  });
});

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
      image: SOCIAL_IMAGE_URL,
      programmingModel: 'Web Components',
      targetPlatform: 'Web',
      publisher: { '@type': 'Organization', name: 'NVIDIA', url: ORGANIZATION_URL },
      author: AUTHOR_SCHEMA,
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
      description: SOFTWARE_DESCRIPTION,
      url: 'https://nvidia.github.io/elements/',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      runtimePlatform: 'Web',
      softwareHelp: 'https://nvidia.github.io/elements/'
    });
  });

  it('should include one site-level WebSite on the root page', () => {
    const graph = getGraph(
      createData(),
      createMeta('/', {
        description: 'Get started with NVIDIA Elements.'
      })
    );
    const websiteNodes = graph.filter(node => node['@type'] === 'WebSite');

    expect(websiteNodes).toHaveLength(1);
    expect(websiteNodes[0]).toEqual({
      '@id': WEBSITE_ID,
      '@type': 'WebSite',
      url: 'https://nvidia.github.io/elements/',
      name: 'NVIDIA Elements',
      description: 'Get started with NVIDIA Elements.',
      publisher: { '@type': 'Organization', name: 'NVIDIA', url: ORGANIZATION_URL },
      inLanguage: 'en'
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
      targetProduct: {
        '@id': SOFTWARE_ID,
        '@type': 'SoftwareApplication',
        name: 'NVIDIA Elements',
        description: SOFTWARE_DESCRIPTION,
        url: 'https://nvidia.github.io/elements/',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        runtimePlatform: 'Web',
        softwareHelp: 'https://nvidia.github.io/elements/'
      }
    });
    expect(findNode(graph, 'APIReference')?.hasPart).toEqual({
      '@id': 'https://nvidia.github.io/elements/docs/code/codeblock/#source-code'
    });
  });

  it('should emit complete target product metadata on code docs pages', () => {
    const graph = getGraph(createData({ content: '```shell\nnve project.setup\n```' }), createMeta('/docs/mcp/'));
    const sourceCode = findNode(graph, 'SoftwareSourceCode');

    expect(sourceCode?.['targetProduct']).toMatchObject({
      '@id': SOFTWARE_ID,
      '@type': 'SoftwareApplication',
      name: 'NVIDIA Elements',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any'
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

describe('docs metadata policy', () => {
  it('should require explicit descriptions on published non-component docs pages', async () => {
    const docsDirectory = new URL('../../docs/', import.meta.url);
    const files = await getMarkdownFiles(docsDirectory);
    const missingDescriptions = (
      await Promise.all(
        files.map(async file => {
          const content = await readFile(file, 'utf8');
          const frontMatter = getFrontMatter(content);
          const isComponentPage = hasFrontMatterField(frontMatter, 'tag');
          const isNoindex = hasTrueFrontMatterField(frontMatter, 'noindex');
          const hasDescription = hasFrontMatterField(frontMatter, 'description');

          if (isComponentPage || isNoindex || hasDescription) return null;

          return relative(process.cwd(), fileURLToPath(file));
        })
      )
    ).filter(isString);

    expect(missingDescriptions).toEqual([]);
  });

  it('should require descriptions when noindex is false', () => {
    const frontMatter = ['title: Visible Page', 'noindex: false'].join('\n');
    const isComponentPage = hasFrontMatterField(frontMatter, 'tag');
    const isNoindex = hasTrueFrontMatterField(frontMatter, 'noindex');
    const hasDescription = hasFrontMatterField(frontMatter, 'description');

    expect(isComponentPage || isNoindex || hasDescription).toBe(false);
  });
});
