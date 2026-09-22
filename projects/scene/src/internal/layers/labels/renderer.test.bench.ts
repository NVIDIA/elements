// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, test, type BenchRunOptions } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { SceneLabels } from '../../../labels/labels.js';
import '../../../labels/define.js';
import { identityMat4 } from '../../math/mat4.js';
import type { LabelRenderItem } from '../../rendering/render-items.js';
import { LabelBuffer } from './buffer.js';
import { takeLabelLayerRenderData } from './layer-state.js';
import { LabelRenderer } from './renderer.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;
const projection = identityMat4();
const frame = { pixelRatio: 1, viewportHeight: 256, viewportWidth: 256 };
const texts = ['A', 'AB CD', ' \t ', '🤖'];

// The device consumes command arguments without retaining them. These benchmarks
// measure browser CPU preparation and encoding, excluding GPU execution and copying.
describe('label renderer CPU preparation', () => {
  for (const count of [64, 1024]) {
    for (const workload of ['changes visible prefix', 'keeps full prefix', 'edits text']) {
      const batch = workload === 'edits text' ? 512 : 4096;
      test(`${workload} with ${count} labels, batch ${batch}`, async ({ bench }) => {
        let fixture: HTMLElement;
        let renderer: LabelRenderer;
        let items: LabelRenderItem[];
        let iteration = 0;
        const observation = { uploadBytes: 0, vertices: 0 };
        const gpu = createDevice(observation);

        await bench('prepare and encode draw', () => {
          observation.uploadBytes = 0;
          let checksum = 0;
          for (let item = 0; item < batch; item += 1) {
            const next = items[iteration++ % items.length]!;
            renderer.prepare(next, projection, frame);
            observation.vertices = 0;
            renderer.draw(gpu.pass, next);
            checksum += observation.vertices;
          }
          return checksum + observation.uploadBytes;
        }).run({
          ...options,
          async setup() {
            fixture = await createFixture(html`<nve-scene-labels></nve-scene-labels>`);
            const layer = fixture.querySelector<SceneLabels>(SceneLabels.metadata.tag);
            if (!layer) throw new Error('Benchmark label layer is unavailable.');
            layer.source = new LabelBuffer({
              records: Array.from({ length: count }, (_, index) => ({ text: texts[index % texts.length]! }))
            });
            await elementIsStable(layer);
            const initial: LabelRenderItem = {
              data: { ...takeLabelLayerRenderData(layer), uploadRanges: [] },
              frameMatrix: projection,
              interactive: true,
              layer,
              scaleUnit: 'pixel',
              type: 'label'
            };
            renderer = new LabelRenderer(gpu.device);
            renderer.prepare(initial, projection, frame);
            renderer.draw(gpu.pass, initial);
            items = createItems(initial, workload);
          },
          teardown() {
            renderer.disconnect();
            removeFixture(fixture);
          }
        });
      });
    }
  }
});

function createItems(initial: LabelRenderItem, workload: string): LabelRenderItem[] {
  if (workload === 'keeps full prefix') return [initial];
  if (workload === 'changes visible prefix') {
    return [Math.floor(initial.data.count / 2), 0, initial.data.count].map(count => ({
      ...initial,
      data: { ...initial.data, count, hasVisibleText: count > 0 }
    }));
  }
  return ['X', 'Z'].map((text, index) => ({
    ...initial,
    data: {
      ...initial.data,
      texts: [text, ...initial.data.texts.slice(1)],
      textVersion: initial.data.textVersion + index + 1
    }
  }));
}

function createDevice(observation: { uploadBytes: number; vertices: number }) {
  const pass = {
    draw: (vertices: number) => {
      observation.vertices = vertices;
    },
    end: () => undefined,
    setBindGroup: () => undefined,
    setPipeline: () => undefined
  };
  const device = {
    createBindGroup: () => ({}),
    createBuffer: () => ({ destroy: () => undefined }),
    createCommandEncoder: () => ({ beginRenderPass: () => pass, finish: () => ({}) }),
    createRenderPipeline: () => ({ getBindGroupLayout: () => ({}) }),
    createSampler: () => ({}),
    createShaderModule: () => ({}),
    createTexture: () => ({ createView: () => ({}), destroy: () => undefined }),
    destroy: () => undefined,
    lost: new Promise<never>(() => undefined),
    queue: {
      submit: () => undefined,
      writeBuffer: (_buffer, _offset, data) => {
        observation.uploadBytes += data.byteLength;
      },
      writeTexture: () => undefined
    }
  } satisfies ConstructorParameters<typeof LabelRenderer>[0];
  return { device, pass };
}
