import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { data as api } from './api.11ty.js';
import { data as examples } from './examples.11ty.js';

describe('component tab permalinks', () => {
  it('builds the Foundations component and Viewport tabs at the URLs linked from their overviews', () => {
    const build = new URL('../../../../dist/', import.meta.url);
    for (const path of ['docs/foundations/scroll-box/', 'docs/viewport/']) {
      const overview = readFileSync(new URL(`${path}index.html`, build), 'utf8');
      for (const tab of ['api', 'examples']) {
        const urlPath = `/${path}${tab}/`;
        expect(overview).toContain(urlPath);
        const tabPage = readFileSync(new URL(`${path}${tab}/index.html`, build), 'utf8');
        expect(tabPage).toContain('id="doc-tabs"');
      }
    }
    const catalog = readFileSync(new URL('docs/elements/index.html', build), 'utf8');
    expect(catalog).toContain('/docs/foundations/scroll-box/');
  });

  it.each([
    { filePathStem: '/docs/viewport/index', fileSlug: 'viewport', url: '/docs/viewport/' },
    { filePathStem: '/docs/viewport/zoom-range', fileSlug: 'zoom-range', url: '/docs/viewport/zoom-range/' },
    { filePathStem: '/docs/foundations/scroll-box', fileSlug: 'scroll-box', url: '/docs/foundations/scroll-box/' }
  ])('aligns API and Examples URLs with the overview at $url', ({ filePathStem, fileSlug, url }) => {
    const pageData = {
      component: { filePathStem, fileSlug, url, data: { title: fileSlug, page: { fileSlug } } },
      page: { fileSlug }
    };
    expect(api.permalink(pageData)).toBe(`${url}api/`);
    expect(examples.permalink(pageData)).toBe(`${url}examples/`);
  });
});
