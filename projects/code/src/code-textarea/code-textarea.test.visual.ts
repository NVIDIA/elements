// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

const source = `# Build status

Show the latest build result and link to the report.

~~~javascript
const status = "Ready";
const badge = html\`&lt;a class="status" href="/build"&gt;\${status}&lt;/a&gt;\`;
const styles = css\`.status { color: seagreen; }\`;
~~~`;

describe('code-textarea visual', () => {
  test.each(['light', 'dark'])('paints native highlights with wrapping and horizontal scrolling in %s', async theme => {
    const state = await visualRunner.inspect(`code-textarea.${theme}`, template(theme), async page => {
      return page.evaluate(() => {
        const wrapped = document.querySelector<HTMLTextAreaElement>('#wrapped');
        const scrolling = document.querySelector<HTMLTextAreaElement>('#scrolling');
        if (!wrapped || !scrolling) throw new Error('Missing native textareas');

        const nativeCategories = ['meta', 'keyword', 'tag', 'property'].filter(category =>
          Array.from(CSS.highlights.get(`nve-code-${category}`) ?? []).some(
            range => 'disconnect' in range && range.endOffset > range.startOffset
          )
        );
        scrolling.scrollLeft = 48;

        return {
          wrapOverflow: wrapped.scrollWidth - wrapped.clientWidth,
          scrollingOffset: scrolling.scrollLeft,
          nativeCategories,
          sourceColor: getComputedStyle(wrapped).color,
          keywordColor: getComputedStyle(wrapped, '::highlight(nve-code-keyword)').color
        };
      });
    });
    expect(state.wrapOverflow).toBe(0);
    expect(state.scrollingOffset).toBeGreaterThan(0);
    expect(state.nativeCategories).toEqual(['meta', 'keyword', 'tag', 'property']);
    expect(state.keywordColor).not.toBe(state.sourceColor);
  });
});

function template(theme: string) {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/code/languages/markdown.js';
      import '@nvidia-elements/code/code-textarea/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme} inter');
    </script>
    <style>
      body { min-width: 0; }
      nve-code-textarea { width: 360px; --font-family: Inter; }
      /* Set -webkit-text-security: disc so screenshots capture syntax colors on uniform dots
         while the textarea retains its source text. */
      textarea { resize: none; -webkit-text-security: disc; }
    </style>
    <nve-code-textarea language="markdown">
      <textarea id="wrapped" aria-label="Wrapped Markdown" rows="12" spellcheck="false">${source}</textarea>
    </nve-code-textarea>
    <nve-code-textarea language="markdown">
      <textarea id="scrolling" aria-label="Unwrapped Markdown" rows="9" spellcheck="false" wrap="off">${source}</textarea>
    </nve-code-textarea>
  `;
}
