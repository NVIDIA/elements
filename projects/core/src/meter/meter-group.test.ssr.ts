// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import '@nvidia-elements/core/meter/define.js';

describe('nve-meter-group', () => {
  it('should render declarative shadow roots and preserve consumer semantics', async () => {
    const result = await ssrRunner.render(html`<nve-meter-group aria-label="Storage" style="width: 200px">
        <nve-meter aria-label="Apps" value="20" color="blue-cobalt"></nve-meter>
        <nve-meter aria-label="Media" value="30" color="teal-cyan"></nve-meter>
        <nve-meter aria-label="Available" value="0" color="gray-slate"></nve-meter>
      </nve-meter-group>`);
    expect(result).toContain('shadowroot="open"');
    expect(result).toContain('nve-meter-group');
    expect(result).toContain('aria-label="Apps"');
    expect(result).toContain('class="fill"');
    const meters = result.match(/<nve-meter\s[^>]*>/g);
    expect(meters).toHaveLength(3);
    expect(meters?.[0]).toContain('--_meter-segment-size: 20%');
    expect(meters?.[1]).toContain('--_meter-segment-size: 30%');
    expect(meters?.[2]).toContain('--_meter-segment-size: 0%');
  });

  it('should size property-bound segments on a nonzero range and preserve consumer styles', async () => {
    const result = await ssrRunner.render(html`
      <nve-meter-group>
        <nve-meter .min=${-20} .max=${80} .value=${30} style="--accent-color: rebeccapurple" aria-label="Temperature"></nve-meter>
      </nve-meter-group>
    `);
    const meter = result.match(/<nve-meter\s[^>]*>/)?.[0];
    expect(meter).toContain('--_meter-segment-size: 50%');
    expect(meter).toContain('--accent-color: rebeccapurple');
  });
});
