// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('dropdown-group lighthouse report', () => {
  test('dropdown-group should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-dropdown-group', /* html */`
      <button popovertarget="menu-1">menu</button>
      <nve-dropdown-group>
        <nve-dropdown id="menu-1">
          <button popovertarget="menu-2">item 1-1</button>
          <button>item 1-2</button>
          <button>item 1-3</button>
        </nve-dropdown>
        <nve-dropdown id="menu-2" position="right">
          <button>item 2-1</button>
          <button>item 2-2</button>
          <button>item 2-3</button>
        </nve-dropdown>
      </nve-dropdown-group>
      <script type="module">
        import '@nvidia-elements/core/dropdown-group/define.js';
        import '@nvidia-elements/core/dropdown/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(24.6);
  });
});
