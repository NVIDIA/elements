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

async function importShortcode() {
  vi.resetModules();
  vi.doMock('../../index.11tydata.js', () => ({
    siteData: {
      examples: [patternExample]
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
});
