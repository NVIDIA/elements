import { afterEach, describe, expect, it, vi } from 'vitest';

interface Example {
  elementName?: string;
  entrypoint?: string;
}

async function importExamplePage() {
  vi.resetModules();
  vi.stubEnv('ELEMENTS_SITE_URL', 'https://nvidia.github.io');
  vi.stubEnv('PAGES_BASE_URL', '/elements/');
  vi.doMock('../index.11tydata.js', () => ({
    siteData: {
      BASE_URL: '/elements/',
      examples: []
    }
  }));
  vi.doMock('@internals/tools/playground', () => ({
    PlaygroundService: {
      create: vi.fn().mockResolvedValue('')
    }
  }));

  return import('./index.11ty.js');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.doUnmock('../index.11tydata.js');
  vi.doUnmock('@internals/tools/playground');
});

describe('example page urls', () => {
  it('should point pattern examples at pattern documentation', async () => {
    const { getCanonicalPath, getCanonicalUrl, getDocumentationPath } = await importExamplePage();
    const example: Example = {
      elementName: 'patterns',
      entrypoint: '@internals/patterns/subheader.examples.json'
    };

    expect(getCanonicalPath(example)).toBe('/docs/patterns/subheader/');
    expect(getDocumentationPath(example)).toBe('/docs/patterns/subheader/');
    expect(getCanonicalUrl(example)).toBe('https://nvidia.github.io/elements/docs/patterns/subheader/');
  });

  it('should keep component examples pointed at component documentation', async () => {
    const { getCanonicalPath, getDocumentationPath } = await importExamplePage();
    const example: Example = {
      elementName: 'button',
      entrypoint: '@nvidia-elements/core/button/button.examples.json'
    };

    expect(getCanonicalPath(example)).toBe('/docs/elements/button/examples/');
    expect(getDocumentationPath(example)).toBe('/docs/elements/button/');
  });
});
