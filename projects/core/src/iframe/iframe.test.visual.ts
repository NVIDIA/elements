// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('iframe visual', () => {
  test.each(['', 'dark'] as const)('iframe should match visual baseline for theme %s', async theme => {
    const report = await visualRunner.render(theme ? 'iframe.dark' : 'iframe', template(theme), {
      waitFor: waitFor =>
        waitFor(() =>
          [...document.querySelectorAll('nve-iframe')].every(
            element => element instanceof HTMLElement && element.style.getPropertyValue('--_width') === '128px'
          )
        )
    });
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  const head = /* html */ `
    <template slot="head">
      <style>
        body { width: 128px; height: 80px; padding: 16px; background: Canvas; color: CanvasText; }
      </style>
    </template>
  `;

  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/iframe/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <div nve-layout="row gap:sm">
      <nve-iframe aria-label="Intrinsic size iframe">
        ${head}
        <template><p nve-text="body">•︎•︎•︎</p></template>
      </nve-iframe>
      <nve-iframe aria-label="Fixed size iframe" style="--width: 192px; --height: 128px">
        ${head}
        <template><p nve-text="body">•︎•︎•︎</p></template>
      </nve-iframe>
      <nve-iframe aria-label="Clipped content iframe" style="--width: 64px; --height: 40px">
        ${head}
        <template><p nve-text="body">•︎•︎•︎</p></template>
      </nve-iframe>
    </div>
  `;
}
