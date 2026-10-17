// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('ghost visual', () => {
  for (const theme of ['', 'dark']) {
    it(`renders ${theme || 'light'} content, overlay, carried stacks, clipped, and corner previews`, async () => {
      const report = await visualRunner.render(
        `ghost${theme ? '.dark' : ''}`,
        /* html */ `
        <script type="module">
          import '@nvidia-elements/core/ghost/define.js';
          document.documentElement.setAttribute('nve-theme', '${theme}');
        </script>
        <nve-ghost style="width:220px;height:100px">
          <div nve-layout="column gap:md">
            <strong nve-text="heading">•︎•︎•︎•︎•︎•︎</strong>
            <p nve-text="body">•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎</p>
          </div>
        </nve-ghost>
        <div style="position:relative;width:220px;height:100px">
          <div nve-layout="column gap:md pad:md">
            <div nve-text="body">•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎</div>
            <div style="height:40px;background:var(--nve-sys-layer-container-background)"></div>
          </div>
          <nve-ghost style="position:absolute;inset:0 0 0 80px"></nve-ghost>
        </div>
        <nve-ghost style="width:fit-content;--background:var(--nve-sys-layer-container-background);--border:var(--nve-ref-border-width-md) solid var(--nve-sys-accent-secondary-background)">•︎•︎•︎•︎•︎•︎</nve-ghost>
        <div nve-layout="row gap:md">
          <nve-ghost layers="2" style="width:fit-content;--background:var(--nve-sys-layer-container-background);--border:var(--nve-ref-border-width-md) solid var(--nve-sys-accent-secondary-background)">•︎•︎•︎•︎•︎•︎</nve-ghost>
          <nve-ghost layers="3" style="width:fit-content;--stack-offset-x:6px;--stack-offset-y:3px;--background:var(--nve-sys-layer-container-background);--border:var(--nve-ref-border-width-md) solid var(--nve-sys-accent-secondary-background)">•︎•︎•︎•︎•︎•︎</nve-ghost>
        </div>
        <nve-ghost style="width:100px;white-space:nowrap;--color:var(--nve-sys-accent-secondary-background)">•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎•︎</nve-ghost>
        <nve-ghost style="width:160px;height:80px;--border-radius:24px 16px 8px 12px / 12px 8px 4px 6px;border-top-right-radius:0;border-bottom-right-radius:0"></nve-ghost>
        `
      );
      expect(report.maxDiffPercentage).toBeLessThan(1);
    });
  }
});
