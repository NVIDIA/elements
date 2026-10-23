// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('scene gridlines visual runtime', () => {
  test('updates default colors on theme switches and resolves live stylesheet variables', async () => {
    const samples = await visualRunner.inspect('scene-gridlines-theme-switch', themeTemplate(), page =>
      page.evaluate(async () => {
        const scene = document.querySelector<HTMLElement & { ready: Promise<void> }>('nve-scene');
        const grid = scene?.querySelector('nve-scene-gridlines');
        if (!scene || !grid) throw new Error('Expected themed reference grid.');
        await scene.ready;
        const light = await readColors();
        document.documentElement.setAttribute('nve-theme', 'dark');
        const dark = await readColors();
        document.documentElement.setAttribute('nve-theme', '');
        const restored = await readColors();
        // CSSOM edits do not emit DOM mutations. The scene's existing tick must
        // notice the resolved colors changing without an explicit application refresh.
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(
          'nve-scene-gridlines { --color: var(--nve-ref-border-color-emphasis); --alternate-color: currentColor; color: magenta; }'
        );
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
        const stylesheet = await readColors();
        sheet.replaceSync('nve-scene-gridlines { --color: transparent; --alternate-color: blue; }');
        const transparent = await readColors();
        grid.style.setProperty('--color', 'red');
        const inline = await readColors();
        return { light, dark, restored, stylesheet, transparent, inline };

        async function readColors(): Promise<number[][]> {
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const canvas = scene?.shadowRoot?.querySelector('canvas');
          if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Expected themed grid canvas.');
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
          if (!blob) throw new Error('Expected themed grid image.');
          const bitmap = await createImageBitmap(blob);
          const probe = document.createElement('canvas');
          probe.width = bitmap.width;
          probe.height = bitmap.height;
          const context = probe.getContext('2d');
          if (!context) throw new Error('Expected theme probe context.');
          context.drawImage(bitmap, 0, 0);
          bitmap.close();
          return [0.4375, 0.5625].map(y =>
            Array.from(
              context.getImageData(Math.floor(probe.width * 0.5625), Math.floor(probe.height * y), 1, 1).data
            ).slice(0, 3)
          );
        }
      })
    );
    expect(samples.dark[0]).not.toEqual(samples.light[0]);
    expect(samples.dark[1]).not.toEqual(samples.light[1]);
    expect(samples.restored).toEqual(samples.light);
    expect(samples.stylesheet[0]).not.toEqual(samples.light[0]);
    expect(samples.stylesheet[1]).toEqual([255, 0, 255]);
    expect(samples.transparent).toEqual([
      [0, 255, 0],
      [0, 0, 255]
    ]);
    expect(samples.inline).toEqual([
      [255, 0, 0],
      [0, 0, 255]
    ]);
  });

  test('keeps opaque coplanar and front triangles ahead of the positively biased grid', async () => {
    const samples = await visualRunner.inspect('scene-gridlines-depth-bias-t2', depthTemplate(), page =>
      page.evaluate(async () => {
        const scenes = [...document.querySelectorAll('nve-scene')];
        if (scenes.length !== 4 || scenes.some(scene => !(scene instanceof HTMLElement))) {
          throw new Error('Expected four grid depth scenes.');
        }
        await Promise.all(scenes.map(scene => (scene as HTMLElement & { ready: Promise<void> }).ready));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return Promise.all(scenes.map(readScene));

        async function readScene(scene: Element): Promise<{ inside: ColorCounts; outside: ColorCounts }> {
          const canvas = scene.shadowRoot?.querySelector('canvas');
          if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Expected a grid depth canvas.');
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
          if (!blob) throw new Error('Expected a grid depth canvas image.');
          const bitmap = await createImageBitmap(blob);
          const probe = document.createElement('canvas');
          probe.width = bitmap.width;
          probe.height = bitmap.height;
          const context = probe.getContext('2d');
          context?.drawImage(bitmap, 0, 0);
          bitmap.close();
          if (!context) throw new Error('Expected a 2D grid depth probe context.');
          const scale = probe.width / 200;
          return {
            // These are hand-derived pixels for the single vertical grid lines at
            // (-1, 0.25, 0) and (1, 0.25, 0), scaled from the original 200px
            // reference viewport rather than values from production camera helpers.
            inside: countColors(context, Math.round(81 * scale), Math.round(83 * scale)),
            outside: countColors(context, Math.round(125 * scale), Math.round(107 * scale))
          };
        }

        function countColors(context: CanvasRenderingContext2D, centerX: number, centerY: number): ColorCounts {
          let green = 0;
          let magenta = 0;
          for (let y = centerY - 1; y <= centerY + 1; y += 1) {
            for (let x = centerX - 1; x <= centerX + 1; x += 1) {
              const [red = 0, greenChannel = 0, blue = 0] = context.getImageData(x, y, 1, 1).data;
              if (greenChannel > red * 1.5 && greenChannel > blue * 1.5) green += 1;
              if (red > greenChannel * 1.5 && blue > greenChannel * 1.5) magenta += 1;
            }
          }
          return { green, magenta };
        }

        interface ColorCounts {
          readonly green: number;
          readonly magenta: number;
        }
      })
    );

    const [coplanar, front, behind, farFront] = samples;
    if (!coplanar || !front || !behind || !farFront) throw new Error('Expected all four depth samples.');

    // Camera: polar-angle=pi/12, azimuth=-pi/3, orthographic frustum height 8. Its independently
    // derived screen basis is right=(sqrt(3)/2, 1/2, 0),
    // up=(-0.482963, 0.836516, 0.258819).
    // The selected single vertical grid lines map from (81, 83) and (125, 107) in the
    // original 200 CSS px reference viewport. The opaque magenta quad covers only the
    // first point; the second proves the grid remains visible outside its footprint.
    for (const sample of [coplanar, front]) {
      expect(sample.inside.magenta, JSON.stringify(samples)).toBeGreaterThan(4);
      expect(sample.inside.green, JSON.stringify(samples)).toBe(0);
      expect(sample.outside.green).toBeGreaterThan(0);
      expect(sample.outside.magenta).toBe(0);
    }
    expect(behind.inside.green).toBeGreaterThan(0);
    expect(behind.inside.magenta).toBeGreaterThan(0);
    expect(behind.outside.green).toBeGreaterThan(0);
    expect(behind.outside.magenta).toBe(0);
    expect(farFront.inside.magenta).toBeGreaterThan(8);
    // This larger positive-Z control confirms the camera direction independently:
    // geometry translated toward +Z is in front of the reference grid.
    expect(farFront.inside.magenta).toBeGreaterThan(farFront.inside.green * 4);
  });
  test.each(['', 'dark'])(
    'renders finite, transformed, transparent, and filtered squares in the %s theme',
    async theme => {
      const samples = await visualRunner.inspect(
        `scene-checkerboard${theme ? '.dark' : ''}`,
        checkerboardTemplate(theme),
        page =>
          page.evaluate(async () => {
            const scenes = [...document.querySelectorAll<HTMLElement & { ready: Promise<void> }>('nve-scene')];
            await Promise.all(scenes.map(scene => scene.ready));
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            return Promise.all(scenes.map(readScene));

            async function readScene(scene: HTMLElement): Promise<number[][]> {
              const canvas = scene.shadowRoot?.querySelector('canvas');
              if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Expected checkerboard canvas.');
              const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
              if (!blob) throw new Error('Expected checkerboard canvas image.');
              const bitmap = await createImageBitmap(blob);
              const probe = document.createElement('canvas');
              probe.width = bitmap.width;
              probe.height = bitmap.height;
              const context = probe.getContext('2d');
              if (!context) throw new Error('Expected checkerboard probe context.');
              context.drawImage(bitmap, 0, 0);
              bitmap.close();
              // A top-down orthographic camera with height 8 maps these independent
              // world coordinates directly into the square canvas. No scene helpers
              // participate in the expected cell positions or color values.
              return [
                [-0.5, -0.5],
                [0.5, -0.5],
                [0.5, 0.5],
                [3, 0],
                [0, 1],
                [1, 1]
              ].map(([x = 0, y = 0]) =>
                Array.from(
                  context.getImageData(
                    Math.floor(probe.width * (0.5 + x / 8)),
                    Math.floor(probe.height * (0.5 - y / 8)),
                    1,
                    1
                  ).data
                ).slice(0, 3)
              );
            }
          })
      );

      const [finite, transformed, transparent, translucent, minified] = samples;
      if (!finite || !transformed || !transparent || !translucent || !minified)
        throw new Error('Expected all checkerboard samples.');
      expect(finite[0]).toEqual([255, 0, 0]);
      expect(finite[1]).toEqual([0, 0, 255]);
      expect(finite[2]).toEqual([255, 0, 255]); // Coplanar geometry stays ahead of the grid.
      expect(finite[3]).toEqual([0, 255, 0]); // Outside the finite bounds.
      expect(transformed[4]).toEqual([255, 0, 0]);
      expect(transformed[5]).toEqual([0, 0, 255]);
      expect(transparent[0]).toEqual([0, 255, 0]);
      expect(transparent[1]).toEqual([0, 0, 255]);
      expect(translucent[1]).toEqual([0, 255, 0]);
      for (const channel of translucent[0]!.slice(0, 2)) {
        expect(channel).toBeGreaterThan(175);
        expect(channel).toBeLessThan(200);
      }
      expect(translucent[0]![2]).toBe(0);
      for (const channel of minified[0]!) {
        expect(channel).toBeGreaterThan(175);
        expect(channel).toBeLessThan(200);
      }
    }
  );
});

function depthTemplate(): string {
  return /* html */ `
    <nve-scene aria-label="Coplanar grid" style="width: 512px; height: 512px; background: rgb(0 0 0)">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="12" polar-angle="${Math.PI / 12}" azimuth="${-Math.PI / 3}" projection="orthographic" frustum-height="8"></nve-scene-camera>
      <nve-scene-gridlines spacing="0.5" count="4" style="--color: #00ff00"></nve-scene-gridlines>
      <nve-scene-triangles data-height="0"></nve-scene-triangles>
    </nve-scene>
    <nve-scene aria-label="Front grid" style="width: 512px; height: 512px; background: rgb(0 0 0)">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="12" polar-angle="${Math.PI / 12}" azimuth="${-Math.PI / 3}" projection="orthographic" frustum-height="8"></nve-scene-camera>
      <nve-scene-gridlines spacing="0.5" count="4" style="--color: #00ff00"></nve-scene-gridlines>
      <nve-scene-triangles data-height="0.01"></nve-scene-triangles>
    </nve-scene>
    <nve-scene aria-label="Behind grid" style="width: 512px; height: 512px; background: rgb(0 0 0)">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="12" polar-angle="${Math.PI / 12}" azimuth="${-Math.PI / 3}" projection="orthographic" frustum-height="8"></nve-scene-camera>
      <nve-scene-gridlines spacing="0.5" count="4" style="--color: #00ff00"></nve-scene-gridlines>
      <nve-scene-triangles data-height="-0.01"></nve-scene-triangles>
    </nve-scene>
    <nve-scene aria-label="Far-front grid control" style="width: 512px; height: 512px; background: rgb(0 0 0)">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="12" polar-angle="${Math.PI / 12}" azimuth="${-Math.PI / 3}" projection="orthographic" frustum-height="8"></nve-scene-camera>
      <nve-scene-gridlines spacing="0.5" count="4" style="--color: #00ff00"></nve-scene-gridlines>
      <nve-scene-triangles data-height="1"></nve-scene-triangles>
    </nve-scene>
    <script type="module">
      import { define } from '@nvidia-elements/core/internal';
      import { Scene } from '../../src/scene/scene.ts';
      import { SceneCamera } from '../../src/camera/camera.ts';
      import { SceneGridlines } from '../../src/gridlines/gridlines.ts';
      import { SceneTriangles } from '../../src/triangles/triangles.ts';
      import { createTriangleVertexSource } from '../../src/internal/layers/sources/external-record-sources.ts';
      import { TRIANGLE_VERTEX } from '../../src/internal/records/layouts/built-ins.ts';
      import { writeTriangleVertex } from '../../src/internal/records/layouts/codecs.ts';
      define(Scene); define(SceneCamera); define(SceneGridlines); define(SceneTriangles);
      for (const layer of document.querySelectorAll('nve-scene-triangles')) {
        const height = Number(layer.dataset.height);
        const bytes = new Uint8Array(TRIANGLE_VERTEX.stride * 6);
        const color = [1, 0, 1, 1];
        const vertices = [[-2, -2, height], [0, -2, height], [0, 2, height], [-2, -2, height], [0, 2, height], [-2, 2, height]];
        vertices.forEach((position, index) => writeTriangleVertex(bytes, index, { position, color }));
        const source = createTriangleVertexSource({ bytes, count: vertices.length });
        layer.source = source;
      }
    </script>
  `;
}

function themeTemplate(): string {
  return /* html */ `
    <nve-scene aria-label="Theme reference plane" style="width: 512px; height: 512px; background: #00ff00">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="12"
        polar-angle="0" azimuth="${Math.PI / 2}" projection="orthographic" frustum-height="8"></nve-scene-camera>
      <nve-scene-gridlines pattern="checkerboard" count="2"></nve-scene-gridlines>
    </nve-scene>
    <script type="module">
      import { define } from '@nvidia-elements/core/internal';
      import { Scene } from '../../src/scene/scene.ts';
      import { SceneCamera } from '../../src/camera/camera.ts';
      import { SceneGridlines } from '../../src/gridlines/gridlines.ts';
      define(Scene); define(SceneCamera); define(SceneGridlines);
    </script>
  `;
}

function checkerboardTemplate(theme: string): string {
  const grid = (attributes = '') =>
    `<nve-scene-gridlines pattern="checkerboard" count="2" style="--color: red; --alternate-color: blue" ${attributes}></nve-scene-gridlines>`;
  const scene = (label: string, content: string, perspective = false) => `
    <nve-scene aria-label="${label}" style="width: 512px; height: 512px; background: #00ff00">
      <nve-scene-camera behavior="orbit" target="[0,0,0]" heading="0" distance="12"
        polar-angle="${perspective ? Math.PI / 3 : 0}" azimuth="${Math.PI / 2}"
        projection="${perspective ? 'perspective' : 'orthographic'}" frustum-height="8"></nve-scene-camera>
      ${content}
    </nve-scene>`;
  return /* html */ `
    ${scene('Finite checkerboard with coplanar geometry', `${grid()}<nve-scene-triangles></nve-scene-triangles>`)}
    ${scene('Transformed checkerboard', `<nve-scene-frame position="[0.5,0.5,0]" orientation="[0,0,${Math.SQRT1_2},${Math.SQRT1_2}]">${grid()}</nve-scene-frame>`)}
    ${scene('Transparent squares', grid().replace('--color: red', '--color: transparent'))}
    ${scene('Translucent squares', grid().replace('--color: red', '--color: rgb(255 0 0 / 50%)').replace('--alternate-color: blue', '--alternate-color: transparent'))}
    ${scene('Minified squares', grid().replace('count="2"', 'count="2000" spacing="0.001"').replace('--color: red', '--color: black').replace('--alternate-color: blue', '--alternate-color: white'))}
    ${scene('Perspective checkerboard', grid().replace('count="2"', 'count="20"'), true)}
    <script type="module">
      import { define } from '@nvidia-elements/core/internal';
      import { Scene } from '../../src/scene/scene.ts';
      import { SceneCamera } from '../../src/camera/camera.ts';
      import { SceneFrame } from '../../src/frame/frame.ts';
      import { SceneGridlines } from '../../src/gridlines/gridlines.ts';
      import { SceneTriangles } from '../../src/triangles/triangles.ts';
      import { createTriangleVertexSource } from '../../src/internal/layers/sources/external-record-sources.ts';
      import { TRIANGLE_VERTEX } from '../../src/internal/records/layouts/built-ins.ts';
      import { writeTriangleVertex } from '../../src/internal/records/layouts/codecs.ts';
      define(Scene); define(SceneCamera); define(SceneFrame); define(SceneGridlines); define(SceneTriangles);
      document.documentElement.setAttribute('nve-theme', '${theme}');
      const positions = [[0,0,0], [1,0,0], [1,1,0], [0,0,0], [1,1,0], [0,1,0]];
      const bytes = new Uint8Array(TRIANGLE_VERTEX.stride * positions.length);
      positions.forEach((position, index) => writeTriangleVertex(bytes, index, { position, color: [1,0,1,1] }));
      document.querySelector('nve-scene-triangles').source = createTriangleVertexSource({ bytes, count: positions.length });
    </script>
  `;
}
