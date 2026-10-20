// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';
import type { Scene } from '../scene/scene.js';
import type { SceneBody } from './body.js';

describe('scene body STL visual runtime', () => {
  test('renders a loaded STL mesh part inside a frame, matches mesh pixels, picks it, and applies tint', async () => {
    const result = await visualRunner.inspect('scene-body-src', assetTemplate(), page =>
      page.evaluate(async () => {
        const scene = document.querySelector<Scene>('#asset-scene');
        const reference = document.querySelector<Scene>('#reference-scene');
        const body = document.querySelector<SceneBody>('#asset-body');
        if (!scene || !reference || !body) throw new Error('Expected imported and reference scenes.');
        const waitForFrames = () =>
          new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        const pixels = async (host: HTMLElement) => {
          const canvas = host.shadowRoot?.querySelector('canvas');
          if (!canvas) throw new Error('Expected a scene canvas.');
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
          if (!blob) throw new Error('Expected a canvas image.');
          const bitmap = await createImageBitmap(blob);
          const probe = document.createElement('canvas');
          probe.width = bitmap.width;
          probe.height = bitmap.height;
          const context = probe.getContext('2d');
          if (!context) throw new Error('Expected a pixel probe.');
          context.drawImage(bitmap, 0, 0);
          bitmap.close();
          return [...context.getImageData(0, 0, probe.width, probe.height).data];
        };
        await Promise.all([body.loadComplete, scene.ready, reference.ready]);
        await waitForFrames();
        const imported = await pixels(scene);
        const expected = await pixels(reference);
        const canvas = scene.shadowRoot?.querySelector('canvas');
        if (!canvas) throw new Error('Expected imported scene canvas.');
        const rect = canvas.getBoundingClientRect();
        const hit = await scene.pick(rect.left + rect.width / 2, rect.top + rect.height / 2);
        body.tint = '#ff0000';
        await waitForFrames();
        const tinted = await pixels(scene);
        return {
          matches: imported.every((value, index) => value === expected[index]),
          colored: imported.filter((value, index) => index % 4 !== 3 && value > 20).length,
          changes: imported.filter((value, index) => value !== tinted[index]).length,
          layer: hit?.layer.id,
          featureId: hit?.featureId
        };
      })
    );
    expect(result.matches).toBe(true);
    expect(result.colored).toBeGreaterThan(100);
    expect(result.changes).toBeGreaterThan(100);
    expect(result.layer).toBe('asset-body');
    expect(result.featureId).toBe(7);
  });
});

function assetTemplate(): string {
  const stl =
    'solid triangle\nfacet normal 0 0 1\nouter loop\nvertex -1 -1 0\nvertex 1 -1 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid triangle\n';
  const camera =
    '<nve-scene-camera behavior="orbit" target="[1,0,0]" distance="5" polar-angle="0" azimuth="0" projection="orthographic" frustum-height="4"></nve-scene-camera>';
  return /* html */ `
    <nve-scene id="asset-scene" style="width:256px;height:256px;background:black">
      ${camera}
      <nve-scene-frame name="arm" position="[1,0,0]"><nve-scene-body id="asset-body" tint="#76b900" feature-id="7"><nve-scene-mesh src="/triangle.stl"></nve-scene-mesh></nve-scene-body></nve-scene-frame>
    </nve-scene>
    <nve-scene id="reference-scene" style="width:256px;height:256px;background:black">
      ${camera}
      <nve-scene-frame name="arm" position="[1,0,0]"><nve-scene-mesh id="reference-mesh" color="#76b900"></nve-scene-mesh></nve-scene-frame>
    </nve-scene>
    <script>
      const originalFetch = globalThis.fetch;
      globalThis.fetch = (url, options) => new URL(url, document.baseURI).pathname === '/triangle.stl'
        ? Promise.resolve(new Response(${JSON.stringify(stl)})) : originalFetch(url, options);
    </script>
    <script type="module">
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/frame/define.js';
      import '@nvidia-elements/scene/body/define.js';
      import '@nvidia-elements/scene/mesh/define.js';
      document.querySelector('#reference-mesh').geometry = { positions: new Float32Array([-1,-1,0,1,-1,0,0,1,0]) };
    </script>
  `;
}
