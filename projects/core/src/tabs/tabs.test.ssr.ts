// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Tabs } from '@nvidia-elements/core/tabs';
import '@nvidia-elements/core/tabs/define.js';

describe(Tabs.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-tabs>
        <nve-tabs-item>Tab 1</nve-tabs-item>
        <nve-tabs-item selected>Tab 2</nve-tabs-item>
        <nve-tabs-item disabled>Tab 3</nve-tabs-item>
      </nve-tabs>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-tabs')).toBe(true);
    expect(result.includes('nve-tabs-item')).toBe(true);
  });
  it('should render decorative prefix and suffix slots', async () => {
    const result = await ssrRunner.render(html`
      <nve-tabs><nve-tabs-item>
        <span slot="prefix">●</span>Experiment
        <span slot="suffix">3</span>
      </nve-tabs-item></nve-tabs>
    `);
    expect(result).toContain('name="prefix"');
    expect(result).toContain('name="suffix"');
    expect(result).toContain('<span slot="suffix">3</span>');
  });
});
