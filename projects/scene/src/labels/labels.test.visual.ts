// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('scene labels visual runtime', () => {
  test.each(['', 'dark'] as const)('renders colored labels with the %s theme', async theme => {
    const report = await visualRunner.render(`scene-labels${theme ? '.dark' : ''}`, template(theme));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark'): string {
  return `<script type="module">
    document.documentElement.setAttribute('nve-theme', '${theme}');
    import { LabelBuffer } from '@nvidia-elements/scene';
    import '@nvidia-elements/scene/camera/define.js';
    import '@nvidia-elements/scene/labels/define.js';
    const labels = new LabelBuffer({ capacity: 3 });
    labels.add({ text: 'ORIGIN', position: [0, 0, 0], scale: 36, color: 'white' });
    labels.add({ text: 'LEFT', position: [-1.5, 0, 0], scale: 28, color: 'cyan' });
    labels.add({ text: 'RIGHT', position: [1.5, 0, 0], scale: 28, color: 'magenta' });
    document.querySelector('#labels').source = labels;
  </script>
  <nve-scene aria-label="labels" style="width:512px;height:512px;background:rgb(0 0 0)">
    <nve-scene-camera behavior="top" target="[0,0,0]" altitude="6" frustum-height="6"></nve-scene-camera>
    <nve-scene-labels id="labels"></nve-scene-labels>
  </nve-scene>`;
}
