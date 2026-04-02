// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('monaco-input lighthouse report', () => {
  test('monaco-input should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-monaco-input', /* html */`
      <nve-monaco-input language="plaintext"></nve-monaco-input>
      <script type="module">
        import '@nvidia-elements/monaco/input/define.js';
      </script>
    `);

    expect(report.scores.performance).toBeGreaterThanOrEqual(90);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(1320);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(14);
    expect(report.payload.javascript.requests['editor2.global.js'].kb).toBeLessThan(78);
    expect(report.payload.javascript.requests['editor2.main.js'].kb).toBeLessThan(24);
    expect(report.payload.javascript.requests['dist.js'].kb).toBeLessThan(1114);
    expect(report.payload.javascript.requests['dark.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['light.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['editor2.worker.js'].kb).toBeLessThan(88);
  });

  test('monaco-input worker bundles should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-monaco-input', /* html */`
      <nve-monaco-input language="plaintext"></nve-monaco-input>
      <nve-monaco-input language="css"></nve-monaco-input>
      <nve-monaco-input language="html"></nve-monaco-input>
      <nve-monaco-input language="json"></nve-monaco-input>
      <nve-monaco-input language="typescript"></nve-monaco-input>
      <script type="module">
        import '@nvidia-elements/monaco/input/define.js';
      </script>
    `);

    expect(report.scores.performance).toBeGreaterThanOrEqual(90);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(3366);
    expect(report.payload.javascript.requests['index.js'].kb).toBeLessThan(14);
    expect(report.payload.javascript.requests['editor2.global.js'].kb).toBeLessThan(78);
    expect(report.payload.javascript.requests['editor2.main.js'].kb).toBeLessThan(24);
    expect(report.payload.javascript.requests['dist.js'].kb).toBeLessThan(1114);
    expect(report.payload.javascript.requests['dark.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['light.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['editor2.worker.js'].kb).toBeLessThan(88);
    expect(report.payload.javascript.requests['css2.worker.js'].kb).toBeLessThan(243);
    expect(report.payload.javascript.requests['html2.worker.js'].kb).toBeLessThan(192);
    expect(report.payload.javascript.requests['json2.worker.js'].kb).toBeLessThan(124);
    expect(report.payload.javascript.requests['ts2.worker.js'].kb).toBeLessThan(1492);
  });
});