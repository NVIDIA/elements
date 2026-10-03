// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import process from 'node:process';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { VisualRunner } from '@internals/vite/runners/visual.js';

const runner = new VisualRunner({
  chromiumChannel: process.env.NVE_TEST_BROWSER_CHANNEL,
  chromiumArgs: [
    '--enable-blink-features=OpaqueRange',
    '--headless',
    '--font-render-hinting=none',
    '--disable-skia-runtime-opts',
    '--disable-font-subpixel-positioning',
    '--disable-lcd-text'
  ]
});

beforeAll(() => runner.open());
afterAll(() => runner.close());

describe('code-textarea visual', () => {
  test.each(['light', 'dark'])('paints native syntax highlights in the %s theme', async theme => {
    const colors = await runner.inspect(`code-textarea.${theme}`, template(theme), async page => {
      return page.evaluate(() => {
        const textarea = document.querySelector('textarea');
        if (!textarea || !('createValueRange' in textarea)) throw new Error('Native opaque ranges are required');
        const version = Number(navigator.userAgent.match(/Chrome\/(\d+)/)?.[1]);
        if (version < 152) throw new Error('Native multiline painting requires Chromium 152 or newer');
        const ranges = Array.from(CSS.highlights.get('nve-code-keyword') ?? []);
        if (!ranges.some(range => 'disconnect' in range && range.endOffset > range.startOffset)) {
          throw new Error('Missing native keyword ranges');
        }
        return [getComputedStyle(textarea).color, getComputedStyle(textarea, '::highlight(nve-code-keyword)').color];
      });
    });
    expect(colors[0]).not.toBe(colors[1]);
  });
});

function template(theme: string) {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/code/codeblock/languages/typescript.js';
      import '@nvidia-elements/code/code-textarea/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <style>body { width: fit-content; min-width: 0; } nve-code-textarea { width: 480px; } textarea { resize: none; }</style>
    <nve-code-textarea language="typescript">
      <label>Source code</label>
      <textarea name="source" rows="5" spellcheck="false">// A source snippet
function greet(name: string): string {
  return "Hello, " + name;
}</textarea>
    </nve-code-textarea>
  `;
}
