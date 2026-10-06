// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('media pip button visual', () => {
  test('media pip button should match visual baseline', async () => {
    const report = await visualRunner.render('media-pip-button', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('media pip button should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('media-pip-button.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/media/controller/define.js';
      const state = document.createElement('nve-media-controller').mediaState;
      document.getElementById('pip-inactive').mediaState = { ...state, pipAvailable: true };
      document.getElementById('pip-active').mediaState = { ...state, pipAvailable: true, pip: true };
      document.documentElement.setAttribute('nve-theme', '${theme}');
      await import('@nvidia-elements/media/pip-button/define.js');
    </script>
    <div id="pip-inactive"></div>
    <div id="pip-active"></div>
    <div nve-layout="row gap:xs">
      <nve-media-pip-button commandfor="pip-inactive"></nve-media-pip-button>
      <nve-media-pip-button commandfor="pip-active"></nve-media-pip-button>
      <nve-media-pip-button></nve-media-pip-button>
      <nve-media-pip-button commandfor="pip-inactive" disabled></nve-media-pip-button>
    </div>
  `;
}
