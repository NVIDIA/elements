// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { MonacoDiffInput } from '@nvidia-elements/monaco/diff-input';
import '@nvidia-elements/monaco/diff-input/define.js';

describe(MonacoDiffInput.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: MonacoDiffInput;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-monaco-diff-input language="plaintext" original="original value" value="modified value"></nve-monaco-diff-input>
    `);
    element = fixture.querySelector(MonacoDiffInput.metadata.tag);
    await untilEvent(element, 'ready');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([MonacoDiffInput.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
