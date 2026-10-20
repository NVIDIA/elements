// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';
import type { Scene } from '../scene/scene.js';
import type { SceneJoint } from '../joint/joint.js';

describe('model rendering', () => {
  test('matches nested pixels and hides unresolved or hidden chains while unrelated bodies render', async () => {
    const camera = '<nve-scene-camera behavior="top" altitude="8" frustum-height="8"></nve-scene-camera>';
    const body =
      '<nve-scene-body id="attached" frame="tip"><nve-scene-shape type="cube" color="#76b900"></nve-scene-shape></nve-scene-body>';
    const fixed =
      '<nve-scene-body><nve-scene-shape type="cube" position="[-2,0,0]" color="#ff0000"></nve-scene-shape></nve-scene-body>';
    const result = await visualRunner.inspect(
      'scene-model-entity',
      `
      <nve-scene id="nested" aria-label="Nested" style="width:256px;height:256px;background:black">
        ${camera}${fixed}
        <nve-scene-frame position="[1,0,0]"><nve-scene-frame position="[0,1,0]">${body.replace(' frame="tip"', '')}</nve-scene-frame></nve-scene-frame>
      </nve-scene>
      <nve-scene id="referenced" aria-label="Referenced" style="width:256px;height:256px;background:black">
        ${camera}<nve-scene-model name="arm">${fixed}${body.replace(' frame="tip"', ' name="tip"')}
        <nve-scene-joint id="drive" name="drive" parent="base" child="tip" type="prismatic" axis="[0,1,0]" value="1"></nve-scene-joint>
        <nve-scene-frame position="[1,0,0]"><nve-scene-body id="base" name="base"></nve-scene-body></nve-scene-frame></nve-scene-model>
      </nve-scene>
      <script type="module">
        import '@nvidia-elements/scene/model/define.js';
        import '@nvidia-elements/scene/joint/define.js';
        import '@nvidia-elements/scene/frame/define.js';
        import '@nvidia-elements/scene/body/define.js';
        import '@nvidia-elements/scene/camera/define.js';
      </script>`,
      page =>
        page.evaluate(async () => {
          const nested = document.querySelector<Scene>('#nested')!;
          const referenced = document.querySelector<Scene>('#referenced')!;
          const drive = referenced.querySelector<SceneJoint>('#drive')!;
          const base = referenced.querySelector<HTMLElement>('#base')!;
          const wait = () =>
            new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
          const pixels = async (scene: Scene) => {
            const canvas = scene.shadowRoot!.querySelector('canvas')!;
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
            if (!blob) throw new Error('Expected Scene image.');
            const bitmap = await createImageBitmap(blob);
            const probe = document.createElement('canvas');
            probe.width = bitmap.width;
            probe.height = bitmap.height;
            const context = probe.getContext('2d')!;
            context.drawImage(bitmap, 0, 0);
            bitmap.close();
            return [...context.getImageData(0, 0, probe.width, probe.height).data];
          };
          const count = (data: number[], channel: number) =>
            data.filter(
              (value, index) =>
                index % 4 === channel && value > 30 && value > (data[index + (channel === 0 ? 1 : -1)] ?? 0) * 1.2
            ).length;
          await Promise.all([nested.ready, referenced.ready]);
          await wait();
          const expected = await pixels(nested);
          const actual = await pixels(referenced);
          base.hidden = true;
          await wait();
          const hidden = await pixels(referenced);
          base.hidden = false;
          drive.parent = 'missing';
          await wait();
          const unresolved = await pixels(referenced);
          drive.parent = 'base';
          await wait();
          const recovered = await pixels(referenced);
          return {
            equal: actual.every((value, index) => value === expected[index]),
            green: count(actual, 1),
            hiddenGreen: count(hidden, 1),
            unresolvedGreen: count(unresolved, 1),
            red: count(actual, 0),
            hiddenRed: count(hidden, 0),
            unresolvedRed: count(unresolved, 0),
            recovered: recovered.every((value, index) => value === actual[index])
          };
        })
    );
    expect(result.equal).toBe(true);
    expect(result.green).toBeGreaterThan(0);
    expect(result.hiddenGreen).toBe(0);
    expect(result.unresolvedGreen).toBe(0);
    expect(result.hiddenRed).toBe(result.red);
    expect(result.unresolvedRed).toBe(result.red);
    expect(result.recovered).toBe(true);
  });
});
