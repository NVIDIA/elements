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
  takeMeshLayerRenderData
} from './layer-state.js';

function layer(): HTMLElement {
  const element = document.createElement('div');
  registerMarkerLayer(element, 'cube');
  registerMeshLayer(element);
  return element;
}
describe('mesh layer state', () => {
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
