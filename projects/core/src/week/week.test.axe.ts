// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Week } from '@nvidia-elements/core/week';
import '@nvidia-elements/core/week/define.js';

describe(Week.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Week;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-week>
        <label>label</label>
        <input type="week" />
      </nve-week>
    `);
    element = fixture.querySelector(Week.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Week.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
