// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('media controller visual', () => {
  test('media controller should match visual baseline', async () => {
    const report = await visualRunner.render('media-controller', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('media controller should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('media-controller.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/media/controller/define.js';
      import '@nvidia-elements/media/pause-button/define.js';
      import '@nvidia-elements/media/fullscreen-button/define.js';
      import '@nvidia-elements/media/time-range/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
    </script>
    <style>
      .media-controls {
        align-items: center;
        box-sizing: border-box;
        display: flex;
        gap: var(--nve-ref-space-xs);
        inline-size: 100%;
        max-inline-size: 100%;
        min-block-size: var(--nve-ref-size-1000);
        min-inline-size: 0;
      }

      .media-controls nve-media-time-range {
        flex: 1 1 auto;
        min-inline-size: var(--nve-ref-size-1000);
      }
    </style>
    <nve-media-controller id="visual-controller" style="inline-size: 320px">
      <video aria-label="recording" style="aspect-ratio: 16 / 9; background: #00140b"></video>
      <span nve-text="label sm" style="padding: var(--nve-ref-space-xs)">recording</span>
      <div class="media-controls" role="toolbar" aria-label="media controls">
        <nve-media-pause-button
          commandfor="visual-controller"
          aria-label="play recording"
          checked
        ></nve-media-pause-button>
        <nve-media-time-range commandfor="visual-controller" aria-label="current time" value="40"></nve-media-time-range>
        <nve-media-fullscreen-button commandfor="visual-controller" aria-label="full screen"></nve-media-fullscreen-button>
      </div>
    </nve-media-controller>
  `;
}
