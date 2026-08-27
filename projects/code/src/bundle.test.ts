// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { CodeBlock } from '@nvidia-elements/code/codeblock';
// eslint-disable-next-line no-restricted-imports -- Verify the emitted bundle rather than the source entrypoint.
import '../dist/bundles/index.js';

describe('cdn bundle', () => {
  let fixture: HTMLElement;
  let element: CodeBlock;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-codeblock></nve-codeblock>`);
    element = fixture.querySelector('nve-codeblock');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should register bundled custom elements', () => {
    expect(customElements.get('nve-codeblock')).toBeDefined();
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
