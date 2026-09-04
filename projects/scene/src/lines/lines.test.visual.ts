// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('scene lines visual runtime', () => {
  test('renders pixel widths and excludes dash gaps from picking', async () => {
    const pixels = await visualRunner.inspect(
      'scene-rich-lines-layer',
      `<nve-scene aria-label="lines" style="width:512px;height:512px;background:rgb(0 0 0)"><nve-scene-camera behavior="top" target="[0,0,0]" altitude="2" frustum-height="2"></nve-scene-camera><nve-scene-lines id="pixel-lines" topology="segments" width-unit="pixel"></nve-scene-lines></nve-scene><script type="module">
        window.__lineErrors = [];
        const originalError = console.error;
        console.error = (...values) => { window.__lineErrors.push(values.map(String).join(' ')); originalError(...values); };
        import { LineVertexBuffer } from '@nvidia-elements/scene';
        import '@nvidia-elements/scene/camera/define.js';
        import '@nvidia-elements/scene/lines/define.js';

        const vertices = new LineVertexBuffer({ capacity: 4 });
        vertices.add({ position: [-0.8, -0.45, 0], color: [1, 0, 0, 1], width: 2 });
        vertices.add({ position: [0.8, -0.45, 0] });
        vertices.add({ position: [-0.8, 0, 0], color: [1, 0, 0, 1], width: 7, dash: 8, gap: 6 });
        vertices.add({ position: [0.8, 0, 0] });
        document.querySelector('#pixel-lines').source = vertices;

      </script>`,
      page =>
        page.evaluate(async () => {
          const scene = document.querySelector('nve-scene');
          if (!scene) throw new Error('Expected lines scene.');
          await scene.ready;
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const capture = await readCanvas(scene);
          if (!capture) return null;
          const analysis = analyzeLines(capture.data, capture.width, capture.height);
          const selectedRow = analysis.dashedRow;
          if (!selectedRow || selectedRow.runs.length < 2) throw new Error('Expected visible dash runs.');
          const firstRun = selectedRow.runs[0];
          const secondRun = selectedRow.runs[1];
          if (!firstRun || !secondRun) throw new Error('Expected a visible dash gap.');
          const rect = capture.canvas.getBoundingClientRect();
          const pickAt = (x: number, y: number) =>
            scene.pick(
              rect.left + ((x + 0.5) / capture.canvas.width) * rect.width,
              rect.top + ((y + 0.5) / capture.canvas.height) * rect.height
            );
          const visible = await pickAt(Math.floor((firstRun.start + firstRun.end) / 2), selectedRow.y);
          const gap = await pickAt(Math.floor((firstRun.end + secondRun.start) / 2), selectedRow.y);
          return {
            colored: analysis.colored,
            coloredRows: analysis.coloredRows,
            errors: Reflect.get(window, '__lineErrors') as string[],
            gap: gap === null,
            visible:
              visible?.target.kind === 'segment' ? { index: visible.target.index, layer: visible.layer.id } : null
          };

          async function readCanvas(target: Element) {
            const canvas = target.shadowRoot?.querySelector('canvas');
            const blob = await new Promise<Blob | null>(resolve => canvas?.toBlob(resolve));
            if (!blob || !canvas) throw new Error('Expected lines canvas.');
            const bitmap = await createImageBitmap(blob);
            const probe = document.createElement('canvas');
            probe.width = bitmap.width;
            probe.height = bitmap.height;
            const context = probe.getContext('2d');
            context?.drawImage(bitmap, 0, 0);
            bitmap.close();
            if (!context) return undefined;
            return {
              canvas,
              data: context.getImageData(0, 0, probe.width, probe.height).data,
              height: probe.height,
              width: probe.width
            };
          }

          function analyzeLines(data: Uint8ClampedArray, width: number, height: number) {
            let colored = 0;
            let coloredRows = 0;
            let dashedRow: { runs: Array<{ end: number; start: number }>; y: number } | undefined;
            for (let y = 0; y < height; y += 1) {
              const row = scanRow(data, width, y);
              colored += row.colored;
              if (row.colored > 0) coloredRows += 1;
              if (isBetterDashRow({ current: dashedRow, height, runs: row.runs, y })) dashedRow = { runs: row.runs, y };
            }
            return { colored, coloredRows, dashedRow };
          }

          function scanRow(data: Uint8ClampedArray, width: number, y: number) {
            const runs: Array<{ end: number; start: number }> = [];
            let colored = 0;
            let start = -1;
            for (let x = 0; x < width; x += 1) {
              if ((data[(y * width + x) * 4] ?? 0) > 20) {
                colored += 1;
                if (start < 0) start = x;
              } else if (start >= 0) {
                runs.push({ end: x - 1, start });
                start = -1;
              }
            }
            if (start >= 0) runs.push({ end: width - 1, start });
            return { colored, runs };
          }

          function isBetterDashRow(options: {
            readonly current: { runs: Array<{ end: number; start: number }>; y: number } | undefined;
            readonly height: number;
            readonly runs: Array<{ end: number; start: number }>;
            readonly y: number;
          }): boolean {
            const { current, height, runs, y } = options;
            return Math.abs(y - height / 2) <= 1 && runs.length > (current?.runs.length ?? 1);
          }
        })
    );
    expect(pixels?.errors).toEqual([]);
    expect(pixels?.colored).toBeGreaterThan(40);
    expect(pixels?.coloredRows).toBeGreaterThan(6);
    expect(pixels?.visible).toEqual({ index: 1, layer: 'pixel-lines' });
    expect(pixels?.gap).toBe(true);
  });

  test('renders a world-width line from its frame-local normal', async () => {
    const pixels = await visualRunner.inspect(
      'scene-world-lines-layer',
      `<nve-scene aria-label="world line" style="width:512px;height:512px;background:rgb(0 0 0)"><nve-scene-camera behavior="top" target="[0,0,0]" altitude="2" frustum-height="2"></nve-scene-camera><nve-scene-lines id="world-line"></nve-scene-lines></nve-scene><script type="module">
        window.__lineErrors = [];
        const originalError = console.error;
        console.error = (...values) => { window.__lineErrors.push(values.map(String).join(' ')); originalError(...values); };
        import { LineVertexBuffer } from '@nvidia-elements/scene';
        import '@nvidia-elements/scene/camera/define.js';
        import '@nvidia-elements/scene/lines/define.js';
        const vertices = new LineVertexBuffer({ capacity: 2 });
        vertices.add({ position: [-0.8, 0, 0], color: [1, 0, 0, 1], normal: [0, 0, 1], width: 0.12 });
        vertices.add({ position: [0.8, 0, 0] });
        document.querySelector('#world-line').source = vertices;
      </script>`,
      page =>
        page.evaluate(async () => {
          const scene = document.querySelector('nve-scene');
          if (!scene) throw new Error('Expected world line scene.');
          await scene.ready;
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const canvas = scene.shadowRoot?.querySelector('canvas');
          const blob = await new Promise<Blob | null>(resolve => canvas?.toBlob(resolve));
          if (!blob) throw new Error('Expected world line canvas.');
          const bitmap = await createImageBitmap(blob);
          const probe = document.createElement('canvas');
          probe.width = bitmap.width;
          probe.height = bitmap.height;
          const context = probe.getContext('2d');
          context?.drawImage(bitmap, 0, 0);
          bitmap.close();
          const data = context?.getImageData(0, 0, probe.width, probe.height).data ?? [];
          let colored = 0;
          for (let index = 0; index < data.length; index += 4) if ((data[index] ?? 0) > 20) colored += 1;
          return { colored, errors: Reflect.get(window, '__lineErrors') as string[] };
        })
    );
    expect(pixels.errors).toEqual([]);
    expect(pixels.colored).toBeGreaterThan(20);
  });
});
