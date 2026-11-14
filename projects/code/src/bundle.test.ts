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
    element = fixture.querySelector('nve-code-block') as CodeBlock;
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should register bundled custom elements', () => {
    for (const tag of ['nve-code-block', 'nve-codeblock', 'nve-code-block-header', 'nve-code-block-footer']) {
      expect(customElements.get(tag)).toBeDefined();
    }
  });

  it('should register bundled languages', async () => {
    const languages: CodeBlock['language'][] = [
      'bash',
      'css',
      'go',
      'html',
      'javascript',
      'json',
      'markdown',
      'python',
      'shell',
      'toml',
      'typescript',
      'xml',
      'yaml'
    ];

    for (const [index, language] of languages.entries()) {
      element.language = language;
      element.code = `const value${index} = true;`;
      await elementIsStable(element);
    }

    expect(element.shadowRoot?.querySelector('code')?.textContent).toContain('value12');
  });
});
