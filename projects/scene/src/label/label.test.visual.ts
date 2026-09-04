// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('scene label visual contract', () => {
  test('should retain the label child while Scene projects its overlay', async () => {
    const result = await visualRunner.inspect(
      'scene-label-overlay',
      `<style>nve-scene-label > span { display:block; width:256px; height:128px; padding:32px; box-sizing:border-box; background:rgb(118 185 0); color:black; font-size:32px; }</style><nve-scene aria-label="Robot visualization" style="width:512px;height:512px;background:rgb(20 24 30)"><nve-scene-camera behavior="top" target="[1,2,3]" height="20"></nve-scene-camera><nve-scene-label anchor="top-left" offset="[-128,-64]" position="[1,2,3]"><span>Robot base</span></nve-scene-label></nve-scene><script type="module">import '@nvidia-elements/scene/camera/define.js'; import '@nvidia-elements/scene/label/define.js';</script>`,
      page => page.locator('nve-scene-label > span').textContent()
    );

    expect(result).toBe('Robot base');
  });
});
