// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Range } from '@nvidia-elements/core/range';
import '@nvidia-elements/core/range/define.js';

describe(Range.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Range;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-range>
        <label>label</label>
        <input type="range" value="50" />
      </nve-range>
    `);
    element = fixture.querySelector(Range.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Range.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });

  it('should pass axe check for vertical orientation', async () => {
    removeFixture(fixture);
    fixture = await createFixture(html`
      <nve-range orientation="vertical" style="height: 200px">
        <label>label</label>
        <input type="range" value="50" />
      </nve-range>
    `);
    element = fixture.querySelector(Range.metadata.tag);
    await elementIsStable(element);
    const results = await runAxe([Range.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
