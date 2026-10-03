// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { buildPage, VitePlaywrightRunner } from '@internals/vite/runners/playwright.js';
// eslint-disable-next-line no-restricted-imports -- Render the emitted templates used by the browser.
import { CodeBlock } from '../../dist/codeblock/index.js';
// eslint-disable-next-line no-restricted-imports -- Register the emitted component for server rendering.
import '../../dist/codeblock/define.js';
import { codeblockSSRFixture } from '../../tests/fixtures/codeblock-ssr.mjs';

const tooling = createRequire(new URL('../../package.json', import.meta.url));
const support = tooling
  .resolve('@lit-labs/ssr-client/lit-element-hydrate-support.js')
  .replace('/node/', '/')
  .replace('/development/', '/');
const hydrateModule = tooling.resolve('@lit-labs/ssr-client').replace('/node/', '/').replace('/development/', '/');
const fixtureModule = fileURLToPath(new URL('../../tests/fixtures/codeblock-ssr.mjs', import.meta.url));
const categoriesModule = fileURLToPath(new URL('../../dist/internal/highlight/categories.js', import.meta.url));
const registryModule = fileURLToPath(new URL('../../dist/internal/highlight/language-registry.js', import.meta.url));
const runner = new VitePlaywrightRunner({ runnerID: 'ssr' });
beforeAll(() => runner.open());
afterAll(() => runner.close());

const source = '\n  const text = "<tag>&";\n  const count = 42;\n';
const normalized = 'const text = "<tag>&";\nconst count = 42;';
const modes = ['property', 'text', 'template', 'pre'] as const;

describe(`${CodeBlock.metadata.tag} SSR and hydration`, () => {
  it('escapes server-rendered source without browser APIs or token elements', async () => {
    const result = await ssrRunner.render(codeblockSSRFixture('property', source));
    expect(result).toContain('shadowroot="open"');
    expect(result).toContain('&lt;tag&gt;&amp;');
    expect(result).not.toContain('<span class="hljs-');
    expect(result).not.toContain('data-line=');
  });

  it.each([
    ...modes.map(mode => ({ mode, text: source, expected: normalized, name: mode })),
    ...(['property', 'text'] as const).map(mode => ({ mode, text: '', expected: '', name: `${mode}-empty` }))
  ])('hydrates $name without replacing the server code node', async ({ mode, text, expected, name }) => {
    const rendered = await ssrRunner.render(codeblockSSRFixture(mode, text));
    const testName = `codeblock-${name}`;
    await buildPage(testName, 'ssr', (template: string) =>
      template.replace(
        '<body></body>',
        `<body>
      ${rendered}
      <script type="module">
        // Install support before shared package modules can initialize Lit.
        await import(${JSON.stringify(support)});
        const { hydrate } = await import(${JSON.stringify(hydrateModule)});
        const { codeblockSSRFixture } = await import(${JSON.stringify(fixtureModule)});
        const { categories } = await import(${JSON.stringify(categoriesModule)});
        const element = document.querySelector('nve-codeblock');
        const beforeCode = element.shadowRoot.querySelector('code');
        const beforeText = [...beforeCode.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
        const before = beforeCode.textContent;
        const beforeRanges = [...CSS.highlights.values()].reduce((count, group) => count + group.size, 0);
        await import('@nvidia-elements/code/codeblock/languages/javascript.js');
        const { CodeBlock } = await import('@nvidia-elements/code/codeblock/index.js');
        // Bind server properties before the element's first update can run.
        customElements.define('nve-codeblock', CodeBlock);
        hydrate(codeblockSSRFixture(${JSON.stringify(mode)}, ${JSON.stringify(text)}), document.body);
        while (!(await element.updateComplete)) {}
        await new Promise(resolve => requestAnimationFrame(resolve));
        while (!(await element.updateComplete)) {}
        const code = element.shadowRoot.querySelector('code');
        const ranges = [...CSS.highlights].flatMap(([name, group]) => [...group]
          .filter(range => 'startContainer' in range && code.contains(range.startContainer))
          .map(range => [range.startOffset, range.endOffset, categories.indexOf(name.slice(9))]))
          .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        const { getScanner } = await import(${JSON.stringify(registryModule)});
        element.dataset.hydrated = JSON.stringify({
          before, beforeRanges, sameCode: code === beforeCode,
          sameText: [...code.childNodes].find(node => node.nodeType === Node.TEXT_NODE) === beforeText, text: code.textContent,
          elements: code.childElementCount, ranges, expected: getScanner('javascript')(code.textContent),
          action: element.querySelector('[slot="actions"]').textContent
        });
      </script>
    </body>`
      )
    );
    const errors: string[] = [];
    const onError = (error: Error) => errors.push(error.message);
    runner.page.on('pageerror', onError);
    try {
      await runner.page.goto(`http://localhost:${runner.port}/${testName}/`);
      await runner.page.waitForFunction(() => document.querySelector('nve-codeblock')?.hasAttribute('data-hydrated'));
      const result = await runner.page.evaluate(() => {
        const data = document.querySelector('nve-codeblock')?.getAttribute('data-hydrated');
        if (!data) throw new Error('Missing hydration result');
        return JSON.parse(data);
      });
      expect(errors).toEqual([]);
      expect(result.before).toBe(mode === 'property' ? expected : '');
      expect(result.beforeRanges).toBe(0);
      expect(result.sameCode).toBe(true);
      if (mode === 'property' && text) expect(result.sameText).toBe(true);
      expect(result.text).toBe(expected);
      expect(result.elements).toBe(0);
      expect(result.ranges).toEqual(result.expected);
      expect(result.action).toBe('Copy');
    } finally {
      runner.page.off('pageerror', onError);
    }
  });
});
