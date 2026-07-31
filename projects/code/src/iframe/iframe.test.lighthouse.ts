// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('iframe lighthouse report', () => {
  test('iframe should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-iframe', /* html */`
      <nve-iframe aria-label="iframe test"></nve-iframe>
      <script type="module">
        import '@nvidia-elements/code/iframe/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(10);
  });
});
