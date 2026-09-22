// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';
import type { Scene } from './scene.js';

interface EmptySourceFixture {
  readonly scene: Scene;
  readonly allocations: readonly number[];
  readonly writes: readonly number[];
  readonly errors: readonly string[];
  readonly validationErrors: readonly string[];
  stable(): boolean;
  populate(publish?: boolean): void;
  empty(): void;
  editWhileLimited(): void;
  restoreLimit(): void;
  recover(): Promise<void>;
  reconnect(): Promise<void>;
  settle(): Promise<void>;
}

declare global {
  interface Window {
    emptySourceFixture: EmptySourceFixture;
  }
}

type SourceCase = 'cubes' | 'points' | 'triangles' | 'strip' | 'loop' | 'segments';

describe('stable empty sources through WebGPU', () => {
  test.each(['cubes', 'points', 'triangles', 'strip', 'loop', 'segments'] as const)(
    'renders %s publications, reconnects, and recovers without replacing the source',
    async kind => {
      const result = await visualRunner.inspect(`scene-empty-${kind}`, emptySourceTemplate(kind), async page => {
        await page.waitForFunction(() => Boolean(window.emptySourceFixture));
        await page.evaluate(async () => {
          await window.emptySourceFixture.scene.ready;
          await window.emptySourceFixture.settle();
        });
        const sample = () =>
          page.evaluate(async () => {
            const fixture = window.emptySourceFixture;
            await fixture.settle();
            const canvas = fixture.scene.shadowRoot?.querySelector('canvas');
            if (!canvas) throw new Error('Expected scene canvas.');
            const rect = canvas.getBoundingClientRect();
            const points = [
              [-2, 0, 0],
              [2, 0, 0]
            ] as const;
            const probes = points.map(position => fixture.scene.getClientPoint(position));
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
            if (!blob) throw new Error('Expected scene canvas pixels.');
            const bitmap = await createImageBitmap(blob);
            const probe = document.createElement('canvas');
            probe.width = bitmap.width;
            probe.height = bitmap.height;
            const context = probe.getContext('2d');
            if (!context) throw new Error('Expected pixel sampling context.');
            context.drawImage(bitmap, 0, 0);
            bitmap.close();
            const pixels = probes.map(point => {
              if (!point) throw new Error('Expected a submitted projection.');
              return [
                ...context.getImageData(
                  Math.floor(((point.clientX - rect.left) * canvas.width) / rect.width),
                  Math.floor(((point.clientY - rect.top) * canvas.height) / rect.height),
                  1,
                  1
                ).data
              ];
            });
            const target = probes[1];
            if (!target) throw new Error('Expected detection projection.');
            const hit = await fixture.scene.pick(target.clientX, target.clientY);
            return { pixels, hit: hit?.layer.id ?? null, stable: fixture.stable() };
          });
        const initial = await sample();
        await page.evaluate(() => window.emptySourceFixture.populate());
        const populated = await sample();
        await page.evaluate(() => window.emptySourceFixture.empty());
        const empty = await sample();
        await page.evaluate(() => window.emptySourceFixture.populate());
        const regrown = await sample();
        let limited;
        let restored;
        if (kind === 'cubes' || kind === 'points') {
          await page.evaluate(() => window.emptySourceFixture.editWhileLimited());
          limited = await sample();
          await page.evaluate(() => window.emptySourceFixture.restoreLimit());
          restored = await sample();
        }
        await page.evaluate(() => window.emptySourceFixture.empty());
        await sample();
        await page.evaluate(async () => {
          window.emptySourceFixture.populate(false);
          await window.emptySourceFixture.recover();
        });
        const recovered = await sample();
        await page.evaluate(() => window.emptySourceFixture.reconnect());
        const reconnected = await sample();
        await page.evaluate(() => window.emptySourceFixture.populate());
        const final = await sample();
        const diagnostics = await page.evaluate(() => ({
          errors: window.emptySourceFixture.errors,
          validationErrors: window.emptySourceFixture.validationErrors,
          zeroAllocations: window.emptySourceFixture.allocations.filter(size => size === 0),
          zeroWrites: window.emptySourceFixture.writes.filter(size => size === 0)
        }));
        return { diagnostics, initial, populated, empty, regrown, limited, restored, recovered, reconnected, final };
      });
      for (const state of [result.initial, result.empty, result.recovered, result.reconnected, result.limited].filter(
        sample => sample !== undefined
      )) {
        expect(state.pixels[0]?.[0]).toBeGreaterThan(50);
        expect(state.pixels[1]).toEqual([0, 0, 0, 255]);
        expect(state.hit).toBeNull();
        expect(state.stable).toBe(true);
      }
      for (const state of [result.populated, result.regrown, result.final]) {
        expect(state.pixels[0]?.[0]).toBeGreaterThan(50);
        expect(state.pixels[1]?.[1]).toBeGreaterThan(50);
        expect(state.hit).toBe('detections');
        expect(state.stable).toBe(true);
      }
      if (result.restored) {
        expect(result.restored.pixels[1]?.[2]).toBeGreaterThan(50);
        expect(result.restored.pixels[1]?.[1]).toBe(0);
        expect(result.restored.hit).toBe('detections');
        expect(result.restored.stable).toBe(true);
      }
      expect(result.diagnostics).toEqual({
        errors: ['device-lost'],
        validationErrors: [],
        zeroAllocations: [],
        zeroWrites: []
      });
    }
  );

  test('submits an empty-only scene without instance allocation, upload, or delayed failure', async () => {
    const result = await visualRunner.inspect('scene-empty-only', emptySourceTemplate('cubes', false), async page => {
      await page.waitForFunction(() => Boolean(window.emptySourceFixture));
      return page.evaluate(async () => {
        const fixture = window.emptySourceFixture;
        await fixture.scene.ready;
        await fixture.settle();
        return {
          allocations: fixture.allocations,
          writes: fixture.writes,
          errors: fixture.errors,
          stable: fixture.stable()
        };
      });
    });
    expect(result).toEqual({ allocations: [], writes: [], errors: [], stable: true });
  });
});

function emptySourceTemplate(kind: SourceCase, sibling = true): string {
  return /* html */ `
    <div id="empty-scene-host"></div>
    <script type="module">
      import { CubeBuffer } from '@nvidia-elements/scene/cubes';
      import { PointBuffer } from '@nvidia-elements/scene/points';
      import { LineVertexBuffer } from '@nvidia-elements/scene/lines';
      import { TriangleVertexBuffer } from '@nvidia-elements/scene/triangles';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/camera/define.js';
      import '@nvidia-elements/scene/cubes/define.js';
      import '@nvidia-elements/scene/points/define.js';
      import '@nvidia-elements/scene/lines/define.js';
      import '@nvidia-elements/scene/triangles/define.js';

      const devices = [], allocations = [], writes = [], errors = [], validationErrors = [];
      const requestDevice = GPUAdapter.prototype.requestDevice;
      GPUAdapter.prototype.requestDevice = async function(...args) {
        const device = await requestDevice.apply(this, args);
        devices.push(device);
        device.addEventListener('uncapturederror', event => validationErrors.push(event.error.message));
        return device;
      };
      const createBuffer = GPUDevice.prototype.createBuffer;
      GPUDevice.prototype.createBuffer = function(descriptor) {
        allocations.push(descriptor.size);
        return createBuffer.call(this, descriptor);
      };
      const writeBuffer = GPUQueue.prototype.writeBuffer;
      GPUQueue.prototype.writeBuffer = function(buffer, offset, data, ...rest) {
        writes.push(data.byteLength);
        return writeBuffer.call(this, buffer, offset, data, ...rest);
      };
      const popErrorScope = GPUDevice.prototype.popErrorScope;
      GPUDevice.prototype.popErrorScope = async function() {
        const error = await popErrorScope.call(this);
        if (error) validationErrors.push(error.message);
        return error;
      };

      const kind = '${kind}';
      const line = ['strip', 'loop', 'segments'].includes(kind);
      const Buffer = kind === 'cubes' ? CubeBuffer : kind === 'points' ? PointBuffer : line ? LineVertexBuffer : TriangleVertexBuffer;
      const source = new Buffer({capacity: 4});
      const layer = document.createElement('nve-scene-' + (line ? 'lines' : kind));
      layer.id = 'detections';
      if (line) { layer.topology = kind; layer.widthUnit = 'pixel'; }
      if (kind === 'points') layer.size = 24;
      layer.source = source;
      const positions = line
        ? (kind === 'loop' ? [[1.5,0,0], [2.5,0,0], [2,0.5,0]] : [[1.5,0,0], [2.5,0,0]])
        : kind === 'triangles' ? [[1.5,-0.5,0], [2.5,-0.5,0], [2,0.5,0]] : [[2,0,0]];
      const scene = document.createElement('nve-scene');
      scene.setAttribute('aria-label', 'Stable empty source regression');
      scene.style.cssText = 'width:256px;height:256px;background:rgb(0 0 0)';
      scene.addEventListener('nve-scene-error', event => errors.push(event.detail.code));
      const camera = document.createElement('nve-scene-camera');
      camera.setAttribute('behavior', 'top');
      camera.setAttribute('target', '[0,0,0]');
      camera.setAttribute('altitude', '10');
      camera.setAttribute('frustum-height', '8');
      scene.append(camera, layer);
      if (${sibling}) {
        const peer = document.createElement('nve-scene-cubes');
        peer.source = new CubeBuffer({records: [{position: [-2,0,0], color: 'red'}]});
        scene.append(peer);
      }
      const host = document.querySelector('#empty-scene-host');
      const populate = (publish = true) => {
        source.setCount(0);
        positions.forEach((position, index) => source.set(index, {position, color: 'lime', width: 12}));
        if (publish) layer.publish({count: 0, start: positions.length});
      };
      const settle = async () => {
        await scene.updateComplete;
        for (let index = 0; index < 4; index += 1) await new Promise(requestAnimationFrame);
        await devices.at(-1)?.queue.onSubmittedWorkDone();
      };
      window.emptySourceFixture = {
        scene, allocations, writes, errors, validationErrors,
        stable: () => layer.source === source,
        populate,
        empty: () => { source.setCount(0); layer.publish({count: 0}); },
        editWhileLimited: () => { layer.countLimit = 0; source.at(0).color = 'blue'; layer.publish(); },
        restoreLimit: () => { layer.countLimit = undefined; },
        settle,
        recover: async () => {
          const device = devices.at(-1);
          device.destroy();
          await device.lost;
          await scene.ready;
          await settle();
        },
        reconnect: async () => {
          scene.remove(); host.append(scene);
          await scene.ready;
          await settle();
        }
      };
      host.append(scene);
    </script>
  `;
}
