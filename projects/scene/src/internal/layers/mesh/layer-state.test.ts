// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { registerMarkerLayer } from '../markers/layer-state.js';
import {
  getMeshRenderData,
  getMeshTopologyVersion,
  isMeshLayerRegistered,
  publishMeshGeometry,
  registerMeshLayer,
  replaceMeshGeometry,
  setMeshColor,
  setMeshGeometryProperty,
  takeMeshLayerRenderData
} from './layer-state.js';

function layer(): HTMLElement {
  const element = document.createElement('div');
  registerMarkerLayer(element, 'cube');
  registerMeshLayer(element);
  return element;
}
describe('mesh layer state', () => {
  it('tracks alpha through selected publications, empty edits, and removal of the last nonopaque color', () => {
    const mesh = layer();
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const colors = new Float32Array(12).fill(1);
    const expected = colors.slice();
    replaceMeshGeometry(mesh, { positions, colors });
    const opaque = getMeshRenderData(mesh);
    colors[3] = 0.5;
    expect(getMeshRenderData(mesh).transparent).toBe(false);
    publishMeshGeometry(mesh, { attribute: 'colors', source: colors, start: 0, count: 0 });
    expect(getMeshRenderData(mesh).transparent).toBe(false);
    publishMeshGeometry(mesh, { attribute: 'colors', source: colors, start: 0, count: 1 });
    expect(getMeshRenderData(mesh).transparent).toBe(true);
    colors[7] = 0;
    publishMeshGeometry(mesh, { attribute: 'colors', source: colors, start: 1, count: 1 });
    colors[3] = 1;
    publishMeshGeometry(mesh, { attribute: 'colors', source: colors, start: 0, count: 1 });
    expect(getMeshRenderData(mesh).transparent).toBe(true);
    colors[7] = 1;
    publishMeshGeometry(mesh, { attribute: 'colors', source: colors, start: 1, count: 1 });
    expect(getMeshRenderData(mesh).transparent).toBe(false);

    for (let step = 0; step < 40; step += 1) {
      const start = step % 3;
      const count = Math.min(3 - start, step % 4);
      colors[start * 4 + 3] = ([0, 0.5, 1] as const)[Math.floor(step / 3) % 3]!;
      expected.set(colors.subarray(start * 4, (start + count) * 4), start * 4);
      publishMeshGeometry(mesh, { attribute: 'colors', source: colors, start, count });
      const data = getMeshRenderData(mesh);
      expect(data.colors).toEqual(expected);
      expect(data.transparent).toBe(expected.some((value, index) => index % 4 === 3 && value < 1));
    }
    expect(opaque.transparent).toBe(false);
    expect(opaque.colors).toEqual(new Float32Array(12).fill(1));
  });

  it('preserves alpha counts after rejected publications and refreshes them for replacements', () => {
    const mesh = layer();
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const colors = new Float32Array(12).fill(1);
    colors[11] = 0.999;
    replaceMeshGeometry(mesh, { positions, colors });
    const before = getMeshRenderData(mesh);
    expect(before.transparent).toBe(true);
    colors[8] = NaN;
    colors[11] = 1;
    expect(() => publishMeshGeometry(mesh, { attribute: 'colors', source: colors, start: 2, count: 1 })).toThrow();
    expect(getMeshRenderData(mesh).colors).toBe(before.colors);
    expect(getMeshRenderData(mesh).transparent).toBe(true);
    publishMeshGeometry(mesh, { attribute: 'positions', source: positions, start: 0, count: 1 });
    expect(getMeshRenderData(mesh).transparent).toBe(true);
    colors[8] = 1;
    publishMeshGeometry(mesh, { attribute: 'colors', source: colors, start: 2, count: 1 });
    expect(getMeshRenderData(mesh).transparent).toBe(false);
    setMeshColor(mesh, '#ffffff80');
    expect(getMeshRenderData(mesh).transparent).toBe(true);
    setMeshColor(mesh, '#ffffff');
    expect(getMeshRenderData(mesh).transparent).toBe(false);
    colors[3] = 0;
    setMeshGeometryProperty(mesh, 'colors', colors);
    expect(getMeshRenderData(mesh).transparent).toBe(true);
    setMeshGeometryProperty(mesh, 'colors', null);
    expect(getMeshRenderData(mesh).transparent).toBe(false);
    replaceMeshGeometry(mesh, { positions, colors: new Float32Array([0, 0, 0, NaN]) });
    expect(getMeshRenderData(mesh).ready).toBe(false);
    replaceMeshGeometry(mesh, { positions, colors: new Float32Array(12).fill(1) });
    expect(getMeshRenderData(mesh)).toMatchObject({ ready: true, transparent: false });
  });

  it('retains indexed source ranges with their base version and clears both after consumption or topology changes', () => {
    const mesh = layer();
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const indices = new Uint32Array([0, 1, 2]);
    replaceMeshGeometry(mesh, { positions, indices });
    const before = takeMeshLayerRenderData(mesh);
    publishMeshGeometry(mesh, { attribute: 'positions', source: positions, start: 0, count: 1 });
    publishMeshGeometry(mesh, { attribute: 'positions', source: positions, start: 1, count: 1 });
    const data = takeMeshLayerRenderData(mesh);
    expect(data.geometryUploadRanges).toEqual([{ attribute: 'positions', offset: 0, size: 24 }]);
    expect(data.geometryUploadBaseVersions).toEqual({ positions: before.geometryVersions.positions });
    expect(takeMeshLayerRenderData(mesh).geometryUploadBaseVersions).toEqual({});
    publishMeshGeometry(mesh, { attribute: 'positions', source: positions, start: 2, count: 1 });
    indices.reverse();
    publishMeshGeometry(mesh, { attribute: 'indices', source: indices });
    const replacement = takeMeshLayerRenderData(mesh);
    expect(replacement.topologyVersion).toBeGreaterThan(data.topologyVersion);
    expect(replacement.geometryUploadRanges).toEqual([]);
    expect(replacement.geometryUploadBaseVersions).toEqual({});
    expect(data.geometryUploadBaseVersions).toEqual({ positions: before.geometryVersions.positions });
  });

  it('captures geometry, publishes only selected producer records, and drains upload ranges once', () => {
    const mesh = layer();
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    replaceMeshGeometry(mesh, { positions });
    expect(isMeshLayerRegistered(mesh)).toBe(true);
    const topology = getMeshTopologyVersion(mesh);
    takeMeshLayerRenderData(mesh);
    positions[0] = 8;
    positions[3] = 2;
    expect(getMeshRenderData(mesh).positions?.[3]).toBe(1);
    publishMeshGeometry(mesh, { attribute: 'positions', source: positions, start: 1, count: 1 });
    expect(getMeshRenderData(mesh).positions?.[0]).toBe(0);
    expect(getMeshRenderData(mesh).positions?.[3]).toBe(2);
    expect(getMeshTopologyVersion(mesh)).toBe(topology);
    expect(getMeshRenderData(mesh).geometryUploadRanges).toEqual([{ attribute: 'positions', offset: 12, size: 12 }]);
    expect(takeMeshLayerRenderData(mesh).geometryUploadRanges).toHaveLength(1);
    expect(takeMeshLayerRenderData(mesh).geometryUploadRanges).toEqual([]);
  });

  it('preserves empty publications in the covered version window without publishing producer changes', () => {
    const mesh = layer();
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    replaceMeshGeometry(mesh, { positions });
    const before = takeMeshLayerRenderData(mesh);
    positions[0] = 8;
    publishMeshGeometry(mesh, { attribute: 'positions', source: positions, start: 0, count: 0 });
    const empty = getMeshRenderData(mesh);
    expect(empty.positions).toEqual(before.positions);
    expect(empty.geometryVersions.positions).toBe(before.geometryVersions.positions + 1);
    expect(empty.geometryUploadBaseVersions).toEqual({ positions: before.geometryVersions.positions });
    expect(empty.geometryUploadRanges).toEqual([]);
    publishMeshGeometry(mesh, { attribute: 'positions', source: positions, start: 1, count: 1 });
    const data = takeMeshLayerRenderData(mesh);
    expect(data.geometryUploadBaseVersions).toEqual(empty.geometryUploadBaseVersions);
    expect(data.geometryUploadRanges).toEqual([{ attribute: 'positions', offset: 12, size: 12 }]);
    expect(empty.geometryUploadRanges).toEqual([]);
    expect(takeMeshLayerRenderData(mesh).geometryUploadBaseVersions).toEqual({});
  });

  it('rejects invalid publication atomically and recovers invalid replacements', () => {
    const mesh = layer();
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    replaceMeshGeometry(mesh, { positions });
    const before = getMeshRenderData(mesh);
    positions[0] = NaN;
    expect(() => publishMeshGeometry(mesh, { attribute: 'positions', source: positions })).toThrow();
    expect(getMeshRenderData(mesh).positions).toEqual(before.positions);
    replaceMeshGeometry(mesh, { positions: [1, 2, 3] });
    expect(getMeshRenderData(mesh).geometryError).toBe(true);
    replaceMeshGeometry(mesh, { positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]) });
    expect(getMeshRenderData(mesh).geometryError).toBe(false);
    expect(() => getMeshRenderData(document.createElement('div'))).toThrow(TypeError);
  });
});
