// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test } from 'vitest';
import { MarkerBuffer } from '../layers/markers/buffer.js';
import { PointBuffer } from '../layers/points/buffer.js';
import { LabelBuffer } from '../layers/labels/buffer.js';
import { POINT } from './layouts/built-ins.js';
import type { ScenePublishOptions } from './packed-record-source.js';
import { publishLayerInstances, registerMarkerLayer, setLayerInstances } from '../layers/markers/layer-state.js';
import {
  publishStreamingLayer,
  registerStreamingLayer,
  setStreamingLayerSource
} from '../layers/streaming/layer-state.js';
import { publishLabelLayer, registerLabelLayer, setLabelLayerSource } from '../layers/labels/layer-state.js';

const BATCH_SIZE = 1_024;
const partial: ScenePublishOptions = { start: 0, count: 1 };
const runOptions = { throws: true, time: 500, warmupTime: 250, iterations: 10 };
type LayerKind = 'marker' | 'point' | 'label';

describe('packed layer publication', () => {
  for (const kind of ['marker', 'point', 'label'] as const) {
    for (const count of [1, 1_000]) {
      for (const change of ['identity', 'position'] as const) {
        test(`${kind} ${change}: ${BATCH_SIZE} publications over ${count} records`, async ({ bench }) => {
          const { source, publish } = publicationLayer(kind, count);
          const record = source.at(0);
          let value = 0;
          await bench('publishes changed records', () => {
            for (let index = 0; index < BATCH_SIZE; index++) {
              value = 1 - value;
              if (change === 'identity') record.featureId = value;
              else record.position.x = value;
              publish(change === 'identity' ? undefined : partial);
            }
          }).run(runOptions);
        });
      }
    }
  }
});

function publicationLayer(kind: LayerKind, count: number) {
  const layer = document.createElement('div');
  if (kind === 'marker') {
    const source = new MarkerBuffer({ capacity: count });
    source.setCount(count);
    source.at(0).featureId = 0;
    registerMarkerLayer(layer, 'cube');
    setLayerInstances(layer, source);
    return { source, publish: (options?: ScenePublishOptions) => publishLayerInstances(layer, options) };
  }
  if (kind === 'point') {
    const source = new PointBuffer({ capacity: count });
    source.setCount(count);
    source.at(0).featureId = 0;
    registerStreamingLayer(layer, { kind: 'point', layout: POINT });
    setStreamingLayerSource(layer, source);
    return { source, publish: (options?: ScenePublishOptions) => publishStreamingLayer(layer, options) };
  }
  const source = new LabelBuffer({ capacity: count });
  source.setCount(count);
  source.at(0).featureId = 0;
  registerLabelLayer(layer);
  setLabelLayerSource(layer, source);
  return { source, publish: (options?: ScenePublishOptions) => publishLabelLayer(layer, options) };
}
