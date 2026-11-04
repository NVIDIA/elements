// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveSceneFeatureId, takeSceneFeatureIdSnapshot } from '../interaction/feature-ids.js';
import { PointBuffer } from '../layers/points/buffer.js';
import { publishPackedSourceGeneration, resolvePackedSourcePublication } from './packed-source-publication.js';
import { registerSceneRenderNotifications } from '../composition/scene/notifications.js';
import { MarkerBuffer } from '../layers/markers/buffer.js';
import { LabelBuffer } from '../layers/labels/buffer.js';
import { POINT } from './layouts/built-ins.js';
import type { ScenePublishOptions } from './packed-record-source.js';
import {
  publishLayerInstances,
  registerMarkerLayer,
  setLayerInstances,
  takeMarkerLayerRenderData
} from '../layers/markers/layer-state.js';
import {
  publishStreamingLayer,
  registerStreamingLayer,
  setStreamingLayerSource,
  takeStreamingLayerRenderData
} from '../layers/streaming/layer-state.js';
import {
  publishLabelLayer,
  registerLabelLayer,
  setLabelLayerSource,
  takeLabelLayerRenderData
} from '../layers/labels/layer-state.js';

describe('packed source publication', () => {
  afterEach(() => vi.restoreAllMocks());

  it.each(['marker', 'point', 'label'] as const)(
    'publishes only selected %s records and rejects invalid candidates atomically',
    kind => {
      const { source, publish, take } = publicationLayer(kind, 3);
      const stride = source.mutableBytes.byteLength / source.capacity;
      const view = new DataView(source.mutableBytes.buffer);
      take();
      view.setFloat32(0, 10, true);
      view.setFloat32(stride, NaN, true);
      publish({ start: 0, count: 1 });
      const selected = take();
      expect(selected).toMatchObject({ ready: true, count: 3 });
      expect(selected.uploadRanges).toEqual([{ offset: 0, size: stride }]);
      const accepted = selected.bytes?.slice();
      expect(accepted).toBeDefined();
      expect(new DataView(accepted!.buffer).getFloat32(stride, true)).toBe(1);

      view.setFloat32(0, 20, true);
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      publish({ start: 0, count: 2 });
      expect(take()).toMatchObject({ ready: false, count: 0, uploadRanges: [] });
      // An empty publication recovers the accepted snapshot without reading producer edits.
      publish({ count: 0 });
      const recovered = take();
      expect(recovered).toMatchObject({ ready: true, count: 3, uploadRanges: [] });
      expect(recovered.bytes).toEqual(accepted);
    }
  );

  it.each(['marker', 'point', 'label'] as const)(
    'captures newly activated %s records without capturing the gap after a dirty range',
    kind => {
      const { source, publish, take } = publicationLayer(kind, 4, 3);
      const stride = source.mutableBytes.byteLength / source.capacity;
      const view = new DataView(source.mutableBytes.buffer);
      take();
      view.setFloat32(0, 10, true);
      view.setFloat32(stride, NaN, true);
      source.add();
      view.setFloat32(stride * 3, 30, true);
      publish({ start: 0, count: 1 });
      const grown = take();
      expect(grown).toMatchObject({ ready: true, count: 4 });
      expect(grown.uploadRanges).toEqual([
        { offset: 0, size: stride },
        { offset: stride * 3, size: stride }
      ]);
      expect(new DataView(grown.bytes!.buffer).getFloat32(stride, true)).toBe(1);
      expect(new DataView(grown.bytes!.buffer).getFloat32(stride * 3, true)).toBe(30);
      publish({ activeCount: 1, count: 0 });
      expect(take()).toMatchObject({ ready: true, count: 1, uploadRanges: [] });
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      publish({ activeCount: 4, count: 0 });
      expect(take()).toMatchObject({ ready: false, count: 0, uploadRanges: [] });
    }
  );

  it.each(['marker', 'point', 'label'] as const)('keeps %s validation work bounded by the published range', kind => {
    const { source, publish, take } = publicationLayer(kind, 10_000);
    take();
    const reads = vi.spyOn(DataView.prototype, 'getFloat32');
    publish({ count: 0 });
    expect(reads.mock.calls.length).toBe(0);
    source.at(1).position.x = 10;
    reads.mockClear();
    publish({ start: 1, count: 1 });
    expect(reads.mock.calls.length).toBeGreaterThan(0);
    expect(reads.mock.calls.length).toBeLessThan(20);
  });

  it.each(['marker', 'point', 'label'] as const)(
    'requires every retained %s record to be valid before accepting a repair',
    kind => {
      const { source, publish, take, replace } = publicationLayer(kind, 3);
      const stride = source.mutableBytes.byteLength / source.capacity;
      const view = new DataView(source.mutableBytes.buffer);
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      view.setFloat32(stride, NaN, true);
      replace();
      expect(take()).toMatchObject({ ready: false, count: 0 });
      view.setFloat32(stride, 11, true);
      view.setFloat32(0, 10, true);
      publish({ start: 0, count: 1 });
      expect(take()).toMatchObject({ ready: false, count: 0 });
      publish({ start: 1, count: 1 });
      const repaired = take();
      expect(repaired).toMatchObject({ ready: true, count: 3 });
      expect(new DataView(repaired.bytes!.buffer).getFloat32(0, true)).toBe(0);
      expect(new DataView(repaired.bytes!.buffer).getFloat32(stride, true)).toBe(11);
    }
  );

  it.each(['marker', 'point', 'label'] as const)(
    'classifies %s validity transitions and identity-only updates',
    kind => {
      const { source, layer, publish, take } = publicationLayer(kind);
      const scene = document.createElement('nve-scene');
      scene.append(layer);
      const notify = vi.fn();
      const unsubscribe = registerSceneRenderNotifications(scene, notify);
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      try {
        take();
        source.at(0).featureId = 2;
        publish();
        expect(notify).toHaveBeenLastCalledWith(layer, 'identity');
        expect(take().uploadRanges).toEqual([]);
        source.at(0).position.x = 1;
        publish({ count: 1 });
        expect(notify).toHaveBeenLastCalledWith(layer, 'render');
        const accepted = take();

        const bytes = source.mutableBytes;
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        view.setFloat32(0, NaN, true);
        publish();
        expect(notify).toHaveBeenLastCalledWith(layer, 'render');
        expect(take()).toMatchObject({ ready: false, count: 0, uploadRanges: [] });
        publish();
        expect(notify).toHaveBeenLastCalledWith(layer, 'identity');

        view.setFloat32(0, 1, true);
        publish({ count: 0 });
        expect(notify).toHaveBeenLastCalledWith(layer, 'render');
        const recovered = take();
        expect(recovered).toMatchObject({ ready: true, count: 1, uploadRanges: [] });
        expect(recovered.bytes).toEqual(accepted.bytes);
        publish({ count: 0 });
        expect(notify).toHaveBeenLastCalledWith(layer, 'identity');
        expect(notify).toHaveBeenCalledTimes(6);
      } finally {
        unsubscribe();
      }
    }
  );

  it('separates identity-only generations from geometry changes', () => {
    const points = new PointBuffer({ capacity: 1 });
    const point = points.add({ featureId: 1842 });
    const sourceVersion = publishPackedSourceGeneration(points);

    point.featureId = 2710;
    const identity = resolvePackedSourcePublication({
      currentActiveCount: 1,
      currentSourceVersion: sourceVersion,
      requested: undefined,
      source: points,
      unavailableStateMessage: 'Source state is unavailable.'
    });

    expect(identity).toMatchObject({ geometryChanged: false, sourceVersion, visualChanged: false });
    expect(resolveSceneFeatureId(takeSceneFeatureIdSnapshot(points, 1), 0)).toBe(1842);
    expect(publishPackedSourceGeneration(points, identity.sourceVersion)).toBe(sourceVersion);
    expect(resolveSceneFeatureId(takeSceneFeatureIdSnapshot(points, 1), 0)).toBe(2710);

    point.position.x = 1;
    const geometry = resolvePackedSourcePublication({
      currentActiveCount: 1,
      currentSourceVersion: sourceVersion,
      requested: undefined,
      source: points,
      unavailableStateMessage: 'Source state is unavailable.'
    });
    expect(geometry).toMatchObject({ geometryChanged: true, visualChanged: true });
  });

  it('classifies active-count and explicit empty-range publications', () => {
    const points = new PointBuffer({ capacity: 1 });
    points.add();
    const sourceVersion = publishPackedSourceGeneration(points);

    expect(
      resolvePackedSourcePublication({
        currentActiveCount: 0,
        currentSourceVersion: sourceVersion,
        requested: undefined,
        source: points,
        unavailableStateMessage: 'Source state is unavailable.'
      })
    ).toMatchObject({ geometryChanged: false, visualChanged: true });
    expect(
      resolvePackedSourcePublication({
        currentActiveCount: 1,
        currentSourceVersion: sourceVersion,
        requested: { count: 0, start: 1 },
        source: points,
        unavailableStateMessage: 'Source state is unavailable.'
      })
    ).toMatchObject({ geometryChanged: true, visualChanged: false });
    expect(publishPackedSourceGeneration(null)).toBe(-1);
  });
});

function publicationLayer(kind: 'marker' | 'point' | 'label', capacity = 1, count = capacity) {
  const layer = document.createElement('div');
  const records = Array.from({ length: count }, (_, index) => ({
    featureId: index + 1,
    position: [index, 0, 0] as const,
    text: 'label'
  }));
  if (kind === 'marker') {
    const source = new MarkerBuffer({ capacity, records });
    registerMarkerLayer(layer, 'cube');
    setLayerInstances(layer, source);
    return {
      source,
      layer,
      replace: () => setLayerInstances(layer, source),
      publish: (options?: ScenePublishOptions) => publishLayerInstances(layer, options),
      take: () => takeMarkerLayerRenderData(layer)
    };
  }
  if (kind === 'point') {
    const source = new PointBuffer({ capacity, records });
    registerStreamingLayer(layer, { kind: 'point', layout: POINT });
    setStreamingLayerSource(layer, source);
    return {
      source,
      layer,
      replace: () => setStreamingLayerSource(layer, source),
      publish: (options?: ScenePublishOptions) => publishStreamingLayer(layer, options),
      take: () => takeStreamingLayerRenderData(layer)
    };
  }
  const source = new LabelBuffer({ capacity, records });
  registerLabelLayer(layer);
  setLabelLayerSource(layer, source);
  return {
    source,
    layer,
    replace: () => setLabelLayerSource(layer, source),
    publish: (options?: ScenePublishOptions) => publishLabelLayer(layer, options),
    take: () => takeLabelLayerRenderData(layer)
  };
}
