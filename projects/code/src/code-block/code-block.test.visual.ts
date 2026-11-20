// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';
import type { CodeBlock } from '@nvidia-elements/code/code-block';

const source = 'const message = "hello";\nconsole.log(message);\nconst ready = true;';
const longSource = `const message = "${'hello '.repeat(30)}";\n${Array.from({ length: 5 }, () => source).join('\n')}`;

for (const theme of ['light', 'dark']) {
  describe(`code block visual ${theme}`, () => {
    test('should match line highlight baselines', async () => {
      const highlightedSource = `${source}\n${source}`;
      const report = await visualRunner.render(
        `code-block.highlight.${theme}`,
        template(
          theme,
          `
          <nve-code-block language="typescript" highlight="2"><template>${highlightedSource}</template></nve-code-block>
          <nve-code-block language="typescript" line-numbers highlight="2-4"><template>${highlightedSource}</template></nve-code-block>
          <nve-code-block language="typescript" highlight="1,3-4,6"><template>${highlightedSource}</template></nve-code-block>
          <nve-code-block language="typescript" line-numbers highlight="1,3-4,6"><template>${highlightedSource}</template></nve-code-block>
        `
        ),
        { waitFor: waitForSnapshot }
      );
      expect(report.maxDiffPercentage).toBeLessThan(1);
    });

    test('should match syntax, line decoration, and container baselines', async () => {
      const report = await visualRunner.render(
        `code-block.source.${theme}`,
        template(
          theme,
          `
          <nve-code-block language="text"><template>pnpm install\npnpm run build</template></nve-code-block>
          <nve-code-block language="typescript" line-numbers highlight="2"><template>${source}</template></nve-code-block>
          <nve-code-block language="html"><pre><code>&lt;button disabled&gt;Save&lt;/button&gt;</code></pre></nve-code-block>
          <nve-code-block language="typescript" container="flat"><template>${source}</template></nve-code-block>
          <nve-code-block language="typescript" container="inline"><template>${source}</template></nve-code-block>
          <nve-code-block language="typescript" style="--white-space: pre-wrap;"><template>${longSource.split('\n')[0]}</template></nve-code-block>
        `
        ),
        { waitFor: waitForSnapshot }
      );
      expect(report.maxDiffPercentage).toBeLessThan(1);
    });

    test('should match header and footer composition baselines', async () => {
      const report = await visualRunner.render(
        `code-block.composition.${theme}`,
        template(
          theme,
          `
          <nve-code-block language="typescript">
            ${header()}
            <template>${source}</template>
            ${footer()}
          </nve-code-block>
          <nve-code-block language="typescript" dir="rtl">
            ${header()}
            <template>${source}</template>
            ${footer()}
          </nve-code-block>
          <nve-code-block language="typescript" container="flat">
            <nve-code-block-header><span nve-text="body">...</span></nve-code-block-header>
            <template>${source}</template>
          </nve-code-block>
          <nve-code-block language="typescript" container="inline">
            <template>${source}</template>
            <nve-code-block-footer><span nve-text="body">...</span></nve-code-block-footer>
          </nve-code-block>
        `
        ),
        { waitFor: waitForSnapshot }
      );
      expect(report.maxDiffPercentage).toBeLessThan(1);
    });

    test('should match the overflow baseline after scrolling', async () => {
      await visualRunner.inspect(
        `code-block.overflow.${theme}`,
        template(
          theme,
          `
          <nve-code-block id="scrolling" language="typescript" line-numbers highlight="5" style="height: 260px;">
            ${header()}
            <template>${longSource}</template>
            <nve-icon-button slot="actions" icon-name="copy" aria-label="Copy source" container="flat"></nve-icon-button>
            ${footer()}
          </nve-code-block>
          <nve-code-block language="typescript" line-numbers highlight="1" style="height: 260px; --white-space: pre-wrap;">
            ${header()}
            <template>${longSource}</template>
            ${footer()}
          </nve-code-block>
        `
        ),
        async page => {
          await page.waitForFunction(prepareBlocksForSnapshot);
          await page.evaluate(async () => {
            const block = document.querySelector<CodeBlock>('#scrolling');
            const scroller = block?.shadowRoot?.querySelector<HTMLElement>('.source');
            if (!block || !scroller) throw new Error('Code scroller is missing');
            scroller.scrollLeft = 100;
            scroller.scrollTop = 60;
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          });
          await page.evaluate(normalizeLineNumbers);
        }
      );
    });
  });
}

async function prepareBlocksForSnapshot() {
  const blocks = Array.from(document.querySelectorAll<CodeBlock>('nve-code-block'));
  if (!blocks.length || blocks.some(block => !block.shadowRoot?.querySelector('code')?.textContent?.trim())) {
    return false;
  }

  await Promise.all(blocks.map(block => block.updateComplete));
  const fonts = await document.fonts.load('14px Inter');
  if (!fonts.length) throw new Error('The visual fixture font did not load');

  // Replace glyphs for consistent screenshots across platforms while preserving whitespace and highlight offsets.
  for (const block of blocks) {
    const code = block.shadowRoot?.querySelector('code');
    if (!code) return false;
    // Override the browser's platform-dependent monospace default on <code>.
    code.style.font = 'inherit';
    const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
    for (let text = walker.nextNode(); text; text = walker.nextNode()) {
      text.textContent = (text.textContent ?? '').replace(/[^\s]/g, '.');
    }
  }
  await document.fonts.ready;
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  return true;
}

function normalizeLineNumbers() {
  document.querySelectorAll('nve-code-block').forEach(block => {
    block.shadowRoot?.querySelectorAll('.line-number').forEach(label => {
      label.textContent = (label.textContent ?? '').replace(/[0-9]/g, '.');
    });
  });
  return true;
}

async function waitForSnapshot(wait: (...args: unknown[]) => Promise<unknown>) {
  await wait(prepareBlocksForSnapshot);
  await wait(normalizeLineNumbers);
}

function header() {
  return /* html */ `
    <nve-code-block-header>
      <nve-icon slot="prefix" name="terminal"></nve-icon>
      <span nve-text="body">...</span>
      <nve-icon-button slot="suffix" icon-name="copy" aria-label="Copy code" container="flat"></nve-icon-button>
    </nve-code-block-header>
  `;
}

function footer() {
  return /* html */ `
    <nve-code-block-footer>
      <span slot="prefix" nve-text="body">...</span>
      <span nve-text="body">......</span>
      <span slot="suffix" nve-text="body">...</span>
    </nve-code-block-footer>
  `;
}

function template(theme: string, content: string) {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/code/languages/typescript.js';
      import '@nvidia-elements/code/languages/html.js';
      import '@nvidia-elements/code/code-block/define.js';
      import '@nvidia-elements/core/icon/define.js';
      import '@nvidia-elements/core/icon-button/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme} inter');
    </script>
    <div style="display: grid; grid-template-columns: repeat(2, 420px); gap: var(--nve-ref-space-md); align-items: start;">
      ${content.replace(/>\s+</g, '><')}
    </div>
  `;
}
