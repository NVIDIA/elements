// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGpu, createMarkerItem } from '../../../test/rendering.js';
import type { PrimitiveKind } from '../geometry/primitives.js';
import type { MarkerBuffer } from '../layers/markers/buffer.js';
import {
  ArrowBuffer,
  ConeBuffer,
  CubeBuffer,
  CylinderBuffer,
  PyramidBuffer,
  SphereBuffer
} from '../layers/markers/semantic-buffer.js';
import {
  getLayerInstances,
  publishLayerInstances,
  registerMarkerLayer,
  setLayerCount,
  setLayerInstances,
  takeMarkerLayerRenderData
} from '../layers/markers/layer-state.js';
import { PointBuffer } from '../layers/points/buffer.js';
import { LineVertexBuffer } from '../layers/lines/buffer.js';
import type { LineTopology } from '../layers/lines/data.js';
import { TriangleVertexBuffer } from '../layers/triangles/buffer.js';
import {
  getStreamingLayerSource,
  publishStreamingLayer,
  registerStreamingLayer,
  setStreamingLayerCount,
  setStreamingLayerSource,
  takeStreamingLayerRenderData
} from '../layers/streaming/layer-state.js';
import { identityMat4 } from '../math/mat4.js';
import { LINE_VERTEX, MARKER, POINT, TRIANGLE_VERTEX } from '../records/layouts/built-ins.js';
import type { AnyPackedRecordSource, ScenePublishOptions } from '../records/packed-record-source.js';
import { GeometryRenderer, type GeometryDevice } from './geometry-renderer.js';
import type { SceneRenderItem } from './render-items.js';

interface EmptyLayerFixture {
  readonly activeCount: number;
  readonly source: {
    readonly count: number;
    readonly capacity: number;
    add(): unknown;
    setCount(count: number): unknown;
  };
  readonly stride: number;
  getSource(): AnyPackedRecordSource | null;
  limit(count: number): void;
  publish(options?: ScenePublishOptions): void;
  take(): SceneRenderItem;
}

let renderer: GeometryRenderer | undefined;
afterEach(() => {
  renderer?.disconnect();
  renderer = undefined;
});

const cases: ReadonlyArray<readonly [string, () => EmptyLayerFixture]> = [
  ['arrows', () => markerFixture('arrow', new ArrowBuffer({ capacity: 4 }))],
  ['cones', () => markerFixture('cone', new ConeBuffer({ capacity: 4 }))],
  ['cubes', () => markerFixture('cube', new CubeBuffer({ capacity: 4 }))],
  ['cylinders', () => markerFixture('cylinder', new CylinderBuffer({ capacity: 4 }))],
  ['pyramids', () => markerFixture('pyramid', new PyramidBuffer({ capacity: 4 }))],
  ['spheres', () => markerFixture('sphere', new SphereBuffer({ capacity: 4 }))],
  ['points', () => streamFixture('point', new PointBuffer({ capacity: 4 }))],
  ['triangles', () => streamFixture('triangle', new TriangleVertexBuffer({ capacity: 4 }))],
  ['strip lines', () => streamFixture('line', new LineVertexBuffer({ capacity: 4 }), 'strip')],
  ['loop lines', () => streamFixture('line', new LineVertexBuffer({ capacity: 4 }), 'loop')],
  ['segment lines', () => streamFixture('line', new LineVertexBuffer({ capacity: 4 }), 'segments')]
];

describe('empty geometry sources', () => {
  it.each(cases)(
    'renders reserved %s through empty and populated publications beside another layer',
    async (_, create) => {
      const gpu = createGpu();
      renderer = new GeometryRenderer(vi.fn());
      renderer.initialize(document.createElement('canvas'), gpu.device, 'bgra8unorm');
      const fixture = create();
      const empty = fixture.take();
      expect(empty.data).toMatchObject({ count: 0, ready: true });
      expect(empty.data.bytes?.byteLength).toBe(fixture.source.capacity * fixture.stride);
      renderer.prepare([empty], identityMat4());
      expect(gpu.device.createBuffer).not.toHaveBeenCalled();
      expect(gpu.device.queue.writeBuffer).not.toHaveBeenCalled();

      const sibling = createMarkerItem();
      const peer = { ...sibling, data: { ...sibling.data, uploadRanges: [] } };
      const initial = [empty, peer];
      renderer.prepare(initial, identityMat4());
      await vi.waitFor(() => expect(renderer?.readyFor(initial)).toBe(true));
      renderer.prepare(initial, identityMat4());
      renderer.drawItems(gpu.pass, initial, false);
      expect(gpu.pass.drawIndexed).toHaveBeenCalledOnce();

      for (let index = 0; index < fixture.activeCount; index += 1) fixture.source.add();
      fixture.publish();
      const populated = [fixture.take(), peer];
      renderer.prepare(populated, identityMat4());
      const instance = gpu.buffers.filter(buffer => buffer.size === fixture.activeCount * fixture.stride).at(-1);
      expect(instance).toBeDefined();
      gpu.pass.draw.mockClear();
      gpu.pass.drawIndexed.mockClear();
      renderer.drawItems(gpu.pass, populated, false);
      expect(gpu.pass.draw.mock.calls.length + gpu.pass.drawIndexed.mock.calls.length).toBe(2);

      fixture.source.setCount(0);
      fixture.publish({ count: 0 });
      vi.mocked(gpu.device.createBuffer).mockClear();
      vi.mocked(gpu.device.queue.writeBuffer).mockClear();
      gpu.pass.draw.mockClear();
      gpu.pass.drawIndexed.mockClear();
      const shrunk = [fixture.take(), peer];
      renderer.prepare(shrunk, identityMat4());
      renderer.drawItems(gpu.pass, shrunk, false);
      expect(gpu.device.createBuffer).not.toHaveBeenCalled();
      expect(gpu.device.queue.writeBuffer).not.toHaveBeenCalled();
      expect(instance?.destroy).toHaveBeenCalledOnce();
      expect(gpu.pass.draw).not.toHaveBeenCalled();
      expect(gpu.pass.drawIndexed).toHaveBeenCalledOnce();

      fixture.source.setCount(fixture.activeCount);
      fixture.publish({ count: 0, start: fixture.activeCount });
      const regrown = [fixture.take(), peer];
      renderer.prepare(regrown, identityMat4());
      gpu.pass.draw.mockClear();
      gpu.pass.drawIndexed.mockClear();
      renderer.drawItems(gpu.pass, regrown, false);
      expect(gpu.pass.draw.mock.calls.length + gpu.pass.drawIndexed.mock.calls.length).toBe(2);
      expect(regrown[0]?.data).toMatchObject({ count: fixture.activeCount, ready: true });
      expect(fixture.getSource()).toBe(fixture.source);
      expect(
        vi
          .mocked(gpu.device.queue.writeBuffer)
          .mock.calls.some(
            ([, , bytes]) => bytes instanceof Uint8Array && bytes.byteLength === fixture.activeCount * fixture.stride
          )
      ).toBe(true);
      expect(gpu.buffers.every(buffer => buffer.size > 0)).toBe(true);
      renderer.disconnect();
      for (const buffer of gpu.buffers) expect(buffer.destroy).toHaveBeenCalledOnce();
    }
  );

  it.each(['marker', 'point'] as const)(
    'uploads %s edits published while the count limit is zero on regrowth',
    async kind => {
      const gpu = createGpu();
      renderer = new GeometryRenderer(vi.fn());
      renderer.initialize(document.createElement('canvas'), gpu.device, 'bgra8unorm');
      const source = kind === 'marker' ? new CubeBuffer({ capacity: 2 }) : new PointBuffer({ capacity: 2 });
      source.add();
      const fixture = source instanceof CubeBuffer ? markerFixture('cube', source) : streamFixture('point', source);
      const initial = fixture.take();
      renderer.prepare([initial], identityMat4());
      await vi.waitFor(() => expect(renderer?.readyFor([initial])).toBe(true));
      renderer.prepare([initial], identityMat4());

      fixture.limit(0);
      source.at(0).position.x = 0.25;
      fixture.publish();
      renderer.prepare([fixture.take()], identityMat4());
      fixture.limit(1);
      const restored = fixture.take();
      expect(restored.data.uploadRanges).toEqual([]);
      vi.mocked(gpu.device.queue.writeBuffer).mockClear();
      renderer.prepare([restored], identityMat4());
      const upload = vi
        .mocked(gpu.device.queue.writeBuffer)
        .mock.calls.find(([, , bytes]) => bytes instanceof Uint8Array)?.[2];
      if (!upload) throw new Error('Expected a regrown instance upload.');
      expect(new DataView(upload.buffer, upload.byteOffset, upload.byteLength).getFloat32(0, true)).toBe(0.25);
    }
  );

  it.each([
    () => markerFixture('cube', new CubeBuffer({ capacity: 0 })),
    () => streamFixture('point', new PointBuffer({ records: [] })),
    () => streamFixture('line', new LineVertexBuffer({ capacity: 0 }), 'loop'),
    () => streamFixture('triangle', new TriangleVertexBuffer({ capacity: 0 }))
  ])('accepts documented zero-capacity sources without allocating or activating records', create => {
    const gpu = createGpu();
    renderer = new GeometryRenderer(vi.fn());
    renderer.initialize(document.createElement('canvas'), gpu.device, 'bgra8unorm');
    const fixture = create();
    fixture.publish({ count: 0 });
    renderer.prepare([fixture.take()], identityMat4());
    expect(gpu.device.createBuffer).not.toHaveBeenCalled();
    expect(gpu.device.queue.writeBuffer).not.toHaveBeenCalled();
    expect(() => fixture.source.add()).toThrow(RangeError);
    expect(() => fixture.source.setCount(1)).toThrow(RangeError);
  });

  it('releases an empty layer lease without destroying a populated consumer of the same snapshot', async () => {
    const gpu = createGpu();
    renderer = new GeometryRenderer(vi.fn());
    renderer.initialize(document.createElement('canvas'), gpu.device, 'bgra8unorm');
    const source = new CubeBuffer({ capacity: 2, records: [{}] });
    const first = markerFixture('cube', source);
    const second = markerFixture('cube', source);
    const initial = [first.take(), second.take()];
    renderer.prepare(initial, identityMat4());
    await vi.waitFor(() => expect(renderer?.readyFor(initial)).toBe(true));
    renderer.prepare([first.take(), second.take()], identityMat4());
    const instances = gpu.buffers.filter(buffer => buffer.size === MARKER.stride);
    expect(instances).toHaveLength(1);

    source.setCount(0);
    first.publish({ count: 0 });
    const partial = [first.take(), second.take()];
    renderer.prepare(partial, identityMat4());
    renderer.drawItems(gpu.pass, partial, false);
    expect(gpu.pass.drawIndexed).toHaveBeenCalledWith(36, 1);
    expect(instances[0]?.destroy).not.toHaveBeenCalled();
    second.publish({ count: 0 });
    renderer.prepare([first.take(), second.take()], identityMat4());
    expect(instances[0]?.destroy).toHaveBeenCalledOnce();
    renderer.disconnect();
    for (const buffer of gpu.buffers) expect(buffer.destroy).toHaveBeenCalledOnce();
  });

  it.each(['allocation', 'upload'] as const)(
    'propagates real GPU %s failures when an empty source becomes populated',
    operation => {
      const gpu = createGpu();
      renderer = new GeometryRenderer(vi.fn());
      renderer.initialize(document.createElement('canvas'), gpu.device, 'bgra8unorm');
      const fixture = markerFixture('cube', new CubeBuffer({ capacity: 1 }));
      renderer.prepare([fixture.take()], identityMat4());
      const error = new Error('GPU failure');
      const fail = () => {
        throw error;
      };
      if (operation === 'allocation') vi.mocked(gpu.device.createBuffer).mockImplementationOnce(fail);
      else vi.mocked(gpu.device.queue.writeBuffer).mockImplementationOnce(fail);
      fixture.source.add();
      fixture.publish();
      expect(() => renderer?.prepare([fixture.take()], identityMat4())).toThrow(error);
      for (const buffer of gpu.buffers) expect(buffer.destroy).toHaveBeenCalledOnce();
    }
  );

  it('reports asynchronous GPU validation failures after an empty source becomes populated', async () => {
    const gpu = createGpu();
    const error = new Error('GPU validation failure');
    const device: GeometryDevice = { ...gpu.device, popErrorScope: async () => error };
    const onFailure = vi.fn();
    renderer = new GeometryRenderer(vi.fn(), onFailure);
    renderer.initialize(document.createElement('canvas'), device, 'bgra8unorm');
    const fixture = markerFixture('cube', new CubeBuffer({ capacity: 1 }));
    renderer.prepare([fixture.take()], identityMat4());
    expect(onFailure).not.toHaveBeenCalled();
    fixture.source.add();
    fixture.publish();
    const items = [fixture.take()];
    renderer.prepare(items, identityMat4());
    await vi.waitFor(() => expect(onFailure).toHaveBeenCalledWith(error));
    expect(renderer.readyFor(items)).toBe(false);
  });
});

function markerFixture(
  kind: PrimitiveKind,
  source: MarkerBuffer | ArrowBuffer | ConeBuffer | CubeBuffer | CylinderBuffer | PyramidBuffer | SphereBuffer
): EmptyLayerFixture {
  const layer = document.createElement('div');
  registerMarkerLayer(layer, kind);
  setLayerInstances(layer, source);
  return {
    activeCount: 1,
    source,
    stride: MARKER.stride,
    getSource: () => getLayerInstances(layer),
    limit: count => setLayerCount(layer, count),
    publish: options => publishLayerInstances(layer, options),
    take: () => ({
      data: takeMarkerLayerRenderData(layer),
      frameMatrix: identityMat4(),
      interactive: true,
      layer,
      type: 'marker'
    })
  };
}

function streamFixture(
  kind: 'point' | 'line' | 'triangle',
  source: PointBuffer | LineVertexBuffer | TriangleVertexBuffer,
  topology: LineTopology = 'strip'
): EmptyLayerFixture {
  const layer = document.createElement('div');
  const layout = kind === 'point' ? POINT : kind === 'line' ? LINE_VERTEX : TRIANGLE_VERTEX;
  registerStreamingLayer(layer, { kind, layout, topology, countDivisor: kind === 'triangle' ? 3 : undefined });
  setStreamingLayerSource(layer, source);
  return {
    activeCount: kind === 'point' ? 1 : kind === 'triangle' || topology === 'loop' ? 3 : 2,
    source,
    stride: layout.stride,
    getSource: () => getStreamingLayerSource(layer),
    limit: count => setStreamingLayerCount(layer, count),
    publish: options => publishStreamingLayer(layer, options),
    take: () => {
      const common = {
        data: takeStreamingLayerRenderData(layer),
        frameMatrix: identityMat4(),
        interactive: true,
        layer
      };
      if (kind === 'point') return { ...common, size: 1, sizeUnit: 'pixel', type: 'point' };
      if (kind === 'line') return { ...common, topology, type: 'line', widthUnit: 'pixel' };
      return { ...common, type: 'triangle' };
    }
  };
}
