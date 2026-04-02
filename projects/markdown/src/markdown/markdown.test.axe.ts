// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Markdown } from '@nvidia-elements/markdown/markdown';
import '@nvidia-elements/markdown/markdown/define.js';

describe(Markdown.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Markdown;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-markdown></nve-markdown>
    `);
    element = fixture.querySelector(Markdown.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Markdown.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
