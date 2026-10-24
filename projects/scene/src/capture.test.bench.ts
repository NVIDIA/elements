// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, test, type BenchRunOptions } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { SceneMesh } from './mesh/mesh.js';
import type { SceneHeightfield } from './heightfield/heightfield.js';
import './mesh/define.js';
import './heightfield/define.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;

describe('owned geometry capture', () => {
  for (const count of [1, 128, 65_536]) {
    const geometry = { positions: new Float32Array(count * 9), normals: new Float32Array(count * 9) };
    const batch = count < 1000 ? 64 : 1;
    test(`captures ${count} mesh triangles, batch ${batch}`, async ({ bench }) => {
      let fixture: HTMLElement;
      let mesh: SceneMesh;
      await bench('capture and settle', async () => {
        for (let index = 0; index < batch; index += 1) {
          mesh.geometry = geometry;
          if (count >= 1000) await mesh.loadComplete;
        }
        await elementIsStable(mesh);
        return mesh.geometry?.positions.length;
      }).run({
        ...options,
        async setup() {
          fixture = await createFixture(html`<nve-scene-mesh></nve-scene-mesh>`);
          mesh = fixture.querySelector<SceneMesh>('nve-scene-mesh')!;
          await elementIsStable(mesh);
        },
        teardown() {
          removeFixture(fixture);
        }
      });
    });
  }

  for (const size of [2, 32, 256]) {
    const grid = {
      rows: size,
      columns: size,
      spacing: 1,
      heights: new Float32Array(size * size),
      colors: new Uint8Array(size * size * 4).fill(255)
    };
    const batch = size < 256 ? 64 : 1;
    test(`captures ${size}x${size} heightfield, batch ${batch}`, async ({ bench }) => {
      let fixture: HTMLElement;
      let terrain: SceneHeightfield;
      await bench('capture and settle', async () => {
        for (let index = 0; index < batch; index += 1) {
          terrain.grid = grid;
          if (size >= 256) await terrain.loadComplete;
        }
        await elementIsStable(terrain);
        return terrain.heightAt(0, 0);
      }).run({
        ...options,
        async setup() {
          fixture = await createFixture(html`<nve-scene-heightfield></nve-scene-heightfield>`);
          terrain = fixture.querySelector<SceneHeightfield>('nve-scene-heightfield')!;
          await elementIsStable(terrain);
        },
        teardown() {
          removeFixture(fixture);
        }
      });
    });
  }
});
