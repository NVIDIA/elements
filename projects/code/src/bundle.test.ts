// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { CodeBlock } from '@nvidia-elements/code/code-block';
// eslint-disable-next-line no-restricted-imports -- Verify the emitted bundle rather than the source entrypoint.
import '../dist/bundles/index.js';

describe('cdn bundle', () => {
  let fixture: HTMLElement;
  let element: CodeBlock;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-code-block></nve-code-block>`);
    const control = fixture.querySelector('nve-code-block');
    if (!control) throw new Error('Missing codeblock fixture');
    element = control;
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should register bundled custom elements', () => {
    for (const tag of [
      'nve-code-block',
      'nve-codeblock',
      'nve-code-block-header',
      'nve-code-block-footer',
      'nve-code-textarea'
    ]) {
      expect(customElements.get(tag)).toBeDefined();
    }
  });

  const languageSamples: [CodeBlock['language'], string, { category: string; token: string }][] = [
    ['css', '.panel { color: red; }', { category: 'property', token: 'color' }],
    ['go', 'package main\nfunc run() {}', { category: 'keyword', token: 'func' }],
    ['html', '<article>Ready</article>', { category: 'tag', token: 'article' }],
    ['javascript', 'const count = 42;', { category: 'keyword', token: 'const' }],
    ['json', '{"count":42}', { category: 'number', token: '42' }],
    ['markdown', '# Ready', { category: 'meta', token: '#' }],
    ['python', 'def greet(): return "Hello"', { category: 'function', token: 'greet' }],
    ['tsx', 'const card = <Card />;', { category: 'tag', token: 'Card' }],
    ['typescript', 'const count: number = 42;', { category: 'type', token: 'number' }],
    ['xml', '<status />', { category: 'tag', token: 'status' }],
    ['yaml', 'status: ready', { category: 'property', token: 'status' }]
  ];

  it.each(languageSamples)('should color %s with its bundled parser', async (language, source, { category, token }) => {
    element.language = language;
    element.code = source;
    await elementIsStable(element);

    const code = element.shadowRoot?.querySelector('code');
    const ranges = [...(CSS.highlights.get(`nve-code-${category}`) ?? [])].filter(range =>
      code?.contains(range.startContainer)
    );
    expect(ranges.map(range => source.slice(range.startOffset, range.endOffset))).toContain(token);
  });
});
