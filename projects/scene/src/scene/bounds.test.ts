// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { Scene } from './scene.js';
import { SceneFrame } from '../frame/frame.js';
import { CubeBuffer, SceneCubes } from '../cubes/cubes.js';
import { ArrowBuffer, SceneArrows } from '../arrows/arrows.js';
import { SceneCones, ConeBuffer } from '../cones/cones.js';
import { SceneCylinders, CylinderBuffer } from '../cylinders/cylinders.js';
import { ScenePyramids, PyramidBuffer } from '../pyramids/pyramids.js';
import { SceneSpheres, SphereBuffer } from '../spheres/spheres.js';
import { ScenePoints } from '../points/points.js';
import { SceneLines } from '../lines/lines.js';
import { SceneTriangles } from '../triangles/triangles.js';
import { SceneLabels } from '../labels/labels.js';
import { SceneMesh } from '../mesh/mesh.js';
import { SceneModel } from '../model/model.js';
import { ScenePolygon } from '../polygon/polygon.js';
import { SceneHeightfield } from '../heightfield/heightfield.js';
import { getMarkerLayerRenderData, takeMarkerLayerRenderData } from '../internal/layers/markers/layer-state.js';
import { takeStreamingLayerRenderData } from '../internal/layers/streaming/layer-state.js';
import { takeLabelLayerRenderData } from '../internal/layers/labels/layer-state.js';
import { takeMeshLayerRenderData } from '../internal/layers/mesh/layer-state.js';
import { createPointSource } from '../internal/layers/sources/external-record-sources.js';
import { writePoint } from '../internal/records/layouts/codecs.js';
import { POINT } from '../internal/records/layouts/built-ins.js';
import { PointBuffer } from '../internal/layers/points/buffer.js';
import { LineVertexBuffer } from '../internal/layers/lines/buffer.js';
import { TriangleVertexBuffer } from '../internal/layers/triangles/buffer.js';
import { LabelBuffer } from '../internal/layers/labels/buffer.js';
import { MarkerBuffer } from '../internal/layers/markers/buffer.js';
import './define.js';
import '../frame/define.js';
import '../cubes/define.js';
import '../arrows/define.js';
import '../cones/define.js';
import '../cylinders/define.js';
import '../pyramids/define.js';
import '../spheres/define.js';
import '../points/define.js';
import '../lines/define.js';
import '../triangles/define.js';
import '../labels/define.js';
import '../mesh/define.js';
import '../model/define.js';
import '../polygon/define.js';
import '../heightfield/define.js';

describe('published scene bounds', () => {
  it('accepts documented zero-capacity sources without inventing geometry', () => {
    const scene = new Scene();
    const cubes = new SceneCubes();
    const points = new ScenePoints();
    const lines = new SceneLines();
    const triangles = new SceneTriangles();
    const labels = new SceneLabels();
    cubes.source = new CubeBuffer({ capacity: 0 });
    points.source = new PointBuffer({ records: [] });
    lines.source = new LineVertexBuffer({ capacity: 0 });
    triangles.source = new TriangleVertexBuffer({ capacity: 0 });
    labels.source = new LabelBuffer({ capacity: 0 });
    scene.append(cubes, points, lines, triangles, labels);
    expect(scene.getBounds({ content: [scene] })).toBeNull();
  });

  it('uses captures and effective count through empty, populated, empty, and regrown states', () => {
    const scene = new Scene();
    const first = new SceneCubes();
    const second = new SceneCubes();
    const source = new CubeBuffer({ capacity: 2 });
    first.source = source;
    second.source = source;
    scene.append(first, second);
    const query = () => scene.getBounds({ content: [first] });
    expect(query()).toBeNull();
    source.add({ position: [2, 0, 0], size: [2, 4, 6], color: '#0000' });
    expect(query()).toBeNull();
    first.publish();
    expect(query()).toEqual({ minimum: [1, -2, -3], maximum: [3, 2, 3] });
    expect(scene.getBounds({ content: [second] })).toBeNull();
    source.at(0).position.x = 20;
    expect(query()?.maximum[0]).toBe(3);
    first.publish({ start: 0, count: 1 });
    expect(query()?.maximum[0]).toBe(21);
    source.add({ position: [100, 0, 0] });
    first.publish();
    first.countLimit = 1;
    expect(query()?.maximum[0]).toBe(21);
    first.countLimit = undefined;
    expect(query()?.maximum[0]).toBe(100.5);
    source.setCount(0);
    first.publish();
    expect(query()).toBeNull();
    source.setCount(1);
    first.publish();
    expect(query()?.maximum[0]).toBe(21);
    expect(first.source).toBe(source);
  });

  it('retains external snapshots, suppresses invalid publications, and recovers', () => {
    const scene = new Scene();
    const points = new ScenePoints();
    const bytes = new Uint8Array(POINT.stride);
    writePoint(bytes, 0, { position: [1, 2, 3], color: [1, 1, 1, 1] });
    points.source = createPointSource({ bytes, count: 1 });
    scene.append(points);
    const query = () => scene.getBounds({ content: [points] });
    new DataView(bytes.buffer).setFloat32(0, 9, true);
    expect(query()?.minimum).toEqual([1, 2, 3]);
    points.publish();
    expect(query()?.minimum).toEqual([9, 2, 3]);
    new DataView(bytes.buffer).setFloat32(0, NaN, true);
    points.publish();
    expect(query()).toBeNull();
    new DataView(bytes.buffer).setFloat32(0, 4, true);
    points.publish();
    expect(query()?.minimum).toEqual([4, 2, 3]);
  });

  it('uses canonical primitive boxes and arrow origin-to-head geometry', () => {
    const scene = new Scene();
    const cone = new SceneCones();
    const cylinder = new SceneCylinders();
    const pyramid = new ScenePyramids();
    const sphere = new SceneSpheres();
    const layers = [cone, cylinder, pyramid, sphere];
    const options = { records: [{ position: [2, 3, 4], size: [2, 4, 6] }] } as const;
    cone.source = new ConeBuffer(options);
    cylinder.source = new CylinderBuffer(options);
    pyramid.source = new PyramidBuffer(options);
    sphere.source = new SphereBuffer(options);
    scene.append(...layers);
    for (const layer of layers)
      expect(scene.getBounds({ content: [layer] })).toEqual({ minimum: [1, 1, 1], maximum: [3, 5, 7] });
    const arrow = new SceneArrows();
    arrow.source = new ArrowBuffer({ records: [{ origin: [10, 20, 30], vector: [0, 0, 5], shaftDiameter: 2 }] });
    scene.append(arrow);
    expect(scene.getBounds({ content: [arrow] })).toEqual({ minimum: [8, 18, 30], maximum: [12, 22, 35] });
  });

  it('preserves nested rotated transforms and large origins without public Float32 matrices', () => {
    const scene = new Scene();
    const outer = new SceneFrame();
    const inner = new SceneFrame();
    const cubes = new SceneCubes();
    cubes.source = new CubeBuffer({ records: [{ position: [2, 0, 0], size: [2, 4, 6] }] });
    outer.name = inner.name = 'duplicate';
    outer.setPose({ position: [1e12, 1e12, 1e12], orientation: [0, 0, Math.SQRT1_2, Math.SQRT1_2] });
    inner.setPose({ position: [10, 20, 30], orientation: [0, 0, 0, 1] });
    scene.append(outer);
    outer.append(inner);
    inner.append(cubes);
    const bounds = scene.getBounds({ content: [outer, inner, cubes] });
    expect(bounds).toEqual({
      minimum: [1e12 - 22, 1e12 + 11, 1e12 + 27],
      maximum: [1e12 - 18, 1e12 + 13, 1e12 + 33]
    });
    expect(Object.isFrozen(bounds)).toBe(true);
    expect(Object.isFrozen(bounds?.minimum)).toBe(true);
    outer.setPose({ position: [NaN, 0, 0], orientation: [0, 0, 0, 1] });
    expect(scene.getBounds({ content: [outer] })).toBeNull();
    const peer = new SceneCubes();
    peer.source = new CubeBuffer({ records: [{}] });
    scene.append(peer);
    expect(scene.getBounds({ content: [scene] })).toEqual({ minimum: [-0.5, -0.5, -0.5], maximum: [0.5, 0.5, 0.5] });
    outer.setPose({ position: [0, 0, 0], orientation: [0, 0, 0, 1] });
    expect(scene.getBounds({ content: [outer] })?.minimum).toEqual([11, 18, 27]);
  });

  it('requires an explicit scene-owned selection and supports hidden and excluded subtrees', () => {
    const scene = new Scene();
    const frame = new SceneFrame();
    const cubes = new SceneCubes();
    cubes.source = new CubeBuffer({ records: [{}] });
    const otherScene = new Scene();
    const otherCubes = new SceneCubes();
    otherCubes.source = new CubeBuffer({ records: [{ position: [100, 0, 0] }] });
    scene.append(frame, otherScene);
    frame.append(cubes);
    otherScene.append(otherCubes);
    expect(scene.getBounds({ content: [] })).toBeNull();
    expect(scene.getBounds({ content: [scene], exclude: [frame] })).toBeNull();
    expect(scene.getBounds({ content: [scene] })?.maximum[0]).toBe(0.5);
    frame.hidden = true;
    expect(scene.getBounds({ content: [scene] })).toBeNull();
    expect(scene.getBounds({ content: [scene], includeHidden: true })?.maximum[0]).toBe(0.5);
    expect(() => scene.getBounds({ content: [otherCubes] })).toThrow(TypeError);
    expect(() => scene.getBounds({ content: [scene], exclude: [otherCubes] })).toThrow(TypeError);
  });

  it('bounds world point size and line miters while pixel sizes and labels contribute anchors', () => {
    const scene = new Scene();
    const points = new ScenePoints();
    points.source = new PointBuffer({ records: [{ position: [1, 2, 3] }] });
    points.size = 1000;
    const labels = new SceneLabels();
    labels.source = new LabelBuffer({ records: [{ position: [1, 2, 3], scale: 1000, text: 'long label' }] });
    scene.append(points, labels);
    expect(scene.getBounds({ content: [points, labels] })).toEqual({ minimum: [1, 2, 3], maximum: [1, 2, 3] });
    labels.scaleUnit = 'world';
    expect(scene.getBounds({ content: [labels] })?.maximum).toEqual([1, 2, 3]);
    points.sizeUnit = 'world';
    points.size = Math.SQRT2;
    expect(scene.getBounds({ content: [points] })).toEqual({ minimum: [0, 1, 2], maximum: [2, 3, 4] });
    const lines = new SceneLines();
    lines.source = new LineVertexBuffer({
      records: [
        { position: [0, 0, 0], width: 2 },
        { position: [2, 0, 0], width: 2 },
        { position: [2, 2, 0], width: 2 }
      ]
    });
    scene.append(lines);
    expect(scene.getBounds({ content: [lines] })).toEqual({ minimum: [-4, -4, -4], maximum: [6, 6, 4] });
    lines.widthUnit = 'pixel';
    expect(scene.getBounds({ content: [lines] })).toEqual({ minimum: [0, 0, 0], maximum: [2, 2, 0] });
    lines.countLimit = 1;
    expect(scene.getBounds({ content: [lines] })).toBeNull();
  });

  it('bounds captured indexed meshes, instancing, models, polygons, and terrain', () => {
    const scene = new Scene();
    const mesh = new SceneMesh();
    const positions = new Float32Array([0, 0, 0, 4, 0, 0, 0, 3, 0, 1000, 1000, 1000]);
    mesh.geometry = { positions, indices: new Uint32Array([0, 1, 2]) };
    scene.append(mesh);
    positions[3] = 20;
    expect(scene.getBounds({ content: [mesh] })).toEqual({ minimum: [0, 0, 0], maximum: [4, 3, 0] });
    mesh.publishGeometry({ attribute: 'positions', start: 1, count: 1 });
    expect(scene.getBounds({ content: [mesh] })?.maximum[0]).toBe(20);
    mesh.source = new MarkerBuffer({ capacity: 1 });
    expect(scene.getBounds({ content: [mesh] })).toBeNull();
    mesh.source = new MarkerBuffer({ records: [{ position: [10, 20, 30], scale: [2, 3, 4] }] });
    expect(scene.getBounds({ content: [mesh] })).toEqual({ minimum: [10, 20, 30], maximum: [50, 29, 30] });
    mesh.source = null;
    const model = new SceneModel();
    model.geometry = [{ shape: 'cube', position: [5, 0, 0], scale: [2, 4, 6] }];
    const polygon = new ScenePolygon();
    polygon.geometry = {
      outer: [
        [0, 0],
        [4, 0],
        [4, 3],
        [0, 3]
      ]
    };
    const terrain = new SceneHeightfield();
    terrain.grid = { columns: 2, rows: 2, spacing: 2, origin: [10, 20], heights: new Float32Array([0, 1, 2, 3]) };
    scene.append(model, polygon, terrain);
    expect(scene.getBounds({ content: [model] })).toEqual({ minimum: [4, -2, -3], maximum: [6, 2, 3] });
    expect(scene.getBounds({ content: [polygon] })).toEqual({ minimum: [0, 0, 0], maximum: [4, 3, 0] });
    expect(scene.getBounds({ content: [terrain] })).toEqual({ minimum: [10, 20, 0], maximum: [12, 22, 3] });
    model.asset = '/not-loaded.glb';
    expect(scene.getBounds({ content: [model] })).toBeNull();
  });

  it('does not drain marker, stream, label, or mesh publication uploads', () => {
    const scene = new Scene();
    const cubes = new SceneCubes();
    cubes.source = new CubeBuffer({ records: [{}] });
    const points = new ScenePoints();
    points.source = new PointBuffer({ records: [{}] });
    const labels = new SceneLabels();
    labels.source = new LabelBuffer({ records: [{ text: 'a' }] });
    const mesh = new SceneMesh();
    mesh.geometry = { positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]) };
    mesh.publishGeometry({ attribute: 'positions', start: 1, count: 1 });
    const triangles = new SceneTriangles();
    triangles.source = new TriangleVertexBuffer({ records: [{}, { position: [1, 0, 0] }, { position: [0, 1, 0] }] });
    scene.append(cubes, points, labels, mesh, triangles);
    expect(scene.getBounds({ content: [scene] })).not.toBeNull();
    expect(getMarkerLayerRenderData(cubes).uploadRanges).toEqual([]);
    expect(takeMarkerLayerRenderData(cubes).uploadRanges).not.toHaveLength(0);
    expect(takeStreamingLayerRenderData(points).uploadRanges).not.toHaveLength(0);
    expect(takeStreamingLayerRenderData(triangles).uploadRanges).not.toHaveLength(0);
    expect(takeLabelLayerRenderData(labels).uploadRanges).not.toHaveLength(0);
    expect(takeMeshLayerRenderData(mesh).geometryUploadRanges).not.toHaveLength(0);
  });
});
