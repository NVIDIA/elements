// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('progress-dot visual', () => {
  test.each(['', 'dark'] as const)('should match the %s theme baseline', async theme => {
    const report = await visualRunner.render(theme ? 'progress-dot.dark' : 'progress-dot', template(theme));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/progress-dot/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <div nve-layout="row gap:sm align:vertical-center">
      <nve-progress-dot size="sm"></nve-progress-dot>
      <nve-progress-dot size="md" aria-label="Loading results"></nve-progress-dot>
      <nve-progress-dot size="lg"></nve-progress-dot>
      <nve-progress-dot style="--color: var(--nve-sys-support-accent-color); --width: 48px; --height: 24px"></nve-progress-dot>
    </div>
  `;
}
