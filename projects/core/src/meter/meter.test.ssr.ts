// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import '@nvidia-elements/core/meter/define.js';

describe('nve-meter', () => {
  it('should render declarative shadow roots and preserve consumer semantics', async () => {
    const result =
      await ssrRunner.render(html`<nve-meter aria-label="Storage used" value="58" max="128" aria-valuetext="58 GB of 128 GB used"></nve-meter>
      <nve-meter aria-labelledby="meter-label" aria-describedby="meter-description" value="0"></nve-meter>
      <span id="meter-label">Memory</span><span id="meter-description">Memory allocation</span>
      <nve-meter aria-label="Temperature" min="-50" max="50" value="0" status="warning"></nve-meter>`);
    expect(result).toContain('shadowroot="open"');
    expect(result).toContain('nve-meter');
    expect(result).toContain('aria-label="Storage used"');
    expect(result).toContain('class="fill"');
    expect(result).toContain('aria-valuetext="58 GB of 128 GB used"');
    expect(result).toContain('aria-labelledby="meter-label"');
    expect(result).toContain('aria-describedby="meter-description"');
    expect(result).toContain('status="warning"');
  });

  it('should render an empty default measurement without explicit bounds or styles', async () => {
    const result = await ssrRunner.render(html`<nve-meter aria-label="Storage"></nve-meter>`);
    expect(result.match(/<nve-meter\s[^>]*>/)?.[0]).toContain('--_meter-segment-size: 0%');
    expect(result).toContain('inline-size:var(--_meter-fill-size, 0%)');
  });

  it.each([
    { name: 'offset range', min: 10, max: 110, value: 35, percent: 25 },
    { name: 'negative range', min: -100, max: -20, value: -60, percent: 50 },
    { name: 'below minimum', min: 10, max: 110, value: -10, percent: 0 },
    { name: 'above maximum', min: 10, max: 110, value: 150, percent: 100 },
    { name: 'collapsed range', min: 20, max: 10, value: 50, percent: 0 },
    { name: 'non-finite value', min: 20, max: 100, value: Infinity, percent: 0 },
    { name: 'non-finite bounds', min: NaN, max: Infinity, value: 25, percent: 25 }
  ])(
    'should render the effective fill for $name while preserving consumer styles',
    async ({ min, max, value, percent }) => {
      const result = await ssrRunner.render(html`
      <nve-meter .min=${min} .max=${max} .value=${value}
        color="blue-cobalt" status="warning" style="width: 400px; --accent-color: rebeccapurple"
        aria-label="Storage"></nve-meter>
    `);
      const host = result.match(/<nve-meter\s[^>]*>/)?.[0];
      expect(host).toContain(`--_meter-segment-size: ${percent}%`);
      expect(host).toContain('width: 400px; --accent-color: rebeccapurple');
      expect(host).toContain('color="blue-cobalt"');
      expect(host).toContain('status="warning"');
      expect(result).toContain(`inline-size:var(--_meter-fill-size, ${percent}%)`);
    }
  );
});
