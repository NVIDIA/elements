import { afterEach, describe, expect, it, vi } from 'vitest';
import { transformWithOxc } from 'vite';
import { chromium } from 'playwright';
import { parseFragment, type DefaultTreeAdapterTypes } from 'parse5';
import markdown from '../libraries/markdown.js';

const patternExample = {
  id: 'pattern-chat-popover-chat',
  name: 'PopoverChat',
  template: '<nve-dialog></nve-dialog>',
  summary: 'Bottom-right anchored chat dialog with launcher button.',
  description: '',
  tags: ['pattern'],
  entrypoint: '@internals/patterns/chat.examples.json',
  element: 'nve-patterns',
  elementName: 'patterns',
  permalink: '@internals/patterns/chat-pattern-chat-popover-chat/'
};

const structuredDataExample = {
  ...patternExample,
  id: 'pattern-chat-structured-data',
  name: 'StructuredData',
  template: '<nve-dialog size="sm"></nve-dialog><script type="module">console.log("ready");</SCRIPT>',
  summary: 'Chat dialog using size="sm".',
  tags: ['pattern', 'template'],
  deprecated: true,
  permalink: '@internals/patterns/chat-pattern-chat-structured-data/'
};

const quotedNameExample = {
  ...patternExample,
  id: 'pattern-chat-quoted-name',
  name: 'Quoted "<Example>',
  permalink: '@internals/patterns/chat-pattern-chat-quoted-name/'
};

const authoredContent = [
  '',
  '',
  '  first line',
  '',
  '    indented line',
  '',
  '# heading',
  '- list',
  '```typescript',
  '  const answer = 42;',
  '```',
  '**bold** &amp; &lt;tag&gt; &#10;',
  '',
  ''
].join('\n');
// HTML consumes the first leading LF and decodes character references in textarea values.
const expectedValue = [
  '',
  '  first line',
  '',
  '    indented line',
  '',
  '# heading',
  '- list',
  '```typescript',
  '  const answer = 42;',
  '```',
  '**bold** & <tag> \n',
  '',
  ''
].join('\n');
const textarea = `<textarea aria-label="Message">${authoredContent}</textarea>`;
const textareaExample = {
  ...patternExample,
  id: 'textarea-whitespace',
  name: 'Whitespace',
  element: 'nve-textarea',
  template: `<div>${textarea}<textarea aria-label="Second">  second\n\n</textarea></div>`,
  summary: '',
  description: '',
  tags: [],
  entrypoint: '@nvidia-elements/core/textarea/textarea.examples.json'
};

const scriptContent = 'const markup = `<textarea>\nfirst\n</textarea>`;';
const scriptExample = {
  ...textareaExample,
  id: 'textarea-script-content',
  name: 'ScriptContent',
  template: `<div>${textarea}<script type="module">${scriptContent}</script><template>${textarea}</template></div>`
};

const lineEndingExamples = [
  {
    ...textareaExample,
    id: 'textarea-crlf',
    name: 'CRLF',
    template: '<textarea>\r\nfirst\r\nsecond\r\n</textarea>'
  },
  {
    ...textareaExample,
    id: 'textarea-cr',
    name: 'CR',
    template: '<textarea>\rfirst\rsecond\r</textarea>'
  }
];

function findElements(node: DefaultTreeAdapterTypes.Node, tag: string): DefaultTreeAdapterTypes.Element[] {
  const elements: DefaultTreeAdapterTypes.Element[] = [];
  if ('tagName' in node && node.tagName === tag) elements.push(node);
  if ('childNodes' in node) {
    for (const child of node.childNodes) {
      elements.push(...findElements(child, tag));
    }
  }
  return elements;
}

async function importShortcode() {
  vi.resetModules();
  vi.doMock('../../index.11tydata.js', () => ({
    siteData: {
      examples: [
        patternExample,
        structuredDataExample,
        quotedNameExample,
        textareaExample,
        scriptExample,
        ...lineEndingExamples
      ]
    }
  }));
  vi.doMock('@internals/tools/playground', () => ({
    PlaygroundService: {
      create: vi.fn().mockResolvedValue('')
    }
  }));

  return import('./example.js');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.doUnmock('../../index.11tydata.js');
  vi.doUnmock('@internals/tools/playground');
});

describe('exampleShortcode', () => {
  it('preserves values and displayed source through the shortcode, Markdown, and HTML parsing', async () => {
    const { exampleShortcode } = await importShortcode();
    const shortcodeHtml = await exampleShortcode(textareaExample.entrypoint, textareaExample.name, {
      summary: false
    });
    const renderedHtml = markdown.render(shortcodeHtml);
    const document = parseFragment(renderedHtml);

    const textareas = findElements(document, 'textarea');
    expect(textareas).toHaveLength(2);
    expect(textareas[0]?.childNodes).toMatchObject([{ nodeName: '#text', value: expectedValue }]);
    expect(textareas[1]?.childNodes).toMatchObject([{ nodeName: '#text', value: '  second\n\n' }]);

    const codeBlocks = findElements(document, 'code');
    expect(codeBlocks).toHaveLength(1);
    expect(codeBlocks[0]?.childNodes).toMatchObject([{ nodeName: '#text', value: textareaExample.template }]);
  });

  it.each(lineEndingExamples)('preserves native values and exact source with $name line endings', async example => {
    const { exampleShortcode } = await importShortcode();
    const shortcodeHtml = await exampleShortcode(example.entrypoint, example.name, { summary: false });
    const renderedHtml = markdown.render(shortcodeHtml);
    const document = parseFragment(renderedHtml);

    const textareas = findElements(document, 'textarea');
    expect(textareas).toHaveLength(1);
    expect(textareas[0]?.childNodes).toMatchObject([{ nodeName: '#text', value: 'first\nsecond\n' }]);

    const codeBlocks = findElements(document, 'code');
    expect(codeBlocks).toHaveLength(1);
    expect(codeBlocks[0]?.childNodes).toMatchObject([{ nodeName: '#text', value: example.template }]);
  });

  it('preserves script strings containing textarea markup while encoding actual textarea content', async () => {
    const { exampleShortcode } = await importShortcode();
    const shortcodeHtml = await exampleShortcode(scriptExample.entrypoint, scriptExample.name, { summary: false });
    const renderedHtml = markdown.render(shortcodeHtml);
    const document = parseFragment(renderedHtml);

    const scripts = findElements(document, 'script').filter(script =>
      script.attrs.some(attr => attr.name === 'type' && attr.value === 'module')
    );
    expect(scripts).toHaveLength(1);
    expect(scripts[0]?.childNodes).toMatchObject([{ nodeName: '#text', value: scriptContent }]);

    const textareas = findElements(document, 'textarea');
    expect(textareas).toHaveLength(1);
    expect(textareas[0]?.childNodes).toMatchObject([{ nodeName: '#text', value: expectedValue }]);

    const templates = findElements(document, 'template');
    expect(templates).toHaveLength(1);
    expect(templates[0]).toMatchObject({
      content: { childNodes: [{ tagName: 'textarea', childNodes: [{ nodeName: '#text', value: expectedValue }] }] }
    });

    const codeBlocks = findElements(document, 'code');
    expect(codeBlocks).toHaveLength(1);
    expect(codeBlocks[0]?.childNodes).toMatchObject([{ nodeName: '#text', value: scriptExample.template }]);
  });

  it('should render iframe examples from the root examples route', async () => {
    const { exampleShortcode } = await importShortcode();

    const html = await exampleShortcode('@internals/patterns/chat.examples.json', 'PopoverChat', {
      inline: false
    });

    expect(html).toContain('src="/examples/@internals/patterns/chat-pattern-chat-popover-chat/index.html"');
    expect(html).not.toContain('/docs/patterns/chat/examples/');
  });

  it('should slot its source <pre><code> block directly into the canvas', async () => {
    const { exampleShortcode } = await importShortcode();

    const html = await exampleShortcode('@internals/patterns/chat.examples.json', 'PopoverChat');

    expect(html).toContain('<nvd-canvas id="internals-patterns-chat-examples-json_pattern-chat-popover-chat"');
    expect(html).toContain('<pre aria-hidden="true"><code>&lt;nve-dialog&gt;&lt;/nve-dialog&gt;</code></pre><div');
    expect(html).not.toContain('<template>');
  });

  it('should escape the example name in the canvas label', async () => {
    const { exampleShortcode } = await importShortcode();

    const html = await exampleShortcode('@internals/patterns/chat.examples.json', quotedNameExample.name);

    expect(html).toContain('aria-label="example \'Quoted &quot;&lt;Example&gt;\'"');
    expect(html).not.toContain('aria-label="example \'Quoted "<Example>\'"');
  });

  it('should render valid and safely encoded SoftwareSourceCode metadata', async () => {
    vi.stubEnv('ELEMENTS_SITE_URL', 'https://nvidia.github.io');
    vi.stubEnv('ELEMENTS_REPO_BASE_URL', 'https://github.com/NVIDIA/elements');
    vi.stubEnv('PAGES_BASE_URL', '/elements/');
    const { exampleShortcode } = await importShortcode();

    const html = await exampleShortcode.call(
      { page: { url: '/docs/patterns/chat/' } },
      '@internals/patterns/chat.examples.json',
      'StructuredData'
    );
    const script = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    const structuredData: unknown = JSON.parse(script?.[1] ?? '{}');
    const canonicalPageUrl = 'https://nvidia.github.io/elements/docs/patterns/chat/';
    const canonicalExampleUrl = `${canonicalPageUrl}#internals-patterns-chat-examples-json_pattern-chat-structured-data`;

    expect(script?.[1]).toContain('\\u003c/SCRIPT>');
    expect(script?.[1]).not.toContain('<');
    expect(structuredData).toMatchObject({
      '@context': 'https://schema.org',
      '@id': canonicalExampleUrl,
      '@type': 'SoftwareSourceCode',
      identifier: structuredDataExample.id,
      name: 'NVIDIA Elements | nve-patterns | StructuredData',
      description: structuredDataExample.summary,
      url: canonicalExampleUrl,
      isPartOf: { '@id': canonicalPageUrl },
      about: { '@type': 'Thing', name: 'nve-patterns' },
      author: {
        '@id': 'https://nvidia.github.io/elements/#author',
        '@type': 'Organization',
        name: 'NVIDIA Elements Team',
        url: 'https://nvidia.github.io/elements/'
      },
      publisher: { '@type': 'Organization', name: 'NVIDIA', url: 'https://www.nvidia.com/' },
      codeRepository: 'https://github.com/NVIDIA/elements',
      license: 'https://github.com/NVIDIA/elements/blob/main/LICENSE',
      programmingLanguage: {
        '@type': 'ComputerLanguage',
        name: 'HTML',
        url: 'https://html.spec.whatwg.org/'
      },
      runtimePlatform: 'Web browser',
      codeSampleType: 'template',
      encodingFormat: 'text/html',
      keywords: ['nve-patterns', 'pattern', 'template'],
      targetProduct: {
        '@id': 'https://nvidia.github.io/elements/#software',
        '@type': 'SoftwareApplication',
        name: 'NVIDIA Elements',
        url: 'https://nvidia.github.io/elements/'
      },
      creativeWorkStatus: 'Deprecated',
      text: structuredDataExample.template
    });
  });

  it('should render a reload module that remains valid when whitespace collapses', async () => {
    vi.stubEnv('ELEVENTY_RUN_MODE', 'serve');
    const { exampleShortcode } = await importShortcode();

    const html = await exampleShortcode('@internals/patterns/chat.examples.json', 'PopoverChat');
    const reloadModule = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)]
      .map(match => match[1] ?? '')
      .find(script => script.includes('import examples from'));
    const collapsedModule = reloadModule?.replace(/\s+/g, ' ') ?? '';

    expect(reloadModule).toBeDefined();
    await expect(transformWithOxc(collapsedModule, 'reload.js', { lang: 'js' })).resolves.toBeDefined();
  });

  it('preserves textarea values and updates source across development reloads while executing scripts once per reload', async () => {
    vi.stubEnv('ELEVENTY_RUN_MODE', 'serve');
    const { exampleShortcode } = await importShortcode();
    const shortcodeHtml = await exampleShortcode(textareaExample.entrypoint, textareaExample.name, {
      summary: false
    });
    const scriptText = `<script type="module">import 'textarea-content';</script>`;
    const updatedTemplate = [
      `<textarea>${authoredContent}${scriptText}</textarea>`,
      `<script>document.body.dataset.reloadExecutions = String(Number(document.body.dataset.reloadExecutions ?? 0) + 1); document.body.dataset.classicText = "import 'classic-content';";</script>`,
      `<script type="module">import 'reload-module'; document.body.dataset.moduleExecutions = String(Number(document.body.dataset.moduleExecutions ?? 0) + 1);</script>`
    ].join('');
    const importMap = { imports: { [textareaExample.entrypoint]: '/reload-examples.json' } };
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      await page.route('http://localhost/reload-examples.json', route =>
        route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ items: [{ id: textareaExample.id, template: updatedTemplate }] })
        })
      );
      await page.route('http://localhost/@id/reload-module', route =>
        route.fulfill({ contentType: 'text/javascript', body: 'export const loaded = true;' })
      );
      await page.route('http://localhost/reload-test/', route =>
        route.fulfill({
          contentType: 'text/html',
          body: `<!doctype html><html><head><script type="importmap">${JSON.stringify(importMap)}</script></head><body>${shortcodeHtml}</body></html>`
        })
      );
      await page.goto('http://localhost/reload-test/');

      for (let reload = 1; reload <= 2; reload++) {
        await page.waitForFunction(
          count => globalThis.document.body.dataset.reloadExecutions === String(count),
          reload
        );
        await page.waitForFunction(
          count => globalThis.document.body.dataset.moduleExecutions === String(count),
          reload
        );
        expect(await page.locator('nvd-canvas textarea').count()).toBe(1);
        expect(await page.locator('nvd-canvas textarea').inputValue()).toBe(expectedValue + scriptText);
        expect(await page.locator('body').getAttribute('data-classic-text')).toBe("import 'classic-content';");
        expect(
          await page.locator('nvd-canvas').evaluate(canvas => ('source' in canvas ? canvas.source : undefined))
        ).toBe(updatedTemplate);
        if (reload === 1) {
          await page.evaluate(() => {
            const original = globalThis.document.querySelector('nvd-canvas > script[type="module"]');
            const script = globalThis.document.createElement('script');
            script.type = 'module';
            script.textContent = original?.textContent ?? '';
            globalThis.document.body.append(script);
          });
        }
      }
    } finally {
      await browser.close();
    }
  });

  it('should preserve imported example bindings when rewriting development module imports', async () => {
    const { rewriteDevImports } = await importShortcode();
    const script = `
      import { Badge, Button } from '@nvidia-elements/core';
      import 'lit';
      import './local.js';
      const constructors = [Badge, Button];
    `;

    expect(rewriteDevImports({ type: 'module', textContent: script })).toBe(`
      import { Badge, Button } from '/@id/@nvidia-elements/core';
      import '/@id/lit';
      import './local.js';
      const constructors = [Badge, Button];
    `);
  });

  it('should preserve absolute URL imports when rewriting development module imports', async () => {
    const { rewriteDevImports } = await importShortcode();
    const script = `
      import 'http://localhost:3000/component.js';
      import { register } from 'https://cdn.example.com/component.js';
      import '@nvidia-elements/core';
    `;

    expect(rewriteDevImports({ type: 'module', textContent: script })).toBe(`
      import 'http://localhost:3000/component.js';
      import { register } from 'https://cdn.example.com/component.js';
      import '/@id/@nvidia-elements/core';
    `);
  });
});
