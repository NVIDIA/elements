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
      import { POINT, writePoint } from '@nvidia-elements/scene';
      import 'lit';
      import './local.js';
      const bytes = new Uint8Array(POINT.stride);
      writePoint(new DataView(bytes.buffer), 0, { position: [0, 0, 0] });
    </script>`;

    expect(rewriteDevImports(template)).toBe(`<script type="module">
      import { POINT, writePoint } from '/@id/@nvidia-elements/scene';
      import '/@id/lit';
      import './local.js';
      const bytes = new Uint8Array(POINT.stride);
      writePoint(new DataView(bytes.buffer), 0, { position: [0, 0, 0] });
    </script>`);
  });
});
