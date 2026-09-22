// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, test, type BenchRunOptions } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import '../../../cubes/define.js';
import '../../../frame/define.js';
import { setFrameTransform } from '../frame/state.js';
import { SceneContent } from './content.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;
const workloads = [
  { count: 8, depth: 16, shared: true },
  { count: 128, depth: 16, shared: true },
  { count: 128, depth: 1, shared: false },
  { count: 128, depth: 0, shared: true }
];

describe('scene render snapshot compilation', () => {
  for (const { count, depth, shared } of workloads) {
    const batch = count === 8 ? 512 : 128;
    test(`compiles ${count} layers, ${shared ? 'shared' : 'independent'} depth ${depth}, batch ${batch}`, async ({
      bench
    }) => {
      let fixture: HTMLElement;
      let content: SceneContent;
      await bench('compile render items', () => {
        let checksum = 0;
        for (let index = 0; index < batch; index += 1) {
          const items = content.compileRenderItems();
          checksum += items.length + items[items.length - 1]!.frameMatrix[12]!;
        }
        return checksum;
      }).run({
        ...options,
        async setup() {
          fixture = await createFixture(html`<div></div>`);
          const scene = document.createElement('nve-scene');
          fixture.append(scene);
          const parent = shared ? appendFrames(scene, depth) : scene;
          const layers = Array.from({ length: count }, () => {
            const layer = document.createElement('nve-scene-cubes');
            (shared ? parent : appendFrames(scene, depth)).append(layer);
            return layer;
          });
          await Promise.all(layers.map(layer => elementIsStable(layer)));
          content = new SceneContent(scene);
          content.refresh();
          content.compileRenderItems();
        },
        teardown() {
          removeFixture(fixture);
        }
      });
    });
  }
});

function appendFrames(parent: HTMLElement, depth: number): HTMLElement {
  let current = parent;
  for (let index = 0; index < depth; index += 1) {
    const frame = document.createElement('nve-scene-frame');
    current.append(frame);
    setFrameTransform(frame, { position: [index + 1, 0, 0], orientation: [0, 0, 0, 1] });
    current = frame;
  }
  return current;
}
