import { afterEach, describe, expect, it, vi } from 'vitest';

interface TransformContext {
  page: {
    url: string;
    outputPath?: string;
  };
}

interface ImportTransformOptions {
  localPreview?: boolean;
  pagesBaseUrl?: string;
}

async function importTransform(runMode: 'build' | 'serve', options: ImportTransformOptions = {}) {
  vi.resetModules();
  vi.stubEnv('ELEVENTY_RUN_MODE', runMode);
  vi.stubEnv('LOCAL_PREVIEW', options.localPreview ? 'true' : 'false');
  vi.stubEnv('ELEMENTS_SITE_URL', 'https://nvidia.github.io');
  vi.stubEnv('PAGES_BASE_URL', options.pagesBaseUrl ?? '/elements/');

  return import('./site-urls.js');
}

function createContext(url = '/docs/integrations/', outputPath = 'index.html'): TransformContext {
  return {
    page: {
      url,
      outputPath
    }
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('siteUrlsTransform', () => {
  it('should fully qualify same-site urls in build output', async () => {
    const { siteUrlsTransform } = await importTransform('build');
    const html = `
<a href="docs/cli/">CLI</a>
<a href="./docs/mcp/#skills">MCP</a>
<a href="/docs/metrics/">Metrics</a>
<a href="/elements/docs/api-design/">API Design</a>
<a href="./">Home</a>
<a href=".">Root</a>
<img src="/elements/elements/static/images/integrations/angular.svg" alt="Angular logo">
`;

    const result = await siteUrlsTransform.call(createContext(), html, 'index.html');

    expect(result).toContain('href="https://nvidia.github.io/elements/docs/cli/"');
    expect(result).toContain('href="https://nvidia.github.io/elements/docs/mcp/#skills"');
    expect(result).toContain('href="https://nvidia.github.io/elements/docs/metrics/"');
    expect(result).toContain('href="https://nvidia.github.io/elements/docs/api-design/"');
    expect(result).toContain('href="https://nvidia.github.io/elements/"');
    expect(result).toContain('src="https://nvidia.github.io/elements/static/images/integrations/angular.svg"');
  });

  it('should keep local same-site urls root-relative outside build output', async () => {
    const { siteUrlsTransform } = await importTransform('serve');
    const html = `
<a href="/docs/metrics/">Metrics</a>
<a href="/elements/elements/docs/cli/">CLI</a>
<img src="/elements/elements/static/images/integrations/angular.svg" alt="Angular logo">
`;

    const result = await siteUrlsTransform.call(createContext(), html, 'index.html');

    expect(result).toContain('href="/docs/metrics/"');
    expect(result).toContain('href="/docs/cli/"');
    expect(result).toContain('src="/static/images/integrations/angular.svg"');
  });

  it('should preserve same-origin urls outside the configured site path', async () => {
    const { siteUrlsTransform } = await importTransform('serve');
    const html = `
<a href="https://nvidia.github.io/other-project/docs/cli/">Other project</a>
<a href="https://nvidia.github.io/elements/docs/cli/">Elements CLI</a>
`;

    const result = await siteUrlsTransform.call(createContext(), html, 'index.html');

    expect(result).toContain('href="https://nvidia.github.io/other-project/docs/cli/"');
    expect(result).toContain('href="/docs/cli/"');
  });

  it('should keep pages preview urls local when building for local preview', async () => {
    const { siteUrlsTransform } = await importTransform('build', {
      localPreview: true,
      pagesBaseUrl: '/elements/preview/'
    });
    const html = `
<base href="https://nvidia.github.io/elements/preview/">
<a href="https://nvidia.github.io/elements/preview/docs/cli/">CLI</a>
<img src="https://nvidia.github.io/elements/preview/static/images/integrations/angular.svg" alt="Angular logo">
`;

    const result = await siteUrlsTransform.call(createContext(), html, 'index.html');

    expect(result).toContain('href="/elements/preview/"');
    expect(result).toContain('href="/elements/preview/docs/cli/"');
    expect(result).toContain('src="/elements/preview/static/images/integrations/angular.svg"');
  });

  it('should keep canonical urls fully qualified when building for local preview', async () => {
    const { siteUrlsTransform } = await importTransform('build', {
      localPreview: true,
      pagesBaseUrl: '/elements/preview/'
    });
    const html = `
<link rel="canonical" href="https://nvidia.github.io/elements/docs/integrations/custom-elements/">
<a href="https://nvidia.github.io/elements/docs/integrations/custom-elements/">Custom Elements</a>
`;

    const result = await siteUrlsTransform.call(createContext(), html, 'index.html');

    expect(result).toContain(
      'rel="canonical" href="https://nvidia.github.io/elements/docs/integrations/custom-elements/"'
    );
    expect(result).toContain('href="/elements/preview/docs/integrations/custom-elements/"');
  });

  it('should preserve source module urls when building production output', async () => {
    const { siteUrlsTransform } = await importTransform('build');
    const html = `
<script type="module" src="https://nvidia.github.io/elements/404/index.ts"></script>
<img src="/static/images/integrations/angular.svg" alt="Angular logo">
`;

    const result = await siteUrlsTransform.call(createContext(), html, 'index.html');

    expect(result).toContain('src="/404/index.ts"');
    expect(result).toContain('src="https://nvidia.github.io/elements/static/images/integrations/angular.svg"');
  });

  it('should preserve source module urls when building for local preview', async () => {
    const { siteUrlsTransform } = await importTransform('build', {
      localPreview: true,
      pagesBaseUrl: '/elements/preview/'
    });
    const html = `
<script type="module" src="https://nvidia.github.io/elements/preview/404/index.ts"></script>
<img src="/static/images/integrations/angular.svg" alt="Angular logo">
`;

    const result = await siteUrlsTransform.call(createContext(), html, 'index.html');

    expect(result).toContain('src="/404/index.ts"');
    expect(result).toContain('src="/elements/preview/static/images/integrations/angular.svg"');
  });

  it('should preserve external protocol and fragment urls', async () => {
    const { siteUrlsTransform } = await importTransform('build');
    const html = `
<a href="https://example.com/docs/">External</a>
<a href="//example.com/docs/">Protocol</a>
<a href="mailto:docs@nvidia.com">Email</a>
<a href="tel:5555555555">Phone</a>
<a href="data:text/plain,docs">Data</a>
<a href="blob:https://example.com/id">Blob</a>
<a href="javascript:void(0)">JavaScript</a>
<a href="#section">Fragment</a>
<svg><use href="#icon"></use></svg>
`;

    const result = await siteUrlsTransform.call(createContext(), html, 'index.html');

    expect(result).toContain('href="https://example.com/docs/"');
    expect(result).toContain('href="//example.com/docs/"');
    expect(result).toContain('href="mailto:docs@nvidia.com"');
    expect(result).toContain('href="tel:5555555555"');
    expect(result).toContain('href="data:text/plain,docs"');
    expect(result).toContain('href="blob:https://example.com/id"');
    expect(result).toContain('href="javascript:void(0)"');
    expect(result).toContain('href="#section"');
    expect(result).toContain('href="#icon"');
  });

  it('should not rewrite urls inside template content', async () => {
    const { siteUrlsTransform } = await importTransform('build');
    const html = '<template><a href="/docs/cli/">CLI</a><img src="/elements/elements/static/x.svg"></template>';

    const result = await siteUrlsTransform.call(createContext(), html, 'index.html');

    expect(result).toBe(html);
  });

  it('should return non-html output unchanged', async () => {
    const { siteUrlsTransform } = await importTransform('build');
    const html = '<a href="/docs/cli/">CLI</a>';

    await expect(siteUrlsTransform.call(createContext(), html, 'index.xml')).resolves.toBe(html);
  });

  it('should use the Eleventy page output path when the output path argument is omitted', async () => {
    const { siteUrlsTransform } = await importTransform('serve');
    const html = '<a href="/docs/cli/">CLI</a>';

    const result = await siteUrlsTransform.call(createContext('/docs/integrations/', 'dist/index.html'), html);

    expect(result).toContain('href="/docs/cli/"');
  });
});
