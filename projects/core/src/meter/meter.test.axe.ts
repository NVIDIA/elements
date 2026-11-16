// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import '@nvidia-elements/core/meter/define.js';

describe('nve-meter', () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture =
      await createFixture(html`<nve-meter aria-label="Storage used" value="58" max="128" aria-valuetext="58 GB of 128 GB used"></nve-meter>
      <nve-meter aria-labelledby="meter-label" aria-describedby="meter-description" value="0"></nve-meter>
      <span id="meter-label">Memory</span><span id="meter-description">Memory allocation</span>
      <nve-meter aria-label="Attention" value="25" status="accent"></nve-meter>
      <nve-meter aria-label="Healthy" value="50" status="success"></nve-meter>
      <nve-meter aria-label="Full" value="100" status="danger"></nve-meter>
      <nve-meter aria-label="Collapsed" min="10" max="10" value="10"></nve-meter>
      <nve-meter aria-label="Temperature" min="-50" max="50" value="0" status="warning"></nve-meter>`);
    await Promise.all(
      Array.from(fixture.querySelectorAll<HTMLElement>('nve-meter, nve-meter-group')).map(element =>
        elementIsStable(element)
      )
    );
  });

  afterEach(() => removeFixture(fixture));

  it('should pass axe for named measurements', async () => {
    const results = await runAxe(['nve-meter']);
    expect(results.violations.length).toBe(0);
  });
});
