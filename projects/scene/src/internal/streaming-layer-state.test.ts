// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it } from 'vitest';
import { LINE_VERTEX, POINT, TRIANGLE_VERTEX } from './layouts/built-ins.js';
import { writeLineVertex, writePoint } from './layouts/helpers.js';
import { LineVertexBuffer } from './lines/buffer.js';
import { PointBuffer } from './points/buffer.js';
import { TriangleVertexBuffer } from './triangles/buffer.js';
import { createLineVertexSource, createPointSource, createTriangleVertexSource } from './external-record-sources.js';
import type {
  ExternalLineVertexSource,
  ExternalPointSource,
  ExternalTriangleVertexSource
} from './packed-record-source.js';
import {
  connectStreamingLayer,
  disconnectStreamingLayer,
  getStreamingLayerVersion,
  publishStreamingLayer,
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
    setStreamingLayerSource(layer, asPointSource(source));
    expect(getStreamingLayerVersion(layer)).toBeGreaterThan(0);
    expect(takeStreamingLayerRenderData(layer).uploadRanges).toEqual([{ offset: 0, size: POINT.stride }]);

    const invalidChild = document.createElement('span');
    layer.append(invalidChild);
    await Promise.resolve();
    const changed = new Uint8Array(source);
    changed[0] = 7;
    setStreamingLayerSource(layer, asPointSource(changed));
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
    setStreamingLayerSource(layer, asLineSource(source));

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
    const external = asLineSource(source);
    setStreamingLayerSource(layer, external);

    expect(takeStreamingLayerRenderData(layer)).toMatchObject({ opaque: true, transparent: false });
    setStreamingLineTopology(layer, 'strip');
    expect(takeStreamingLayerRenderData(layer)).toMatchObject({ opaque: true, transparent: true });

    writeLineVertex(source, 1, { position: [1, 0, 0] });
    writeLineVertex(source, 3, { color: [1, 1, 1, 0.5], position: [3, 0, 0] });
    setStreamingLayerSource(layer, external);
    expect(takeStreamingLayerRenderData(layer)).toMatchObject({ opaque: true, transparent: false });
    setStreamingLineTopology(layer, 'loop');
    expect(takeStreamingLayerRenderData(layer)).toMatchObject({ opaque: true, transparent: true });
  });

  it('should render only the published active range of a matching record buffer', () => {
    const layer = document.createElement('div');
    layers.push(layer);
    registerStreamingLayer(layer, { kind: 'point', layout: POINT });
    const points = new PointBuffer({ capacity: 2 });
    points.add({ position: [1, 2, 3] });

    setStreamingLayerSource(layer, points);
    expect(takeStreamingLayerRenderData(layer)).toMatchObject({ capacity: 2, count: 1, ready: true });

    const second = points.add({ position: [4, 5, 6] });
    expect(takeStreamingLayerRenderData(layer).count).toBe(1);
    expect(() => setStreamingLayerCount(layer, 2)).not.toThrow();
    expect(takeStreamingLayerRenderData(layer).count).toBe(1);
    publishStreamingLayer(layer, { count: 1, start: second.index });
    expect(takeStreamingLayerRenderData(layer).count).toBe(2);
  });

  it('should reject record buffers whose layouts do not match the layer', () => {
    const pointLayer = document.createElement('div');
    const lineLayer = document.createElement('div');
    const triangleLayer = document.createElement('div');
    layers.push(pointLayer, lineLayer, triangleLayer);
    registerStreamingLayer(pointLayer, { kind: 'point', layout: POINT });
    registerStreamingLayer(lineLayer, { kind: 'line', layout: LINE_VERTEX });
    registerStreamingLayer(triangleLayer, { countDivisor: 3, kind: 'triangle', layout: TRIANGLE_VERTEX });

    expect(() => setStreamingLayerSource(pointLayer, new LineVertexBuffer({ capacity: 1 }))).toThrow(TypeError);
    expect(() => setStreamingLayerSource(lineLayer, new TriangleVertexBuffer({ capacity: 3 }))).toThrow(TypeError);
    expect(() => setStreamingLayerSource(triangleLayer, new PointBuffer({ capacity: 3 }))).toThrow(TypeError);

    const source = createPointSource({ bytes: new Uint8Array(POINT.stride), count: 0 });
    expect(source).not.toBeNull();
    expect(() => setStreamingLayerSource(lineLayer, source as never)).toThrow(TypeError);
  });

  it('publishes typed-buffer mutations and active counts with one layer operation', () => {
    const layer = document.createElement('div');
    layers.push(layer);
    registerStreamingLayer(layer, { kind: 'point', layout: POINT });
    const points = new PointBuffer({ capacity: 3 });
    const first = points.add({ position: [1, 0, 0] });
    setStreamingLayerSource(layer, points);
    takeStreamingLayerRenderData(layer);

    first.position.x = 4;
    const second = points.add({ position: [2, 0, 0] });
    publishStreamingLayer(layer);
    const published = takeStreamingLayerRenderData(layer);
    expect(published.count).toBe(2);
    expect(published.uploadRanges).toEqual([{ offset: 0, size: POINT.stride * 2 }]);
    expect(new DataView(published.bytes?.buffer ?? new ArrayBuffer(0)).getFloat32(0, true)).toBe(4);

    points.set(0, { position: [5, 0, 0] });
    publishStreamingLayer(layer, { count: 1, start: 0 });
    expect(
      new DataView(takeStreamingLayerRenderData(layer).bytes?.buffer ?? new ArrayBuffer(0)).getFloat32(0, true)
    ).toBe(5);
    writePoint(points.mutableBytes, 1, { position: [6, 0, 0] });
    publishStreamingLayer(layer, { count: 1, start: 1 });
    expect(
      new DataView(takeStreamingLayerRenderData(layer).bytes?.buffer ?? new ArrayBuffer(0)).getFloat32(
        POINT.stride,
        true
      )
    ).toBe(6);

    setStreamingLayerCount(layer, 1);
    points.setCount(0);
    publishStreamingLayer(layer, { count: 0 });
    expect(takeStreamingLayerRenderData(layer).count).toBe(0);
    expect(takeStreamingLayerRenderData(layer).uploadRanges).toEqual([]);

    points.setCount(2);
    second.position.y = 3;
    publishStreamingLayer(layer, { count: 0, start: 2 });
    expect(takeStreamingLayerRenderData(layer).count).toBe(1);
  });

  it('fails closed without throwing when an external source is detached before publication', () => {
    const layer = document.createElement('div');
    layers.push(layer);
    registerStreamingLayer(layer, { kind: 'point', layout: POINT });
    const bytes = new Uint8Array(POINT.stride);
    const source = createPointSource({ bytes, count: 1 });
    setStreamingLayerSource(layer, source);
    structuredClone(bytes.buffer, { transfer: [bytes.buffer] });

    expect(() => publishStreamingLayer(layer)).not.toThrow();
    expect(takeStreamingLayerRenderData(layer)).toMatchObject({ count: 0, ready: false });
  });

  it('preserves external-source count and supports upload-free shrink plus validated regrowth', () => {
    const layer = document.createElement('div');
    layers.push(layer);
    registerStreamingLayer(layer, { kind: 'point', layout: POINT });
    const bytes = new Uint8Array(POINT.stride * 2);
    writePoint(bytes, 0, { position: [1, 0, 0] });
    writePoint(bytes, 1, { position: [2, 0, 0] });
    setStreamingLayerSource(layer, asPointSource(bytes));
    takeStreamingLayerRenderData(layer);

    publishStreamingLayer(layer, { activeCount: 1, count: 0 });
    expect(takeStreamingLayerRenderData(layer)).toMatchObject({ count: 1, uploadRanges: [] });
    publishStreamingLayer(layer, { activeCount: 2, count: 0, start: 2 });
    expect(takeStreamingLayerRenderData(layer)).toMatchObject({
      count: 2,
      uploadRanges: [{ offset: POINT.stride, size: POINT.stride }]
    });

    publishStreamingLayer(layer, { count: 0 });
    expect(takeStreamingLayerRenderData(layer).count).toBe(2);
  });

  it('rejects an invalid triangle active prefix before replacing its committed snapshot', () => {
    const layer = document.createElement('div');
    layers.push(layer);
    registerStreamingLayer(layer, { countDivisor: 3, kind: 'triangle', layout: TRIANGLE_VERTEX });
    const bytes = new Uint8Array(TRIANGLE_VERTEX.stride * 6);
    for (let index = 0; index < 6; index += 1) writePointLikeTriangle(bytes, index);
    setStreamingLayerSource(layer, asTriangleSource(bytes));
    takeStreamingLayerRenderData(layer);

    publishStreamingLayer(layer, { activeCount: 4, count: 0, start: 4 });
    expect(takeStreamingLayerRenderData(layer)).toMatchObject({ count: 0, ready: false, uploadRanges: [] });

    publishStreamingLayer(layer, { activeCount: 3, count: 0, start: 3 });
    expect(takeStreamingLayerRenderData(layer)).toMatchObject({ count: 3, ready: true, uploadRanges: [] });
  });

  it('rejects array-buffer views without an explicit source kind', () => {
    const layer = document.createElement('div');
    layers.push(layer);
    registerStreamingLayer(layer, { kind: 'point', layout: POINT });

    expect(() => setStreamingLayerSource(layer, new Uint8Array(POINT.stride) as never)).toThrow(TypeError);
  });
});

function asPointSource(bytes: Uint8Array): ExternalPointSource {
  const source = createPointSource({ bytes, count: bytes.byteLength / POINT.stride });
  return source;
}

function asLineSource(bytes: Uint8Array): ExternalLineVertexSource {
  const source = createLineVertexSource({ bytes, count: bytes.byteLength / LINE_VERTEX.stride });
  return source;
}

function asTriangleSource(bytes: Uint8Array): ExternalTriangleVertexSource {
  const source = createTriangleVertexSource({ bytes, count: bytes.byteLength / TRIANGLE_VERTEX.stride });
  return source;
}

function writePointLikeTriangle(bytes: Uint8Array, index: number): void {
  const offset = index * TRIANGLE_VERTEX.stride;
  new DataView(bytes.buffer, bytes.byteOffset + offset, TRIANGLE_VERTEX.stride).setFloat32(0, index, true);
  bytes[offset + 15] = 255;
}
