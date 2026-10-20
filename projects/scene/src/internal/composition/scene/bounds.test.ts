// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { getSceneBounds } from './bounds.js';
import { registerFrameState, setFrameTransform } from '../frame/state.js';
import { MarkerBuffer } from '../../layers/markers/buffer.js';
import {
  publishLayerInstances,
  registerMarkerLayer,
  setLayerInstances,
  takeMarkerLayerRenderData
} from '../../layers/markers/layer-state.js';

function cube(x: number) {
  const layer = document.createElement('nve-scene-cubes');
  registerMarkerLayer(layer, 'cube');
  const source = new MarkerBuffer({ records: [{ position: [x, 0, 0], scale: [2, 4, 6] }] });
  setLayerInstances(layer, source);
  return { layer, source };
}

describe('internal scene bounds selection', () => {
  it('composes ancestor transforms and uses published data without consuming uploads', () => {
    const scene = document.createElement('nve-scene');
    const frame = document.createElement('nve-scene-frame');
    registerFrameState(frame);
    setFrameTransform(frame, { position: [10, 0, 0], orientation: [0, 0, 0, 1] });
    const { layer, source } = cube(2);
    scene.append(frame);
    frame.append(layer);
    const expected = { minimum: [11, -2, -3], maximum: [13, 2, 3] };
    expect(getSceneBounds(scene, { content: [frame, layer, frame] })).toEqual(expected);
    expect(takeMarkerLayerRenderData(layer).uploadRanges.length).toBeGreaterThan(0);
    source.at(0).position.x = 20;
    expect(getSceneBounds(scene, { content: [frame] })).toEqual(expected);
    publishLayerInstances(layer);
    expect(getSceneBounds(scene, { content: [frame] })).toEqual({ minimum: [29, -2, -3], maximum: [31, 2, 3] });
  });

  it('honors hidden and excluded subtrees and ignores nested scene and pending layers', () => {
    const scene = document.createElement('nve-scene');
    const visible = cube(0).layer;
    const hidden = cube(20).layer;
    hidden.hidden = true;
    const nested = document.createElement('nve-scene');
    nested.append(cube(100).layer);
    scene.append(visible, hidden, nested, document.createElement('nve-scene-cubes'));
    expect(getSceneBounds(scene, { content: [scene] })).toEqual({ minimum: [-1, -2, -3], maximum: [1, 2, 3] });
    expect(getSceneBounds(scene, { content: [scene], includeHidden: true })).toEqual({
      minimum: [-1, -2, -3],
      maximum: [21, 2, 3]
    });
    expect(getSceneBounds(scene, { content: [scene], exclude: [visible] })).toBeNull();
    expect(getSceneBounds(scene, { content: [] })).toBeNull();
  });

  it('rejects selections and exclusions owned by another scene', () => {
    const scene = document.createElement('nve-scene');
    const other = document.createElement('nve-scene');
    const layer = cube(0).layer;
    other.append(layer);
    expect(() => getSceneBounds(scene, { content: [layer] })).toThrow(TypeError);
    expect(() => getSceneBounds(scene, { content: [scene], exclude: [other] })).toThrow(TypeError);
  });
});
