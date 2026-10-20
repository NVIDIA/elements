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

function publicationLayer(kind: 'marker' | 'point' | 'label') {
  const layer = document.createElement('div');
  if (kind === 'marker') {
    const source = new MarkerBuffer({ records: [{ featureId: 1 }] });
    registerMarkerLayer(layer, 'cube');
    setLayerInstances(layer, source);
    return {
      source,
      layer,
      publish: (options?: ScenePublishOptions) => publishLayerInstances(layer, options),
      take: () => takeMarkerLayerRenderData(layer)
    };
  }
  if (kind === 'point') {
    const source = new PointBuffer({ records: [{ featureId: 1 }] });
    registerStreamingLayer(layer, { kind: 'point', layout: POINT });
    setStreamingLayerSource(layer, source);
    return {
      source,
      layer,
      publish: (options?: ScenePublishOptions) => publishStreamingLayer(layer, options),
      take: () => takeStreamingLayerRenderData(layer)
    };
  }
  const source = new LabelBuffer({ records: [{ featureId: 1, text: 'label' }] });
  registerLabelLayer(layer);
  setLabelLayerSource(layer, source);
  return {
    source,
    layer,
    publish: (options?: ScenePublishOptions) => publishLabelLayer(layer, options),
    take: () => takeLabelLayerRenderData(layer)
  };
}
