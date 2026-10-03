// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { VisualRunner } from '@internals/vite/runners/visual.js';

const source =
  '<div class="example">Hello</div>\n<script>\n// Embedded JavaScript\nconst message = "Hello";\nconst count = 42;\nif (count > 0) console.log(message);\n</script>\n<style>.example { color: red; }</style>';

const runner = new VisualRunner({ chromiumChannel: process.env.NVE_TEST_BROWSER_CHANNEL });
beforeAll(() => runner.open());
afterAll(() => runner.close());

describe('codeblock visual', () => {
  test.each(['light', 'dark'])('paints semantic ranges and line decorations in the %s theme', async theme => {
    const result = await runner.inspect(`codeblock.${theme}`, template(theme), async page => {
      return page.evaluate(() => {
        const element = document.querySelector('nve-codeblock');
        const code = element?.shadowRoot?.querySelector('code');
        if (!code) throw new Error('Missing codeblock');
        const groups = ['tag', 'keyword', 'string', 'comment', 'number'];
        return {
          text: code.textContent,
          elements: code.childElementCount,
          categories: groups.filter(name =>
            Array.from(CSS.highlights.get(`nve-code-${name}`) ?? []).some(
              range => 'startContainer' in range && code.contains(range.startContainer)
            )
          ),
          selected: element?.shadowRoot?.querySelectorAll('.selected-line').length
        };
      });
    });
    expect(result.text).toBe(source);
    expect(result.elements).toBe(0);
    expect(result.categories).toEqual(['tag', 'keyword', 'string', 'comment', 'number']);
    expect(result.selected).toBe(2);
  });
});

function template(theme: string) {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/code/codeblock/languages/html.js';
      import '@nvidia-elements/code/codeblock/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <style>body { width: fit-content; min-width: 0; } nve-codeblock { width: 600px; }</style>
    <nve-codeblock language="html" line-numbers highlight="2-3"><template>${source.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</template></nve-codeblock>
  `;
}
