// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('scene visual', () => {
  test('scene should match visual baseline', async () => {
    const report = await visualRunner.render('scene', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('scene should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('scene.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/scene/scene/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <nve-scene></nve-scene>
  `;
}
