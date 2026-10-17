// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('workspace visual', () => {
  for (const theme of ['', 'dark']) {
    it(`renders ${theme || 'light'} panels`, async () => {
      const report = await visualRunner.render(
        `workspace${theme ? '.dark' : ''}`,
        /* html */ `
        <script type="module">
          import '@nvidia-elements/core/workspace/define.js';
          document.documentElement.setAttribute('nve-theme', '${theme}');
        </script>
        <nve-workspace style="height:250px">
          <nve-workspace-panel id="first">
            <span slot="label">First</span>
            First content
          </nve-workspace-panel>
          <nve-workspace-panel id="second">
            <span slot="label">Second</span>
            Second content
          </nve-workspace-panel>
        </nve-workspace>
        `
      );
      expect(report.maxDiffPercentage).toBeLessThan(1);
    });
  }
});
