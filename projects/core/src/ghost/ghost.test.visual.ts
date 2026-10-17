// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('ghost visual', () => {
  for (const theme of ['', 'dark']) {
    it(`renders ${theme || 'light'} destination and carried previews`, async () => {
      const report = await visualRunner.render(
        `ghost${theme ? '.dark' : ''}`,
        /* html */ `
        <script type="module">
          import '@nvidia-elements/core/ghost/define.js';
          document.documentElement.setAttribute('nve-theme', '${theme}');
        </script>
        <nve-ghost style="width:300px;height:180px">
          <span slot="label">Editor</span>
          Presentation preview
        </nve-ghost>
        <nve-ghost
          style="
            width: fit-content;
            --background: var(--nve-sys-layer-container-background);
            --border: 2px solid var(--nve-sys-accent-secondary-background);
          "
        >Carried title</nve-ghost>
        `
      );
      expect(report.maxDiffPercentage).toBeLessThan(1);
    });
  }
});
