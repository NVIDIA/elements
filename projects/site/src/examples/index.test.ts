import { afterEach, describe, expect, it, vi } from 'vitest';

interface Example {
  elementName?: string;
  entrypoint?: string;
  id?: string;
}

interface ImportOptions {
  elementsPagesBaseUrl?: string;
  runMode?: 'build' | 'serve';
}

async function importExamplePage({
  elementsPagesBaseUrl = 'https://nvidia.github.io/elements/',
  runMode = 'build'
}: ImportOptions = {}) {
  vi.resetModules();
  vi.stubEnv('ELEVENTY_RUN_MODE', runMode);
  vi.stubEnv('ELEMENTS_PAGES_BASE_URL', elementsPagesBaseUrl);
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
  vi.resetModules();
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

  it('should resolve canonical urls from the deployed site url', async () => {
    const { getCanonicalUrl } = await importExamplePage({
      elementsPagesBaseUrl: 'https://docs.example.com/elements/'
    });
    const example: Example = {
      elementName: 'button',
      entrypoint: '@nvidia-elements/core/button/button.examples.json'
    };

    expect(getCanonicalUrl(example)).toBe('https://docs.example.com/elements/docs/elements/button/examples/');
  });
});

describe('example page rendering', () => {
  const example: Example = {
    id: 'Default',
    entrypoint: '@nvidia-elements/core/button/button.examples.json'
  };

  it('should omit the serve data module from production builds', async () => {
    const { renderServeExampleScript } = await importExamplePage();

    expect(renderServeExampleScript(example)).toBe('');
  });

  it('should load example data in serve mode', async () => {
    const { renderServeExampleScript } = await importExamplePage({ runMode: 'serve' });
    const script = renderServeExampleScript(example);

    expect(script).toContain(`import examples from '${example.entrypoint}'`);
    expect(script).toContain(`s.id === '${example.id}'`);
    expect(script).toContain('container.setHTMLUnsafe(example.template)');
  });
});
