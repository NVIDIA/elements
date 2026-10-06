// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('drag-handle visual', () => {
  test.each(['light', 'dark'] as const)('should match the %s theme baseline', async theme => {
    const report = await visualRunner.render(`drag-handle.${theme}`, template(theme), { network: true });
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: 'light' | 'dark') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/drag-handle/define.js';
      document.documentElement.setAttribute('nve-theme', 'root ${theme}');
    </script>
    <div nve-layout="row gap:md pad:md">
      <nve-drag-handle aria-label="Move item"></nve-drag-handle>
      <nve-drag-handle pressed aria-label="Move selected item"></nve-drag-handle>
      <nve-drag-handle disabled aria-label="Move unavailable item"></nve-drag-handle>
    </div>
  `;
}
