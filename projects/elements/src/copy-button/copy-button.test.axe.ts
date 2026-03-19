// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { CopyButton } from '@nvidia-elements/core/copy-button';
import '@nvidia-elements/core/copy-button/define.js';

describe(CopyButton.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: CopyButton;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-copy-button value="copy button"></nve-copy-button>
    `);
    element = fixture.querySelectorAll<CopyButton>(CopyButton.metadata.tag)[0];
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([CopyButton.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
