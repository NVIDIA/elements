// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('codeblock lighthouse report', () => {
  test('codeblock should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-code-block', /* html */`
      <nve-code-block language="shell">
        <nve-code-block-header>Install</nve-code-block-header>
        <template>pnpm install</template>
        <nve-code-block-footer>Shell command</nve-code-block-footer>
      </nve-code-block>
      <script type="module">
        import '@nvidia-elements/code/code-block/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(19.7);
  });
});
