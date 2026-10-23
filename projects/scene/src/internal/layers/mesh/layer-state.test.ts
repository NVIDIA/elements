// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from 'vitest';
import { scenePlatform, restoreScenePlatform } from '../../gpu/platform.js';
import { PREPARATION_CHUNK_SIZE } from '../../rendering/preparation.js';
import { registerMarkerLayer } from '../markers/layer-state.js';
import {
  getMeshRenderData,
  getMeshPartGeometry,
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
afterEach(() => {
  restoreScenePlatform();
  vi.restoreAllMocks();
});

describe('mesh layer state', () => {
  it('commits pending color summaries, index topology, and empty publications with their bytes', async () => {
    scenePlatform.yieldForPreparation = async () => undefined;
    const mesh = layer();
    const count = PREPARATION_CHUNK_SIZE;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 4).fill(1);
    const indices = new Uint32Array(count * 3);
    replaceMeshGeometry(mesh, { positions, colors, indices });
    const before = takeMeshLayerRenderData(mesh);
    colors[3] = 0.5;
    publishMeshGeometry(mesh, { attribute: 'colors', source: colors, start: 0, count: 1 });
    colors[7] = 0;
    publishMeshGeometry(mesh, { attribute: 'colors', source: colors, start: 1, count: 1 });
    colors[3] = 1;
    publishMeshGeometry(mesh, { attribute: 'colors', source: colors, start: 0, count: 1 });
    indices[0] = 1;
    publishMeshGeometry(mesh, { attribute: 'indices', source: indices, count: 1 });
    publishMeshGeometry(mesh, { attribute: 'indices', source: indices, count: 0 });
    expect(getMeshRenderData(mesh).transparent).toBe(false);
    await vi.waitFor(() => {
      const data = getMeshRenderData(mesh);
      expect(data.colors?.[7]).toBe(0);
      expect(data.indices?.[0]).toBe(1);
    });
    const after = getMeshRenderData(mesh);
    expect(after.colors?.[3]).toBe(1);
    expect(after.transparent).toBe(true);
    expect(before.colors?.[7]).toBe(1);
    expect(before.indices?.[0]).toBe(0);
    expect(after.geometryVersions.colors).toBe(before.geometryVersions.colors + 3);
    expect(after.geometryVersions.indices).toBe(before.geometryVersions.indices + 2);
    expect(after.topologyVersion).toBe(before.topologyVersion + 2);
  });

  it('retains ready geometry and reports a local error if deferred copying fails', async () => {
    const mesh = layer();
    const positions = new Float32Array(Math.ceil((PREPARATION_CHUNK_SIZE * 2) / 9) * 9);
    replaceMeshGeometry(mesh, { positions });
    const before = getMeshRenderData(mesh);
    const diagnostic = vi.fn();
    mesh.addEventListener('nve-scene-error', diagnostic);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    scenePlatform.yieldForPreparation = async () => {
      throw new Error('Preparation failed.');
    };
    positions[0] = 4;
    publishMeshGeometry(mesh, { attribute: 'positions', source: positions, count: 1 });
    await vi.waitFor(() => expect(diagnostic).toHaveBeenCalledOnce());
    expect(getMeshRenderData(mesh).positions).toBe(before.positions);
    expect(getMeshRenderData(mesh).ready).toBe(true);
    scenePlatform.yieldForPreparation = async () => undefined;
    publishMeshGeometry(mesh, { attribute: 'positions', source: positions, count: 1 });
    await vi.waitFor(() => expect(getMeshRenderData(mesh).positions?.[0]).toBe(4));
    scenePlatform.yieldForPreparation = async () => {
      throw new Error('Preparation failed again.');
    };
    publishMeshGeometry(mesh, { attribute: 'positions', source: positions, count: 1 });
    await vi.waitFor(() => expect(diagnostic).toHaveBeenCalledTimes(2));
  });

  it('copies large shared snapshots in bounded tasks while retaining the ready generation', async () => {
    const mesh = layer();
    const positions = new Float32Array(Math.ceil((PREPARATION_CHUNK_SIZE * 3) / 9) * 9);
    replaceMeshGeometry(mesh, { positions });
    const before = takeMeshLayerRenderData(mesh);
    let resume: (() => void) | undefined;
    scenePlatform.yieldForPreparation = () =>
      new Promise(resolve => {
        resume = resolve;
      });
    const writes = vi.spyOn(Float32Array.prototype, 'set');
    const copies = vi.spyOn(Float32Array.prototype, 'slice');
    positions[0] = 1;
    expect(publishMeshGeometry(mesh, { attribute: 'positions', source: positions, start: 0, count: 1 })).toBe(
      'pending'
    );
    positions[3] = 2;
    publishMeshGeometry(mesh, { attribute: 'positions', source: positions, start: 1, count: 1 });
    const last = positions.length / 3 - 1;
    positions[last * 3] = 3;
    publishMeshGeometry(mesh, { attribute: 'positions', source: positions, start: last, count: 1 });
    positions[0] = 99;
    positions[3] = NaN;
    expect(() =>
      publishMeshGeometry(mesh, { attribute: 'positions', source: positions, start: 1, count: 1 })
    ).toThrow();
    expect(getMeshRenderData(mesh).positions).toBe(before.positions);
    expect(getMeshRenderData(mesh).geometryVersions).toEqual(before.geometryVersions);
    scenePlatform.yieldForPreparation = async () => undefined;
    resume?.();
    await vi.waitFor(() => expect(getMeshRenderData(mesh).positions).not.toBe(before.positions));
    const sizes = writes.mock.calls.map(([values]) => values.length);
    expect(copies).not.toHaveBeenCalled();
    expect(Math.max(...sizes)).toBeLessThanOrEqual(PREPARATION_CHUNK_SIZE);
    const after = takeMeshLayerRenderData(mesh);
    expect(after.positions?.[0]).toBe(1);
    expect(after.positions?.[3]).toBe(2);
    expect(after.positions?.[last * 3]).toBe(3);
    expect(before.positions).toEqual(new Float32Array(positions.length));
    expect(after.geometryVersions.positions).toBe(before.geometryVersions.positions + 3);
    expect(after.geometryUploadRanges).toEqual([
      { attribute: 'positions', offset: 0, size: 24 },
      { attribute: 'positions', offset: last * 12, size: 12 }
    ]);
  });

  it('cancels obsolete large copies when complete geometry replaces the pending generation', async () => {
    const mesh = layer();
    const positions = new Float32Array(Math.ceil((PREPARATION_CHUNK_SIZE * 2) / 9) * 9);
    replaceMeshGeometry(mesh, { positions });
    getMeshRenderData(mesh);
    let resume: (() => void) | undefined;
    scenePlatform.yieldForPreparation = () =>
      new Promise(resolve => {
        resume = resolve;
      });
    positions[0] = 4;
    publishMeshGeometry(mesh, { attribute: 'positions', source: positions, count: 1 });
    replaceMeshGeometry(mesh, { positions: new Float32Array(9).fill(2) });
    const replacement = getMeshRenderData(mesh);
    scenePlatform.yieldForPreparation = async () => undefined;
    resume?.();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(getMeshRenderData(mesh).positions).toBe(replacement.positions);
    expect(getMeshRenderData(mesh).positions?.[0]).toBe(2);
  });

  it('preserves pending geometry when a complete attribute assignment captures the next generation', () => {
    const mesh = layer();
    const positions = new Float32Array(Math.ceil((PREPARATION_CHUNK_SIZE * 2) / 9) * 9);
    replaceMeshGeometry(mesh, { positions });
    const before = getMeshRenderData(mesh);
    positions[0] = 4;
    publishMeshGeometry(mesh, { attribute: 'positions', source: positions, count: 1 });
    setMeshGeometryProperty(mesh, 'normals', new Float32Array(positions.length));
    const after = getMeshRenderData(mesh);
    expect(after.positions?.[0]).toBe(4);
    expect(before.positions?.[0]).toBe(0);
  });

  it.each([9, 90_000])('validates only the selected scalars in %i position values', length => {
    const mesh = layer();
    const positions = new Float32Array(length);
    const normals = new Float32Array(length);
    replaceMeshGeometry(mesh, { positions, normals });
    positions[0] = 2;
    positions[3] = NaN;
    const finite = vi.spyOn(Number, 'isFinite');
    let checks: number;
    try {
      publishMeshGeometry(mesh, { attribute: 'positions', source: positions, start: 0, count: 1 });
      checks = finite.mock.calls.length;
    } finally {
      finite.mockRestore();
    }
    expect(checks).toBe(3);
    expect(getMeshRenderData(mesh).positions?.slice(0, 4)).toEqual(new Float32Array([2, 0, 0, 0]));
  });

  it('detaches shared attributes once for a batch and preserves render and body snapshots', () => {
    const mesh = layer();
    const positions = new Float32Array(18);
    replaceMeshGeometry(mesh, { positions });
    const rendered = takeMeshLayerRenderData(mesh);
    const body = getMeshPartGeometry(mesh);
    const copies = vi.spyOn(Float32Array.prototype, 'slice');
    let copyCount: number;
    try {
      for (let start = 0; start < 3; start += 1) {
        positions[start * 3] = start + 1;
        publishMeshGeometry(mesh, { attribute: 'positions', source: positions, start, count: 1 });
      }
      copyCount = copies.mock.calls.length;
    } finally {
      copies.mockRestore();
    }
    expect(copyCount).toBe(1);
    expect(rendered.positions).toEqual(new Float32Array(18));
    expect(body?.positions).toBe(rendered.positions);
    const next = getMeshRenderData(mesh);
    expect(next.positions?.slice(0, 9)).toEqual(new Float32Array([1, 0, 0, 2, 0, 0, 3, 0, 0]));
    positions[0] = 4;
    publishMeshGeometry(mesh, { attribute: 'positions', source: positions, count: 1 });
    expect(next.positions?.[0]).toBe(1);
    expect(getMeshRenderData(mesh).positions?.[0]).toBe(4);
  });

  it('reuses private index storage between snapshots without cloning topology history', () => {
    const mesh = layer();
    const positions = new Float32Array(12);
    const indices = new Uint32Array([0, 1, 2]);
    replaceMeshGeometry(mesh, { positions, indices });
    const before = getMeshRenderData(mesh);
    const copies = vi.spyOn(Uint32Array.prototype, 'slice');
    let copyCount: number;
    try {
      indices[1] = 3;
      publishMeshGeometry(mesh, { attribute: 'indices', source: indices, start: 1, count: 1 });
      indices[2] = 1;
      publishMeshGeometry(mesh, { attribute: 'indices', source: indices, start: 2, count: 1 });
      copyCount = copies.mock.calls.length;
    } finally {
      copies.mockRestore();
    }
    expect(copyCount).toBe(1);
    expect(before.indices).toEqual(new Uint32Array([0, 1, 2]));
    const after = getMeshRenderData(mesh);
    expect(after.indices).toEqual(new Uint32Array([0, 3, 1]));
    expect(after.topologyVersion).toBe(before.topologyVersion + 2);
    indices[1] = 4;
    expect(() => publishMeshGeometry(mesh, { attribute: 'indices', source: indices, start: 1, count: 1 })).toThrow();
    expect(getMeshRenderData(mesh).indices).toBe(after.indices);
  });

  it('requires a valid complete geometry when repairing an invalid base through a range', () => {
    const mesh = layer();
    const positions = new Float32Array(9);
    const normals = new Float32Array(9);
    normals[0] = NaN;
    replaceMeshGeometry(mesh, { positions, normals });
    const before = getMeshRenderData(mesh);
    positions[0] = 1;
    expect(() => publishMeshGeometry(mesh, { attribute: 'positions', source: positions, count: 1 })).toThrow();
    expect(getMeshRenderData(mesh).positions).toBe(before.positions);
    normals[0] = 1;
    publishMeshGeometry(mesh, { attribute: 'normals', source: normals, count: 1 });
    expect(getMeshRenderData(mesh)).toMatchObject({ geometryError: false, ready: true });
    expect(before.normals?.[0]).toBeNaN();
  });

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
    expect(empty.positions).toBe(before.positions);
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
