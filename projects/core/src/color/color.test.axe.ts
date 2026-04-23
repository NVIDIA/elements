// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Color } from '@nvidia-elements/core/color';
import '@nvidia-elements/core/color/define.js';

describe(Color.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Color;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-color>
        <label>label</label>
        <input type="color" />
      </nve-color>
    `);
    element = fixture.querySelector(Color.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Color.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
