// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { CodeTextarea } from '@nvidia-elements/code/code-textarea';
import '@nvidia-elements/code/code-textarea/define.js';
import '@nvidia-elements/code/codeblock/languages/typescript.js';

describe(CodeTextarea.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: CodeTextarea;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-code-textarea language="typescript">
        <label>Source code</label>
        <textarea name="source" required>const answer: number = 42;</textarea>
      </nve-code-textarea>
    `);
    const control = fixture.querySelector('nve-code-textarea');
    if (!control) throw new Error('Missing code textarea fixture');
    element = control;
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([CodeTextarea.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
