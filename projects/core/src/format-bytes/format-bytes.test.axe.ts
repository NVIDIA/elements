// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { FormatBytes } from '@nvidia-elements/core/format-bytes';
import '@nvidia-elements/core/format-bytes/define.js';

describe(FormatBytes.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: FormatBytes;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-format-bytes locale="en-US">1048576</nve-format-bytes>
    `);
    element = fixture.querySelector(FormatBytes.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    await elementIsStable(element);
    const results = await runAxe([FormatBytes.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
