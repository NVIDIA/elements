// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('ghost lighthouse', () => {
  it('meets presentation performance and accessibility scores', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-ghost',
      /* html */ `
        <nve-ghost style="width:300px;height:180px">
          <span slot="label">Editor</span>
        </nve-ghost>
        <script type="module">
          import '@nvidia-elements/core/ghost/define.js';
        </script>
        `
    );
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
  });
});
