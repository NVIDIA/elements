// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, test, type BenchRunOptions } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import '../../../cubes/define.js';
import '../../../frame/define.js';
import { invalidateFrameTransform, setFrameReference, setFrameTransform } from '../frame/state.js';
import { SceneContent } from './content.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;
interface SnapshotWorkload {
  readonly count: number;
  readonly depth: number;
  readonly shared: boolean;
  readonly referenced?: boolean;
}

const workloads: readonly SnapshotWorkload[] = [
  { count: 8, depth: 16, shared: true },
  { count: 128, depth: 16, shared: true },
  { count: 128, depth: 1, shared: false },
  { count: 128, depth: 0, shared: true },
  { count: 128, depth: 16, shared: true, referenced: true },
  { count: 512, depth: 64, shared: true, referenced: true }
];

describe('scene render snapshot compilation', () => {
  for (const workload of workloads) {
    const { count, depth, shared, referenced } = workload;
    const batch = referenced ? 4096 / count : count === 8 ? 512 : 128;
    const path = `${referenced ? 'referenced' : shared ? 'shared' : 'independent'} depth ${depth}`;
    test(`compiles ${count} layers, ${path}, batch ${batch}`, async ({ bench }) => {
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
          ({ fixture, content } = await createContentFixture(workload));
          content.compileRenderItems();
        },
        teardown() {
          removeFixture(fixture);
        }
      });
    });

    if (!referenced) continue;
    test(`checks ${count} invalid interactive layers, ${path}, batch ${batch}`, async ({ bench }) => {
      let fixture: HTMLElement;
      let content: SceneContent;
      await bench('check interactive targets', () => {
        let checksum = 0;
        for (let index = 0; index < batch; index += 1) checksum += Number(content.hasInteractiveTargets());
        return checksum;
      }).run({
        ...options,
        async setup() {
          ({ fixture, content } = await createContentFixture(workload));
          // An invalid shared ancestor forces every interactive layer to check its chain.
          invalidateFrameTransform(fixture.querySelector('nve-scene-frame')!);
          if (content.hasInteractiveTargets()) throw new Error('The invalid chain must suppress interaction.');
        },
        teardown() {
          removeFixture(fixture);
        }
      });
    });
  }
});

async function createContentFixture({ count, depth, shared, referenced }: SnapshotWorkload) {
  const fixture = await createFixture(html`<div></div>`);
  const scene = document.createElement('nve-scene');
  fixture.append(scene);
  const parent = shared ? appendFrames(scene, depth) : scene;
  if (referenced) parent.setAttribute('name', 'shared');
  const layers = Array.from({ length: count }, () => {
    const layer = document.createElement('nve-scene-cubes');
    (referenced ? scene : shared ? parent : appendFrames(scene, depth)).append(layer);
    if (referenced) {
      setFrameReference(layer, 'shared');
      layer.interactive = true;
    }
    return layer;
  });
  await Promise.all(layers.map(layer => elementIsStable(layer)));
  const content = new SceneContent(scene);
  content.refresh();
  if (referenced) content.resolveFrames();
  return { fixture, content };
}

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
