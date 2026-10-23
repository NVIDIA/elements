// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { TabsItemGroup } from '@nvidia-elements/core/tabs';
import '@nvidia-elements/core/tabs/define.js';

describe(TabsItemGroup.metadata.tag, () => {
  it('should render its layout slots while retaining the supplied tab and accessory as siblings', async () => {
    const result = await ssrRunner.render(html`
      <nve-tabs>
        <nve-tabs-item-group>
          <nve-tabs-item selected>Experiment</nve-tabs-item>
          <button slot="suffix" type="button" tabindex="-1">Close experiment</button>
        </nve-tabs-item-group>
      </nve-tabs>
    `);

    expect(result).toContain('shadowroot="open"');
    expect(result).toContain('nve-tabs-item-group');
    expect(result).toContain('name="prefix"');
    expect(result).toContain('name="suffix"');
    expect(result).toContain('tabindex="-1"');
    expect(result.indexOf('<button slot="suffix"')).toBeGreaterThan(result.indexOf('</nve-tabs-item>'));
  });
});
