// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('monaco-problems lighthouse report', () => {
  test('monaco-problems should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-monaco-problems', /* html */`
      <nve-monaco-problems></nve-monaco-problems>
      <script type="module">
        import '@nvidia-elements/monaco/problems/define.js';
      </script>
    `);

    expect(report.scores.performance).toBeGreaterThanOrEqual(90);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(1321);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(14);
    expect(report.payload.javascript.requests['editor2.global.js'].kb).toBeLessThan(78);
    expect(report.payload.javascript.requests['editor2.main.js'].kb).toBeLessThan(24);
    expect(report.payload.javascript.requests['dist.js'].kb).toBeLessThan(1114);
    expect(report.payload.javascript.requests['dark.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['light.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['problems-format2.js'].kb).toBeLessThan(1);
    expect(report.payload.javascript.requests['editor2.worker.js'].kb).toBeLessThan(88);
  });
});
