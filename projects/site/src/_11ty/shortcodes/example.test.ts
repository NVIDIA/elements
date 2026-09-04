import { afterEach, describe, expect, it, vi } from 'vitest';

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

async function importShortcode() {
  vi.resetModules();
  vi.doMock('../../index.11tydata.js', () => ({
    siteData: {
      examples: [patternExample, structuredDataExample]
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
  it('should render iframe examples from the root examples route', async () => {
    const { exampleShortcode } = await importShortcode();

    const html = await exampleShortcode('@internals/patterns/chat.examples.json', 'PopoverChat', {
      inline: false
    });

    expect(html).toContain('src="/examples/@internals/patterns/chat-pattern-chat-popover-chat/index.html"');
    expect(html).not.toContain('/docs/patterns/chat/examples/');
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

    expect(script?.[1]).toContain('<\\/SCRIPT>');
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

  it('should preserve imported example bindings when rewriting development module imports', async () => {
    const { rewriteDevImports } = await importShortcode();
    const template = `<script type="module">
      import { Badge, Button } from '@nvidia-elements/core';
      import 'lit';
      import './local.js';
      const constructors = [Badge, Button];
    </script>`;

    expect(rewriteDevImports(template)).toBe(`<script type="module">
      import { Badge, Button } from '/@id/@nvidia-elements/core';
      import '/@id/lit';
      import './local.js';
      const constructors = [Badge, Button];
    </script>`);
  });

  it('should preserve absolute URL imports when rewriting development module imports', async () => {
    const { rewriteDevImports } = await importShortcode();
    const template = `<script type="module">
      import 'http://localhost:3000/component.js';
      import { register } from 'https://cdn.example.com/component.js';
      import '@nvidia-elements/core';
    </script>`;

    expect(rewriteDevImports(template)).toBe(`<script type="module">
      import 'http://localhost:3000/component.js';
      import { register } from 'https://cdn.example.com/component.js';
      import '/@id/@nvidia-elements/core';
    </script>`);
  });

  it('should only rewrite imports in module script blocks', async () => {
    const { rewriteDevImports } = await importShortcode();
    const template = `<nve-codeblock language="typescript">
      import '@nvidia-elements/core/chat-message/define.js';
    </nve-codeblock>
    <script type="module">
      import '@nvidia-elements/core/chat-message/define.js';
    </script>`;

    expect(rewriteDevImports(template)).toBe(`<nve-codeblock language="typescript">
      import '@nvidia-elements/core/chat-message/define.js';
    </nve-codeblock>
    <script type="module">
      import '/@id/@nvidia-elements/core/chat-message/define.js';
    </script>`);
  });

  it('should preserve imported example bindings when rewriting development module imports', async () => {
    const { rewriteDevImports } = await importShortcode();
    const template = `<script type="module">
      import { PointBuffer } from '@nvidia-elements/scene';
      import 'lit';
      import './local.js';
      const points = new PointBuffer({ capacity: 1 });
      points.add({ position: [0, 0, 0] });
    </script>`;

    expect(rewriteDevImports(template)).toBe(`<script type="module">
      import { PointBuffer } from '/@id/@nvidia-elements/scene';
      import '/@id/lit';
      import './local.js';
      const points = new PointBuffer({ capacity: 1 });
      points.add({ position: [0, 0, 0] });
    </script>`);
  });
});
