// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Select } from '@nvidia-elements/core/select';
import '@nvidia-elements/core/select/define.js';

describe(Select.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <nve-select>
        <label>label</label>
        <select>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">
            Option 3
            <template>
              Option 3
              <span>Custom Content</span> 
            </template>
          </option>
        </select>
      </nve-select>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-select')).toBe(true);
  });
});
