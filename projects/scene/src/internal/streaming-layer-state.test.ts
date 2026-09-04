// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it } from 'vitest';
import { LINE_VERTEX, POINT, TRI_VERTEX } from './layouts/built-ins.js';
import { writeLineVertex } from './layouts/helpers.js';
import { LineVertexBuffer } from './lines/buffer.js';
import { PointBuffer } from './points/buffer.js';
import { TriangleVertexBuffer } from './triangles/buffer.js';
import {
  connectStreamingLayer,
  commitStreamingLayer,
  disconnectStreamingLayer,
  getStreamingLayerVersion,
  registerStreamingLayer,
  setStreamingLayerCount,
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

  it('should classify cached line transparency according to the active topology', () => {
    const layer = document.createElement('div');
    layers.push(layer);
    registerStreamingLayer(layer, { kind: 'line', layout: LINE_VERTEX, topology: 'segments' });
    const source = new Uint8Array(4 * LINE_VERTEX.stride);
    writeLineVertex(source, 0, { position: [0, 0, 0] });
    writeLineVertex(source, 1, { color: [1, 1, 1, 0.5], position: [1, 0, 0] });
    writeLineVertex(source, 2, { position: [2, 0, 0] });
    writeLineVertex(source, 3, { position: [3, 0, 0] });
    setStreamingLayerSource(layer, source);

    expect(takeStreamingLayerRenderData(layer)).toMatchObject({ opaque: true, transparent: false });
    setStreamingLineTopology(layer, 'strip');
    expect(takeStreamingLayerRenderData(layer)).toMatchObject({ opaque: true, transparent: true });

    writeLineVertex(source, 1, { position: [1, 0, 0] });
    writeLineVertex(source, 3, { color: [1, 1, 1, 0.5], position: [3, 0, 0] });
    setStreamingLayerSource(layer, source);
    expect(takeStreamingLayerRenderData(layer)).toMatchObject({ opaque: true, transparent: false });
    setStreamingLineTopology(layer, 'loop');
    expect(takeStreamingLayerRenderData(layer)).toMatchObject({ opaque: true, transparent: true });
  });

  it('should render only the committed active range of a matching record buffer', () => {
    const layer = document.createElement('div');
    layers.push(layer);
    registerStreamingLayer(layer, { kind: 'point', layout: POINT });
    const points = new PointBuffer({ capacity: 2 });
    points.add({ position: [1, 2, 3] });

    setStreamingLayerSource(layer, points);
    expect(takeStreamingLayerRenderData(layer)).toMatchObject({ capacity: 2, count: 1, ready: true });

    const second = points.add({ position: [4, 5, 6] });
    expect(takeStreamingLayerRenderData(layer).count).toBe(1);
    expect(() => setStreamingLayerCount(layer, 2)).toThrow(RangeError);
    commitStreamingLayer(layer, second.index, 1);
    expect(takeStreamingLayerRenderData(layer).count).toBe(2);
    expect(() => setStreamingLayerCount(layer, 2)).not.toThrow();
  });

  it('should reject record buffers whose layouts do not match the layer', () => {
    const pointLayer = document.createElement('div');
    const lineLayer = document.createElement('div');
    const triangleLayer = document.createElement('div');
    layers.push(pointLayer, lineLayer, triangleLayer);
    registerStreamingLayer(pointLayer, { kind: 'point', layout: POINT });
    registerStreamingLayer(lineLayer, { kind: 'line', layout: LINE_VERTEX });
    registerStreamingLayer(triangleLayer, { countDivisor: 3, kind: 'triangle', layout: TRI_VERTEX });

    expect(() => setStreamingLayerSource(pointLayer, new LineVertexBuffer({ capacity: 1 }))).toThrow(TypeError);
    expect(() => setStreamingLayerSource(lineLayer, new TriangleVertexBuffer({ capacity: 3 }))).toThrow(TypeError);
    expect(() => setStreamingLayerSource(triangleLayer, new PointBuffer({ capacity: 3 }))).toThrow(TypeError);
  });
});
