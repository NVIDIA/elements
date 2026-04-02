// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('icon-button lighthouse report', () => {
  test('icon-button should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-icon-button', /* html */`
      <nve-icon-button icon-name="add" aria-label="icon button"></nve-icon-button>
      <script type="module">
        import '@nvidia-elements/core/icon-button/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(19.2);
  });
});
