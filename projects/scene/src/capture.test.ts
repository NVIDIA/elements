// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { SceneMesh } from './mesh/mesh.js';
import { SceneHeightfield } from './heightfield/heightfield.js';
import { getMeshRenderData, getMeshLayerVersion } from './internal/layers/mesh/layer-state.js';
import {
  getHeightfieldLayerGrid,
  getHeightfieldLayerVersion,
  takeHeightfieldLayerRenderData
} from './internal/layers/heightfield/layer-state.js';
import { configureSceneTesting, resetSceneTesting } from './internal/testing/scene.js';
import './mesh/define.js';
import './heightfield/define.js';

const triangle = { positions: new Float32Array(9) };
const smallGrid = { rows: 2, columns: 2, spacing: 1, heights: new Float32Array(4) };
const largeMesh = () => ({
  positions: new Float32Array(36_000).fill(1),
  colors: new Float32Array(48_000).fill(1),
  indices: Uint32Array.from({ length: 36_000 }, (_, index) => index % 12_000)
});
const largeGrid = () => ({
  rows: 128,
  columns: 128,
  spacing: 1,
  heights: new Float32Array(16_384).fill(2),
  colors: new Uint8Array(65_536).fill(255)
});

afterEach(() => {
  resetSceneTesting();
  vi.restoreAllMocks();
});

describe('owned geometry capture', () => {
  it('schedules large assignments without changing accepted geometry or versions immediately', async () => {
    const releases: (() => void)[] = [];
    configureSceneTesting({ yieldForPreparation: () => new Promise<void>(resolve => releases.push(resolve)) });
    const mesh = new SceneMesh();
    mesh.geometry = triangle;
    const version = getMeshLayerVersion(mesh);
    mesh.geometry = largeMesh();
    const pending = mesh.loadComplete;
    expect(mesh.geometry?.positions).toBe(triangle.positions);
    expect(getMeshLayerVersion(mesh)).toBe(version);
    expect(getMeshRenderData(mesh).ready).toBe(true);
    expect(() => mesh.publishGeometry({ attribute: 'positions', source: new Float32Array(36_000) })).toThrow(
      /assign geometry/
    );
    expect(getMeshLayerVersion(mesh)).toBe(version);

    const terrain = new SceneHeightfield();
    terrain.grid = smallGrid;
    const gridVersion = getHeightfieldLayerVersion(terrain);
    terrain.grid = largeGrid();
    const gridPending = terrain.loadComplete;
    expect(terrain.grid).toBe(smallGrid);
    expect(getHeightfieldLayerVersion(terrain)).toBe(gridVersion);
    expect(terrain.heightAt(0, 0)).toBe(0);
    configureSceneTesting({ yieldForPreparation: async () => undefined });
    releases.forEach(resolve => resolve());
    await Promise.all([pending, gridPending]);
    expect(getMeshLayerVersion(mesh)).toBeGreaterThan(version);
    expect(terrain.heightAt(0, 0)).toBe(2);
  });

  it('copies, validates, and summarizes large meshes between yields without a final full scan', async () => {
    const releases: (() => void)[] = [];
    configureSceneTesting({ yieldForPreparation: () => new Promise<void>(resolve => releases.push(resolve)) });
    const mesh = new SceneMesh();
    mesh.geometry = triangle;
    const accepted = getMeshRenderData(mesh);
    const source = largeMesh();
    source.colors[3] = 0.5;
    const copies = vi.spyOn(Float32Array.prototype, 'set');
    mesh.geometry = source;
    const pending = mesh.loadComplete;
    expect(copies).not.toHaveBeenCalled();
    expect(releases).toHaveLength(1);
    expect(getMeshRenderData(mesh).positions).toBe(accepted.positions);
    releases.shift()!();
    await vi.waitFor(() => expect(releases).toHaveLength(1));
    expect(getMeshRenderData(mesh).positions).toBe(accepted.positions);
    expect(copies.mock.calls.reduce((count, [values]) => count + values.length, 0)).toBeLessThanOrEqual(65_536);
    configureSceneTesting({ yieldForPreparation: async () => undefined });
    releases.shift()!();
    await pending;
    await mesh.loadComplete;
    const captured = getMeshRenderData(mesh);
    expect(Math.max(...copies.mock.calls.map(([values]) => values.length))).toBeLessThanOrEqual(16_384);
    expect(captured.positions).toEqual(source.positions);
    expect(captured.indices).toEqual(source.indices);
    expect(captured.transparent).toBe(true);
    source.positions.fill(9);
    source.colors.fill(0);
    source.indices.fill(0);
    expect(captured.positions?.[0]).toBe(1);
    expect(captured.colors?.[3]).toBe(0.5);
    expect(captured.indices?.[1]).toBe(1);
  });

  it('retains accepted terrain and queries until the large grid capture succeeds', async () => {
    const releases: (() => void)[] = [];
    configureSceneTesting({ yieldForPreparation: () => new Promise<void>(resolve => releases.push(resolve)) });
    const terrain = new SceneHeightfield();
    terrain.grid = smallGrid;
    const source = largeGrid();
    source.colors[3] = 0;
    terrain.grid = source;
    const pending = terrain.loadComplete;
    expect(releases).toHaveLength(1);
    expect(terrain.heightAt(0, 0)).toBe(0);
    releases.shift()!();
    await vi.waitFor(() => expect(releases).toHaveLength(1));
    expect(terrain.heightAt(0, 0)).toBe(0);
    configureSceneTesting({ yieldForPreparation: async () => undefined });
    releases.shift()!();
    await pending;
    await terrain.loadComplete;
    expect(terrain.heightAt(0, 0)).toBe(2);
    expect(takeHeightfieldLayerRenderData(terrain).transparent).toBe(true);
    source.heights.fill(99);
    source.colors.fill(0);
    expect(terrain.heightAt(0, 0)).toBe(2);
    expect(getHeightfieldLayerGrid(terrain)?.colors?.[7]).toBe(255);
  });

  it('reports invalid shapes before scheduling capture', async () => {
    const schedule = vi.fn(async () => undefined);
    configureSceneTesting({ yieldForPreparation: schedule });
    const mesh = new SceneMesh();
    mesh.geometry = triangle;
    mesh.geometry = { positions: new Float32Array(36_001) };
    await expect(mesh.loadComplete).rejects.toThrow(/triples/);
    const terrain = new SceneHeightfield();
    terrain.grid = smallGrid;
    terrain.grid = { ...largeGrid(), rows: Number.MAX_SAFE_INTEGER };
    await terrain.loadComplete;
    expect(takeHeightfieldLayerRenderData(terrain).ready).toBe(false);
    expect(schedule).not.toHaveBeenCalled();
    expect(getMeshRenderData(mesh).ready).toBe(true);
    expect(terrain.heightAt(0, 0)).toBeUndefined();
  });

  it('checks source and expanded mesh allocation budgets before scheduling or copying', async () => {
    const schedule = vi.fn(async () => undefined);
    configureSceneTesting({ yieldForPreparation: schedule });
    const mesh = new SceneMesh();
    mesh.geometry = triangle;
    // Exercise large metadata without reserving hundreds of MiB for rejected arrays.
    const normals = new Float32Array(9);
    Object.defineProperty(normals, 'length', { value: 67_108_866 });
    mesh.geometry = { ...triangle, normals };
    await expect(mesh.loadComplete).rejects.toThrow(/256 MiB/);
    const positions = new Float32Array(9);
    Object.defineProperty(positions, 'length', { value: 33_554_439 });
    mesh.geometry = { positions };
    await expect(mesh.loadComplete).rejects.toThrow(/256 MiB/);
    const indices = new Uint32Array(3);
    Object.defineProperty(indices, 'length', { value: 12_000_000 });
    mesh.geometry = { ...triangle, indices };
    await expect(mesh.loadComplete).rejects.toThrow(/256 MiB/);
    expect(schedule).not.toHaveBeenCalled();
    expect(getMeshRenderData(mesh).positions).toEqual(triangle.positions);
  });

  it('validates origin shape before iterating or copying it', async () => {
    const terrain = new SceneHeightfield();
    const origin = [0, 0, 0];
    const iterate = vi.spyOn(origin, Symbol.iterator);
    terrain.grid = { ...smallGrid, origin } as never;
    await terrain.loadComplete;
    expect(takeHeightfieldLayerRenderData(terrain).ready).toBe(false);
    expect(iterate).not.toHaveBeenCalled();
  });

  it('preserves accepted data when validation fails in the final copied range', async () => {
    configureSceneTesting({ yieldForPreparation: async () => undefined });
    const mesh = new SceneMesh();
    const meshErrors: CustomEvent[] = [];
    mesh.addEventListener('nve-scene-error', event => meshErrors.push(event));
    mesh.geometry = triangle;
    const source = largeMesh();
    source.indices[source.indices.length - 1] = 99_999;
    mesh.geometry = source;
    await expect(mesh.loadComplete).rejects.toThrow(/index/);
    expect(getMeshRenderData(mesh).positions).toEqual(triangle.positions);
    expect(meshErrors.at(-1)?.detail.code).toBe('mesh-geometry');
    const terrain = new SceneHeightfield();
    const terrainErrors: CustomEvent[] = [];
    terrain.addEventListener('nve-scene-error', event => terrainErrors.push(event));
    terrain.grid = smallGrid;
    const grid = largeGrid();
    grid.heights[grid.heights.length - 1] = Number.NaN;
    terrain.grid = grid;
    await expect(terrain.loadComplete).rejects.toThrow(/finite/);
    expect(terrain.heightAt(0, 0)).toBe(0);
    expect(terrainErrors.at(-1)?.detail.code).toBe('heightfield-grid');
  });

  it('lets newer assignments supersede earlier input', async () => {
    const releases: (() => void)[] = [];
    configureSceneTesting({ yieldForPreparation: () => new Promise<void>(resolve => releases.push(resolve)) });
    const mesh = new SceneMesh();
    const terrain = new SceneHeightfield();
    mesh.geometry = largeMesh();
    const obsoleteMesh = mesh.loadComplete;
    terrain.grid = largeGrid();
    const obsoleteGrid = terrain.loadComplete;
    mesh.geometry = triangle;
    const currentMesh = mesh.loadComplete;
    terrain.grid = smallGrid;
    const currentGrid = terrain.loadComplete;
    configureSceneTesting({ yieldForPreparation: async () => undefined });
    releases.forEach(resolve => resolve());
    await expect(obsoleteMesh).rejects.toMatchObject({ name: 'AbortError' });
    await expect(obsoleteGrid).rejects.toMatchObject({ name: 'AbortError' });
    await Promise.all([currentMesh, currentGrid]);
    expect(getMeshRenderData(mesh).positions).toEqual(triangle.positions);
    expect(terrain.heightAt(0, 0)).toBe(0);
  });

  it.each(['replacement', 'disconnect'] as const)('cancels obsolete mesh and terrain captures on %s', async action => {
    const releases: (() => void)[] = [];
    configureSceneTesting({ yieldForPreparation: () => new Promise<void>(resolve => releases.push(resolve)) });
    const mesh = new SceneMesh();
    const terrain = new SceneHeightfield();
    mesh.geometry = triangle;
    terrain.grid = smallGrid;
    mesh.geometry = largeMesh();
    const meshPending = mesh.loadComplete;
    terrain.grid = largeGrid();
    const terrainPending = terrain.loadComplete;
    if (action === 'replacement') {
      mesh.geometry = triangle;
      terrain.grid = smallGrid;
    } else {
      mesh.disconnectedCallback();
      terrain.disconnectedCallback();
    }
    releases.forEach(resolve => resolve());
    await expect(meshPending).rejects.toMatchObject({ name: 'AbortError' });
    await expect(terrainPending).rejects.toMatchObject({ name: 'AbortError' });
    expect(getMeshRenderData(mesh).positions).toEqual(triangle.positions);
    expect(terrain.heightAt(0, 0)).toBe(0);
  });
});
