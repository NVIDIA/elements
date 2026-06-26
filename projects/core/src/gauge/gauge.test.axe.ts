// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Gauge } from '@nvidia-elements/core/gauge';
import '@nvidia-elements/core/gauge/define.js';

describe(Gauge.metadata.tag, () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-gauge aria-label="progress" value="0"></nve-gauge>
      <nve-gauge aria-label="progress" value="50"></nve-gauge>
      <nve-gauge aria-label="progress" status="warning" value="75"></nve-gauge>
      <nve-gauge aria-label="progress" shape="half" status="success" value="100"></nve-gauge>
      <nve-gauge aria-label="progress" thumb="dot" status="accent" value="50"></nve-gauge>
      <nve-gauge aria-label="progress" thumb="needle" status="accent" value="50"></nve-gauge>
    `);
    const elements = Array.from(fixture.querySelectorAll(Gauge.metadata.tag)) as Gauge[];
    await Promise.all(elements.map(gauge => elementIsStable(gauge)));
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Gauge.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
