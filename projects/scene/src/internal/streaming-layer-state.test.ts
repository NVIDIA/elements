// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it } from 'vitest';
import { LINE_VERTEX, POINT } from './layouts/built-ins.js';
import { writeLineVertex } from './layouts/helpers.js';
import {
  connectStreamingLayer,
  disconnectStreamingLayer,
  getStreamingLayerVersion,
  registerStreamingLayer,
  setStreamingLineTopology,
  setStreamingLayerSource,
  takeStreamingLayerRenderData
} from './streaming-layer-state.js';

describe('streaming layer state', () => {
  const layers: HTMLElement[] = [];

  afterEach(() => {
    for (const layer of layers) {
      disconnectStreamingLayer(layer);
      layer.remove();
    }
    layers.length = 0;
  });

  it('retains upload ranges while a child error is active and drains them after recovery', async () => {
    const layer = document.createElement('div');
    layers.push(layer);
    registerStreamingLayer(layer, { allowChildren: false, kind: 'point', layout: POINT });
    connectStreamingLayer(layer);

    const source = new Uint8Array(POINT.stride);
    setStreamingLayerSource(layer, source);
    expect(getStreamingLayerVersion(layer)).toBeGreaterThan(0);
    expect(takeStreamingLayerRenderData(layer).uploadRanges).toEqual([{ offset: 0, size: POINT.stride }]);

    const invalidChild = document.createElement('span');
    layer.append(invalidChild);
    await Promise.resolve();
    const changed = new Uint8Array(source);
    changed[0] = 7;
    setStreamingLayerSource(layer, changed);
    expect(takeStreamingLayerRenderData(layer)).toMatchObject({ ready: false, uploadRanges: [] });

    invalidChild.remove();
    await Promise.resolve();
    const recovered = takeStreamingLayerRenderData(layer);
    expect(recovered.ready).toBe(true);
    expect(recovered.uploadRanges).toEqual([{ offset: 0, size: POINT.stride }]);
    expect(recovered.bytes?.[0]).toBe(7);
  });

  it('uses the default child policy and rejects access to unregistered layers', () => {
    const layer = document.createElement('div');
    layers.push(layer);
    registerStreamingLayer(layer, { kind: 'line', layout: POINT });
    connectStreamingLayer(layer);
    expect(() => takeStreamingLayerRenderData(layer)).not.toThrow();
    const other = document.createElement('div');
    expect(() => takeStreamingLayerRenderData(other)).toThrow(TypeError);
    expect(() => disconnectStreamingLayer(other)).toThrow(TypeError);
  });

  it('should default to unbiased pickable strips and retain internal reference options', () => {
    const defaults = document.createElement('div');
    const segments = document.createElement('div');
    layers.push(defaults, segments);
    registerStreamingLayer(defaults, { kind: 'line', layout: POINT });
    registerStreamingLayer(segments, {
      depthBias: true,
      kind: 'line',
      layout: POINT,
      pickable: false,
      topology: 'segments'
    });

    expect(takeStreamingLayerRenderData(defaults)).toMatchObject({
      depthBias: false,
      pickable: true,
      topology: 'strip',
      widthUnit: 'world'
    });
    expect(takeStreamingLayerRenderData(segments)).toMatchObject({
      depthBias: true,
      pickable: false,
      topology: 'segments'
    });
  });

  it('should retain line uploads while topology makes the record count invalid, then recover', () => {
    const layer = document.createElement('div');
    layers.push(layer);
    registerStreamingLayer(layer, { kind: 'line', layout: LINE_VERTEX, topology: 'loop' });
    const source = new Uint8Array(2 * LINE_VERTEX.stride);
    writeLineVertex(source, 0, { position: [0, 0, 0] });
    writeLineVertex(source, 1, { position: [1, 0, 0] });
    setStreamingLayerSource(layer, source);

    expect(takeStreamingLayerRenderData(layer)).toMatchObject({ count: 0, ready: false, uploadRanges: [] });
    setStreamingLineTopology(layer, 'strip');
    expect(takeStreamingLayerRenderData(layer)).toMatchObject({
      count: 2,
      ready: true,
      uploadRanges: [{ offset: 0, size: 2 * LINE_VERTEX.stride }]
    });
  });
});
