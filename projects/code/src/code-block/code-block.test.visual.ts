// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';
import type { CodeBlock } from '@nvidia-elements/code/code-block';

const source = 'const message = "hello";\nconsole.log(message);\nconst ready = true;';
const longSource = `const message = "${'hello '.repeat(30)}";\n${Array.from({ length: 5 }, () => source).join('\n')}`;

for (const theme of ['light', 'dark']) {
  describe(`code block visual ${theme}`, () => {
    test('should match syntax, line decoration, and container baselines', async () => {
      const report = await visualRunner.render(
        `code-block.source.${theme}`,
        template(
          theme,
          `
          <nve-code-block language="shell"><template>pnpm install\npnpm run build</template></nve-code-block>
          <nve-code-block language="typescript" line-numbers highlight="2"><template>${source}</template></nve-code-block>
          <nve-code-block language="html"><pre><code>&lt;button disabled&gt;Save&lt;/button&gt;</code></pre></nve-code-block>
          <nve-code-block language="typescript" container="flat"><template>${source}</template></nve-code-block>
          <nve-code-block language="typescript" container="inline"><template>${source}</template></nve-code-block>
          <nve-code-block language="typescript" style="--white-space: pre-wrap;"><template>${longSource.split('\n')[0]}</template></nve-code-block>
        `
        ),
        { waitFor: waitForSource }
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
        { waitFor: waitForSource }
      );
      expect(report.maxDiffPercentage).toBeLessThan(1);
    });

    test('should keep header, footer, and actions visible when scrolled', async () => {
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
          <nve-code-block language="typescript" style="height: 260px; --white-space: pre-wrap;">
            ${header()}
            <template>${longSource}</template>
            ${footer()}
          </nve-code-block>
        `
        ),
        async page => {
          await page.waitForFunction(prepareSourceForSnapshot);
          const result = await page.evaluate(async () => {
            const block = document.querySelector<CodeBlock>('#scrolling');
            const scroller = block?.shadowRoot?.querySelector<HTMLElement>('.source');
            if (!block || !scroller) throw new Error('Code scroller is missing');
            const controls = Array.from(
              block.querySelectorAll('nve-code-block-header, nve-code-block-footer, [slot="actions"]')
            );
            const before = controls.map(control => control.getBoundingClientRect().toJSON());
            const overflow = {
              x: scroller.scrollWidth > scroller.clientWidth,
              y: scroller.scrollHeight > scroller.clientHeight
            };
            scroller.scrollLeft = 100;
            scroller.scrollTop = 60;
            await new Promise(resolve => requestAnimationFrame(resolve));
            return {
              overflow,
              scrollLeft: scroller.scrollLeft,
              scrollTop: scroller.scrollTop,
              before,
              after: controls.map(control => control.getBoundingClientRect().toJSON())
            };
          });
          expect(result.overflow).toEqual({ x: true, y: true });
          expect(result.scrollLeft).toBe(100);
          expect(result.scrollTop).toBe(60);
          expect(result.after).toEqual(result.before);
        }
      );
    });
  });
}

async function prepareSourceForSnapshot() {
  const blocks = Array.from(document.querySelectorAll<CodeBlock>('nve-code-block'));
  if (!blocks.length || blocks.some(block => !block.shadowRoot?.querySelector('code')?.textContent?.trim())) {
    return false;
  }

  await Promise.all(blocks.map(block => block.updateComplete));
  const fonts = await document.fonts.load('14px Inter');
  if (!fonts.length) throw new Error('The visual fixture font did not load');

  // Preserve syntax spans and whitespace while using consistent glyphs in screenshots.
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

async function waitForSource(wait: (...args: unknown[]) => Promise<unknown>) {
  await wait(prepareSourceForSnapshot);
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
      import '@nvidia-elements/code/code-block/languages/typescript.js';
      import '@nvidia-elements/code/code-block/languages/html.js';
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
