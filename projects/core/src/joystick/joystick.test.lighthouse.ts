// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('joystick lighthouse report', () => {
  it('should meet performance and accessibility budgets', async () => {
    const report = await lighthouseRunner.getReport('nve-joystick', /* html */ `
      <nve-joystick aria-label="Movement"></nve-joystick>
      <script type="module">
        import '@nvidia-elements/core/joystick/define.js';
      </script>
    `);
    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(18);
  });
});
