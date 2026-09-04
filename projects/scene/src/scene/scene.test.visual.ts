// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('scene visual', () => {
  test('WebGPU software adapter should render a clear frame', async () => {
    const diagnostics = await visualRunner.runWebGPUSmoke('scene.webgpu-smoke');
    const report = JSON.stringify(diagnostics, null, 2);

    expect(diagnostics.error, report).toBeUndefined();
    expect(diagnostics.secureContext, report).toBe(true);
    expect(diagnostics.adapterInfo, report).not.toBeNull();
    expect(diagnostics.software, report).toBe(true);
    expect(diagnostics.workCompleted, report).toBe(true);
    expect(diagnostics.clearFrame, report).toBe(true);
  });

  test.each([1, 2])('scene clears should match computed backgrounds at DPR %i', async deviceScaleFactor => {
    const result = await visualRunner.inspect(
      `scene.bootstrap-dpr-${deviceScaleFactor}`,
      bootstrapTemplate(),
      async page => {
        await page.waitForFunction(() => document.documentElement.dataset.sceneReady === 'true');
        return page.evaluate(async () => {
          const scenes = [...document.querySelectorAll('nve-scene')];
          const canvases = scenes.map(scene => scene.shadowRoot?.querySelector('canvas'));
          const pixels = await Promise.all(canvases.map(canvas => readCanvasPixel(canvas)));
          const diagnostics = document.querySelector('#scene-diagnostics')?.textContent ?? '{}';
          return {
            devicePixelRatio: globalThis.devicePixelRatio,
            canvasSizes: canvases.map(canvas => [canvas?.width, canvas?.height]),
            pixels,
            diagnostics: JSON.parse(diagnostics)
          };

          async function readCanvasPixel(canvas: HTMLCanvasElement | null | undefined): Promise<number[] | null> {
            if (!canvas) {
              return null;
            }
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
            if (!blob) {
              return null;
            }
            const bitmap = await createImageBitmap(blob);
            const probe = document.createElement('canvas');
            probe.width = 1;
            probe.height = 1;
            const context = probe.getContext('2d');
            context?.drawImage(bitmap, 0, 0, 1, 1);
            bitmap.close();
            return context ? [...context.getImageData(0, 0, 1, 1).data] : null;
          }
        });
      },
      { deviceScaleFactor }
    );

    expect(result.devicePixelRatio).toBe(deviceScaleFactor);
    expect(result.canvasSizes).toEqual([
      [512 * deviceScaleFactor, 512 * deviceScaleFactor],
      [512 * deviceScaleFactor, 512 * deviceScaleFactor],
      [512 * deviceScaleFactor, 512 * deviceScaleFactor]
    ]);
    expect(result.pixels).toEqual([
      [255, 0, 0, 255],
      [0, 0, 255, 255],
      [116, 184, 0, 255]
    ]);
    expect(result.diagnostics).toMatchObject({ requestDeviceCount: 1, hasDevice: true });
  });

  test('scene should match visual baseline', async () => {
    const report = await visualRunner.render('scene', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('scene should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('scene.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('projects overlay labels in CSS pixels using the current fixed camera', async () => {
    const result = await visualRunner.inspect('scene-label-overlay-t2', labelOverlayT2Template(), page =>
      page.evaluate(async () => {
        const scene = document.querySelector('nve-scene');
        if (!(scene instanceof HTMLElement)) throw new Error('Expected a scene.');
        await (scene as unknown as { ready: Promise<void> }).ready;
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const overlay = scene.shadowRoot?.querySelector('.overlay');
        const slot = overlay?.querySelector('slot');
        const label = document.querySelector('nve-scene-label');
        const content = document.querySelector('#label-content');
        if (
          !(slot instanceof HTMLSlotElement) ||
          !(label instanceof HTMLElement) ||
          !(content instanceof HTMLElement)
        ) {
          throw new Error('Expected assigned overlay label content.');
        }
        return {
          assigned: slot.assignedElements().map(element => element.localName),
          content: content.getBoundingClientRect().toJSON(),
          scene: scene.getBoundingClientRect().toJSON(),
          slot: slot.getBoundingClientRect().toJSON(),
          transform: slot.style.transform
        };
      })
    );

    expect(result.assigned).toEqual(['nve-scene-label']);
    expect(result.transform).toBe('translate(176px, 211px)');
    expect(result.slot.x - result.scene.x).toBeCloseTo(176, 3);
    expect(result.slot.y - result.scene.y).toBeCloseTo(211, 3);
    expect(result.content.width).toBeCloseTo(160, 3);
    expect(result.content.height).toBeCloseTo(80, 3);
  });

  test('renders textured vertex-colored transparent mesh instances through two deforming states', async () => {
    const result = await visualRunner.inspect('scene-mesh-t2', meshT2Template(), page =>
      page.evaluate(async () => {
        const scene = document.querySelector('nve-scene');
        const mesh = document.querySelector('nve-scene-mesh');
        if (!(scene instanceof HTMLElement) || !(mesh instanceof HTMLElement))
          throw new Error('Expected a mesh scene.');
        await (scene as unknown as { ready: Promise<void> }).ready;
        const sample = async () => {
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const canvas = scene.shadowRoot?.querySelector('canvas');
          const blob = await new Promise<Blob | null>(resolve => canvas?.toBlob(resolve));
          if (!blob) return null;
          const bitmap = await createImageBitmap(blob);
          const probe = document.createElement('canvas');
          probe.width = bitmap.width;
          probe.height = bitmap.height;
          probe.getContext('2d')?.drawImage(bitmap, 0, 0);
          bitmap.close();
          return [...(probe.getContext('2d')?.getImageData(0, 0, probe.width, probe.height).data ?? [])];
        };
        const initial = await sample();
        (globalThis as typeof globalThis & { deformMesh(state: number): void }).deformMesh(1);
        const first = await sample();
        (globalThis as typeof globalThis & { deformMesh(state: number): void }).deformMesh(2);
        const second = await sample();
        const state = (globalThis as typeof globalThis & { getMeshState(): unknown }).getMeshState();
        return {
          first,
          initial,
          second,
          state,
          tints: countTintPixels(second)
        };

        function countTintPixels(pixels: number[] | null): { blue: number; green: number; red: number } {
          const tints = { blue: 0, green: 0, red: 0 };
          if (!pixels) return tints;
          for (let index = 0; index < pixels.length; index += 4) {
            const tint = tintForPixel(pixels[index] ?? 0, pixels[index + 1] ?? 0, pixels[index + 2] ?? 0);
            if (tint) tints[tint] += 1;
          }
          return tints;
        }

        function tintForPixel(red: number, green: number, blue: number): 'blue' | 'green' | 'red' | undefined {
          if (red > green * 1.15 && red > blue * 1.15) return 'red';
          if (green > red * 1.15 && green > blue * 1.15) return 'green';
          if (blue > red * 1.15 && blue > green * 1.15) return 'blue';
          return undefined;
        }
      })
    );
    expect(result.state).toEqual({ ready: true, transparent: true });
    expect(result.initial).not.toEqual(result.first);
    expect(result.first).not.toEqual(result.second);
    expect(result.second?.some((value, index) => index % 4 !== 3 && value > 0)).toBe(true);
    expect(result.tints).toEqual({ red: expect.any(Number), green: expect.any(Number), blue: expect.any(Number) });
    expect(result.tints.red).toBeGreaterThan(0);
    expect(result.tints.green).toBeGreaterThan(0);
    expect(result.tints.blue).toBeGreaterThan(0);
  });

  test('scene should upload streamed changes made while a layer is hidden when it becomes visible', async () => {
    const pixel = await visualRunner.inspect('scene-hidden-stream-upload', hiddenStreamTemplate(), page =>
      page.evaluate(async () => {
        const scene = document.querySelector('nve-scene');
        const layer = document.querySelector('nve-scene-points');
        if (!(scene instanceof HTMLElement) || !(layer instanceof HTMLElement)) {
          throw new Error('Expected a scene and points layer.');
        }
        await (scene as unknown as { ready: Promise<void> }).ready;
        layer.hidden = true;
        (globalThis as typeof globalThis & { updateHiddenPoint(): void }).updateHiddenPoint();
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        layer.hidden = false;
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const canvas = scene.shadowRoot?.querySelector('canvas');
        const blob = await new Promise<Blob | null>(resolve => canvas?.toBlob(resolve));
        if (!blob) {
          throw new Error('Expected a scene canvas image.');
        }
        const bitmap = await createImageBitmap(blob);
        const probe = document.createElement('canvas');
        probe.width = bitmap.width;
        probe.height = bitmap.height;
        const context = probe.getContext('2d');
        context?.drawImage(bitmap, 0, 0);
        bitmap.close();
        return context ? [...context.getImageData(probe.width / 2, probe.height / 2, 1, 1).data] : null;
      })
    );
    expect(pixel?.[2]).toBeGreaterThan(pixel?.[0] ?? 255);
  });

  test('picks deterministic cube and mesh instances through the real WebGPU ID/depth pass', async () => {
    const result = await visualRunner.inspect('scene-picking-t2', pickingT2Template(), page =>
      page.evaluate(async () => {
        const scene = document.querySelector('nve-scene');
        const canvas = scene?.shadowRoot?.querySelector('canvas');
        const cube = document.querySelector('#cube');
        const mesh = document.querySelector('#mesh');
        if (
          !(scene instanceof HTMLElement) ||
          !(canvas instanceof HTMLCanvasElement) ||
          !(cube instanceof HTMLElement) ||
          !(mesh instanceof HTMLElement)
        ) {
          throw new Error('Expected the picking fixture scene, canvas, cube, and mesh.');
        }
        await (scene as unknown as { ready: Promise<void> }).ready;
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const rect = canvas.getBoundingClientRect();
        const pick = (x: number, y: number) =>
          (scene as unknown as { pick(clientX: number, clientY: number): Promise<unknown> }).pick(
            rect.left + x,
            rect.top + y
          );
        const summarize = (hit: unknown) => {
          if (hit === null) return null;
          const candidate = hit as {
            element: HTMLElement;
            instanceIndex: number;
            layer: HTMLElement;
            worldPosition: number[];
          };
          return {
            elementId: candidate.element.id,
            instanceIndex: candidate.instanceIndex,
            layerId: candidate.layer.id,
            worldPosition: candidate.worldPosition
          };
        };
        const scale = rect.width / 200;
        const cubeHit = summarize(await pick(60.5 * scale, 99.5 * scale));
        const pixels = await readPixels(canvas, [
          [Math.round(60 * scale), Math.round(99 * scale)],
          [Math.round(140 * scale), Math.round(99 * scale)],
          [Math.round(100 * scale), Math.round(20 * scale)]
        ]);
        const ancestor = document.querySelector('#ancestor');
        if (!(ancestor instanceof HTMLElement)) throw new Error('Expected the scene ancestor.');
        let ancestorClicks = 0;
        let resolveAncestorClick!: () => void;
        const ancestorClick = new Promise<void>(resolve => (resolveAncestorClick = resolve));
        ancestor.addEventListener('click', () => {
          ancestorClicks += 1;
          resolveAncestorClick();
        });
        canvas.dispatchEvent(
          new PointerEvent('click', {
            bubbles: true,
            clientX: rect.left + 60.5 * scale,
            clientY: rect.top + 99.5 * scale,
            composed: true
          })
        );
        await ancestorClick;
        return {
          cube: cubeHit,
          mesh: summarize(await pick(140.5 * scale, 99.5 * scale)),
          outside: await (scene as unknown as { pick(clientX: number, clientY: number): Promise<unknown> }).pick(
            rect.left - 1,
            rect.top - 1
          ),
          miss: await pick(100 * scale, 20 * scale),
          pixels,
          validationErrors: (
            globalThis as typeof globalThis & { getPickingValidationErrors(): string[] }
          ).getPickingValidationErrors(),
          ancestorClicks,
          elementIds: { cube: 'cube-marker', mesh: 'mesh-marker' }
        };

        async function readPixels(source: HTMLCanvasElement, probes: readonly (readonly [number, number])[]) {
          const blob = await new Promise<Blob | null>(resolve => source.toBlob(resolve));
          if (!blob) return null;
          const bitmap = await createImageBitmap(blob);
          const probe = document.createElement('canvas');
          probe.width = bitmap.width;
          probe.height = bitmap.height;
          const context = probe.getContext('2d');
          context?.drawImage(bitmap, 0, 0);
          bitmap.close();
          return probes.map(([x, y]) => (context ? [...context.getImageData(x, y, 1, 1).data] : null));
        }
      })
    );

    expect(result.outside).toBeNull();
    expect(result.miss).toBeNull();
    expect(result.validationErrors).toEqual([]);
    expect(result.ancestorClicks).toBe(1);
    const report = JSON.stringify(result);
    expect(result.cube, report).toMatchObject({
      elementId: result.elementIds.cube,
      instanceIndex: 0,
      layerId: 'cube'
    });
    expect(result.mesh, report).toMatchObject({
      elementId: result.elementIds.mesh,
      instanceIndex: 0,
      layerId: 'mesh'
    });
    expectWorldPosition((result.cube as { worldPosition: number[] }).worldPosition, [-2.083, 0.5374, -0.5]);
    expectWorldPosition((result.mesh as { worldPosition: number[] }).worldPosition, [2.014, 0.0354, 0]);
  });

  test('tracks host-updated follow frames and declarative orbit pose updates', async () => {
    const result = await visualRunner.inspect('scene-camera-t2', cameraT2Template(), page =>
      page.evaluate(async () => {
        const scene = document.querySelector('nve-scene');
        if (!(scene instanceof HTMLElement)) throw new Error('Expected camera test scene.');
        await (scene as unknown as { ready: Promise<void> }).ready;
        const sample = async () => {
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const canvas = scene.shadowRoot?.querySelector('canvas');
          if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Expected scene canvas.');
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
          if (!blob) throw new Error('Expected canvas pixels.');
          const bitmap = await createImageBitmap(blob);
          const probe = document.createElement('canvas');
          probe.width = bitmap.width;
          probe.height = bitmap.height;
          probe.getContext('2d')?.drawImage(bitmap, 0, 0);
          bitmap.close();
          return [...(probe.getContext('2d')?.getImageData(0, 0, probe.width, probe.height).data ?? [])];
        };
        const initial = await sample();
        (globalThis as typeof globalThis & { updateFollow(): void }).updateFollow();
        const follow = await sample();
        const start = await sample();
        const orbit = scene.querySelector('nve-scene-camera[behavior="orbit"]');
        if (!(orbit instanceof HTMLElement)) throw new Error('Expected orbit camera behavior.');
        const startDistance = (orbit as HTMLElement & { distance: number }).distance;
        orbit.setAttribute('distance', '24');
        const end = await sample();
        const endDistance = (orbit as HTMLElement & { distance: number }).distance;
        return { end, endDistance, follow, initial, start, startDistance };
      })
    );
    expect(result.follow).not.toEqual(result.initial);
    expect(result.end).not.toEqual(result.start);
    expect(result.startDistance).toBe(12);
    expect(result.endDistance).toBe(24);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/scene/scene/define.js';
    import '@nvidia-elements/scene/camera/define.js';
    import '@nvidia-elements/scene/cubes/define.js';
    import '@nvidia-elements/scene/marker/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <nve-scene aria-label="Scene" style="width: 512px; height: 512px; background: rgb(16 20 26)">
    <nve-scene-camera behavior="orbit" target="[0,0,0]" distance="12" phi="0.9" theta="-0.75" projection="ortho" frustum-height="8"></nve-scene-camera>
    <nve-scene-cubes><nve-scene-marker position="[0,0,0]" scale="[3,3,3]" color="rgb(118 185 0)"></nve-scene-marker></nve-scene-cubes>
  </nve-scene>
  `;
}

function bootstrapTemplate(): string {
  return /* html */ `
    <script type="module">
      import { Scene } from '../../src/scene/scene.ts';
      import { getSceneTestingSnapshot } from '../../src/internal/testing.ts';

      customElements.define(Scene.metadata.tag, Scene);
      const scenes = [...document.querySelectorAll(Scene.metadata.tag)];
      Promise.all(scenes.map(scene => scene.ready)).then(() => {
        document.querySelector('#scene-diagnostics').textContent = JSON.stringify(getSceneTestingSnapshot());
        document.documentElement.dataset.sceneReady = 'true';
      });
    </script>
    <nve-scene id="red" aria-label="Red scene" style="width: 512px; height: 512px; background: rgb(255, 0, 0)"></nve-scene>
    <nve-scene id="blue" aria-label="Blue scene" style="width: 512px; height: 512px; background: rgb(0, 0, 255)"></nve-scene>
    <nve-scene id="green" aria-label="Green scene" style="width: 512px; height: 512px; background: rgb(116, 184, 0)"></nve-scene>
    <output id="scene-diagnostics" hidden></output>
  `;
}

function labelOverlayT2Template(): string {
  return /* html */ `
    <style>#label-content { display:block; width:160px; height:80px; padding:16px; box-sizing:border-box; background:rgb(255 0 0); color:white; font-size:32px; font-weight:700; }</style>
    <nve-scene aria-label="Overlay label" style="width:512px;height:512px;background:rgb(0 0 0)">
      <nve-scene-camera behavior="top" height="20"></nve-scene-camera>
      <nve-scene-label position="[0,0,0]" anchor="center" offset="[0,-5]"><span id="label-content">L</span></nve-scene-label>
    </nve-scene>
    <script type="module">
      import { define } from '@nvidia-elements/core/internal';
      import { Scene } from '../../src/scene/scene.ts';
      import { SceneCamera } from '../../src/camera/camera.ts';
      import { SceneLabel } from '../../src/label/label.ts';
      define(Scene); define(SceneCamera); define(SceneLabel);
    </script>
  `;
}

function hiddenStreamTemplate(): string {
  return /* html */ `
    <nve-scene aria-label="Hidden stream upload" style="width: 512px; height: 512px; background: rgb(0 0 0)">
      <nve-scene-points id="hidden-point" size="128"></nve-scene-points>
    </nve-scene>
    <script type="module">
      import { PointBuffer } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/points/define.js';
      const points = new PointBuffer({ capacity: 1 });
      const point = points.add({ position: [0, 0, 0], color: [1, 0, 0, 1] });
      const layer = document.querySelector('#hidden-point');
      layer.instances = points;
      globalThis.updateHiddenPoint = () => {
        point.color = [0, 0, 1, 1];
        layer.commit();
      };
    </script>
  `;
}

function meshT2Template(): string {
  return /* html */ `
    <nve-scene aria-label="Textured deforming mesh" style="width: 512px; height: 512px; background: rgb(0 0 0)">
      <nve-scene-camera behavior="top" target="[0,0,0]" height="11"></nve-scene-camera>
      <nve-scene-mesh id="mesh" color="rgb(255 255 255)">
        <nve-scene-marker position="[0,-1,0]" color="rgb(255 255 255)"></nve-scene-marker>
        <nve-scene-marker position="[0,0,0]" color="rgb(255 120 120)"></nve-scene-marker>
        <nve-scene-marker position="[0,1,0]" color="rgb(120 180 255)"></nve-scene-marker>
      </nve-scene-mesh>
    </nve-scene>
    <script type="module">
      import { define } from '@nvidia-elements/core/internal';
      import { SceneCamera } from '../../src/camera/camera.ts';
      import { Scene } from '../../src/scene/scene.ts';
      import { SceneMarker } from '../../src/marker/marker.ts';
      import { SceneMesh } from '../../src/mesh/mesh.ts';
      import { takeMeshLayerRenderData } from '../../src/internal/mesh/layer-state.ts';
      define(Scene);
      define(SceneCamera);
      define(SceneMarker);
      define(SceneMesh);
      const mesh = document.querySelector('#mesh');
      globalThis.getMeshState = () => {
        const { ready, transparent } = takeMeshLayerRenderData(mesh);
        return { ready, transparent };
      };
      const create = positions => {
        mesh.positions = new Float32Array(positions);
        mesh.normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);
        mesh.uvs = new Float32Array([0, 0, 0.5, 1, 1, 0]);
        mesh.colors = new Float32Array([1, 0.2, 0.2, 0.65, 0.2, 0.2, 1, 0.65, 0.2, 1, 0.2, 0.65]);
      };
      const source = document.createElement('canvas');
      source.width = 2; source.height = 2;
      const context = source.getContext('2d');
      context.fillStyle = 'rgb(255 220 40)'; context.fillRect(0, 0, 1, 2);
      context.fillStyle = 'rgb(40 220 255)'; context.fillRect(1, 0, 1, 2);
      mesh.texture = await createImageBitmap(source);
      create([-2, -1.5, 0, 2, -1.5, 0, 0, 2, 0]);
      globalThis.deformMesh = state => create(state === 1 ? [-2, -1.5, 0, 2, -1.5, 0, 0, 3, 0] : [-2, -1.5, 0, 2, -1.5, 0, 0, 4, 0]);
    </script>
  `;
}

function pickingT2Template(): string {
  return /* html */ `
    <div id="ancestor">
      <nve-scene aria-label="Picking scene" style="width: 512px; height: 512px; background: rgb(0 0 0)">
        <nve-scene-cubes id="cube">
          <nve-scene-marker id="cube-marker" position="[-2.083,0.5374,-1]" scale="[2,2,1]" color="rgb(255 0 0)"></nve-scene-marker>
        </nve-scene-cubes>
        <nve-scene-mesh id="mesh" color="rgb(0 255 0)">
          <nve-scene-marker id="mesh-marker" position="[2.014,0.0354,0]" scale="[2,2,1]" color="rgb(255 255 255)"></nve-scene-marker>
        </nve-scene-mesh>
      </nve-scene>
    </div>
    <script type="module">
      const validationErrors = [];
      const consoleError = console.error;
      console.error = (...values) => {
        validationErrors.push(values.map(value => String(value)).join(' '));
        consoleError(...values);
      };
      globalThis.getPickingValidationErrors = () => [...validationErrors];
      import { define } from '@nvidia-elements/core/internal';
      import { Scene } from '../../src/scene/scene.ts';
      import { SceneCubes } from '../../src/cubes/cubes.ts';
      import { SceneMarker } from '../../src/marker/marker.ts';
      import { SceneMesh } from '../../src/mesh/mesh.ts';
      define(Scene);
      define(SceneMarker);
      define(SceneCubes);
      define(SceneMesh);
      const mesh = document.querySelector('#mesh');
      mesh.positions = new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0, 0.5, 0]);
      mesh.normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);
    </script>
  `;
}

function cameraT2Template(): string {
  return /* html */ `
    <nve-scene aria-label="Camera animation" style="width: 512px; height: 512px; background: rgb(0 0 0)">
      <nve-scene-camera behavior="follow" frame="robot"></nve-scene-camera>
      <nve-scene-camera behavior="orbit" distance="12"></nve-scene-camera>
      <nve-scene-frame id="robot" name="robot"><nve-scene-cubes><nve-scene-marker scale="[2,2,2]" color="rgb(0 255 0)"></nve-scene-marker></nve-scene-cubes></nve-scene-frame>
      <nve-scene-cubes><nve-scene-marker position="[6,0,0]" scale="[2,2,2]" color="rgb(255 0 0)"></nve-scene-marker></nve-scene-cubes>
    </nve-scene>
    <script type="module">
      import { define } from '@nvidia-elements/core/internal';
      import { Scene } from '../../src/scene/scene.ts';
      import { SceneCamera } from '../../src/camera/camera.ts';
      import { SceneFrame } from '../../src/frame/frame.ts';
      import { SceneCubes } from '../../src/cubes/cubes.ts';
      import { SceneMarker } from '../../src/marker/marker.ts';
      define(Scene); define(SceneCamera); define(SceneFrame); define(SceneCubes); define(SceneMarker);
      const robot = document.querySelector('#robot');
      robot.setTransform({ position: [-2, 0, 0], orientation: [0, 0, 0, 1] });
      globalThis.updateFollow = () => {
        robot.setTransform({ position: [2, 0, 0], orientation: [0, 0, 0, 1] });
      };
    </script>
  `;
}

function expectWorldPosition(actual: number[], expected: readonly [number, number, number]): void {
  expect(actual).toHaveLength(3);
  actual.forEach((coordinate, index) => expect(coordinate).toBeCloseTo(expected[index] ?? Number.NaN, 1));
}
