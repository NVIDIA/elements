import { afterAll, describe, expect, it, vi } from 'vitest';

vi.stubEnv('ELEMENTS_SITE_URL', 'https://nvidia.github.io');
vi.stubEnv('PAGES_BASE_URL', '/elements/');

afterAll(() => {
  vi.unstubAllEnvs();
});

vi.mock('../../index.11tydata.js', () => ({ siteData: { elements: [] } }));

const { renderJsonLd } = await import('./metadata.js');

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

function isBreadcrumbList(value: unknown): value is BreadcrumbList {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Record<string, unknown>;

  return candidate['@type'] === 'BreadcrumbList' && Array.isArray(candidate.itemListElement);
}

function getBreadcrumbJsonLd(html: string): BreadcrumbList {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">(.+?)<\/script>/g)].map(
    match => JSON.parse(match[1] ?? '{}') as unknown
  );
  const breadcrumb = scripts.find(isBreadcrumbList);

  if (breadcrumb) return breadcrumb;

  throw new TypeError('BreadcrumbList JSON-LD was not rendered.');
}

describe('renderJsonLd', () => {
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
