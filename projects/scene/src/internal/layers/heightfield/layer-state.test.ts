// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { HEIGHTFIELD_GRID, LAYER_CHILD } from '../../diagnostics/errors.js';
import {
  connectHeightfieldLayer,
  getHeightfieldLayerGrid,
  getHeightfieldLayerSampler,
  getHeightfieldLayerTopologyVersion,
  getHeightfieldLayerVersion,
  registerHeightfieldLayer,
  setHeightfieldLayerColor,
  setHeightfieldLayerGrid,
  takeHeightfieldLayerRenderData
} from './layer-state.js';

const grid = () => ({
  columns: 2,
  heights: new Float32Array([0, 1, 2, 3]),
  rows: 2,
  spacing: 1
});

describe('heightfield layer state', () => {
  it('reuses the sampler for one captured grid and replaces or clears it with that grid', () => {
    const layer = document.createElement('div');
    registerHeightfieldLayer(layer, [1, 1, 1, 1]);
    expect(getHeightfieldLayerSampler(layer)).toBeNull();
    const source = { ...grid(), origin: [10, -5] as const };
    setHeightfieldLayerGrid(layer, source);
    const first = getHeightfieldLayerSampler(layer);
    expect(first?.heightAt(10, -5)).toBe(0);
    source.heights[0] = 7;
    setHeightfieldLayerColor(layer, [0.5, 0.5, 0.5, 1]);
    expect(getHeightfieldLayerSampler(layer)).toBe(first);
    expect(first?.heightAt(10, -5)).toBe(0);
    setHeightfieldLayerGrid(layer, source);
    expect(getHeightfieldLayerSampler(layer)).not.toBe(first);
    expect(getHeightfieldLayerSampler(layer)?.heightAt(10, -5)).toBe(7);
    expect(first?.heightAt(10, -5)).toBe(0);
    setHeightfieldLayerGrid(layer, { ...source, spacing: 0 });
    expect(getHeightfieldLayerSampler(layer)).toBeNull();
    setHeightfieldLayerGrid(layer, source);
    expect(getHeightfieldLayerSampler(layer)?.heightAt(10, -5)).toBe(7);
    setHeightfieldLayerGrid(layer, null);
    expect(getHeightfieldLayerSampler(layer)).toBeNull();
  });

  it('captures byte alpha with each grid generation and clears it after invalid or absent grids', () => {
    const layer = document.createElement('div');
    registerHeightfieldLayer(layer, [1, 1, 1, 1]);
    const colors = new Uint8Array(16).fill(255);
    const source = { ...grid(), colors };
    setHeightfieldLayerGrid(layer, source);
    const opaque = takeHeightfieldLayerRenderData(layer);
    colors[3] = 254;
    expect(takeHeightfieldLayerRenderData(layer).transparent).toBe(false);
    setHeightfieldLayerColor(layer, [1, 1, 1, 0.5]);
    expect(takeHeightfieldLayerRenderData(layer).transparent).toBe(true);
    setHeightfieldLayerColor(layer, [1, 1, 1, 1]);
    expect(takeHeightfieldLayerRenderData(layer).transparent).toBe(false);
    setHeightfieldLayerGrid(layer, source);
    expect(takeHeightfieldLayerRenderData(layer).transparent).toBe(true);
    colors[3] = 0;
    setHeightfieldLayerGrid(layer, source);
    expect(takeHeightfieldLayerRenderData(layer).transparent).toBe(true);
    expect(opaque.heightfield?.colors?.[3]).toBe(255);
    expect(opaque.transparent).toBe(false);
    setHeightfieldLayerGrid(layer, { ...source, spacing: 0 });
    expect(takeHeightfieldLayerRenderData(layer)).toMatchObject({ ready: false, transparent: false });
    colors.fill(255);
    setHeightfieldLayerGrid(layer, source);
    expect(takeHeightfieldLayerRenderData(layer)).toMatchObject({ ready: true, transparent: false });
    colors[3] = 128;
    setHeightfieldLayerGrid(layer, source);
    setHeightfieldLayerGrid(layer, grid());
    expect(takeHeightfieldLayerRenderData(layer).transparent).toBe(false);
    setHeightfieldLayerGrid(layer, source);
    setHeightfieldLayerGrid(layer, null);
    expect(takeHeightfieldLayerRenderData(layer).transparent).toBe(false);
  });

  it('snapshots grids, retains topology for stable updates, and tracks color', () => {
    const layer = document.createElement('div');
    registerHeightfieldLayer(layer, [0.5, 0.5, 0.5, 1]);
    setHeightfieldLayerColor(layer, [0.5, 0.5, 0.5, 1]);
    const first = grid();
    setHeightfieldLayerGrid(layer, first);
    const topologyVersion = getHeightfieldLayerTopologyVersion(layer);
    const version = getHeightfieldLayerVersion(layer);
    first.heights[0] = 99;
    expect(getHeightfieldLayerGrid(layer)?.heights[0]).toBe(0);
    setHeightfieldLayerGrid(layer, first);
    expect(getHeightfieldLayerGrid(layer)?.heights[0]).toBe(99);
    expect(getHeightfieldLayerTopologyVersion(layer)).toBe(topologyVersion);
    expect(getHeightfieldLayerVersion(layer)).toBeGreaterThan(version);
    expect(takeHeightfieldLayerRenderData(layer)).toMatchObject({ identityInstance: true, ready: true });
    setHeightfieldLayerColor(layer, [1, 1, 1, 0.5]);
    expect(takeHeightfieldLayerRenderData(layer).transparent).toBe(true);
  });

  it('rejects unregistered layers and non-object grid values', () => {
    const layer = document.createElement('div');
    expect(() => getHeightfieldLayerGrid(layer)).toThrow(TypeError);

    const registered = document.createElement('div');
    registerHeightfieldLayer(registered, [0.5, 0.5, 0.5, 1]);
    setHeightfieldLayerGrid(registered, 5);
    expect(takeHeightfieldLayerRenderData(registered).geometryError).toBe(true);
    setHeightfieldLayerGrid(registered, null);
    expect(takeHeightfieldLayerRenderData(registered).geometryError).toBe(false);
  });

  it('reports invalid grid and child episodes and becomes inert', async () => {
    const layer = document.createElement('div');
    registerHeightfieldLayer(layer, [0.5, 0.5, 0.5, 1]);
    const events: string[] = [];
    layer.addEventListener('nve-scene-error', event => events.push((event as CustomEvent).detail.code));
    setHeightfieldLayerGrid(layer, { ...grid(), spacing: 0 });
    expect(takeHeightfieldLayerRenderData(layer).geometryError).toBe(true);
    expect(events).toContain(HEIGHTFIELD_GRID);
    setHeightfieldLayerGrid(layer, grid());
    connectHeightfieldLayer(layer);
    layer.append(document.createElement('span'));
    await new Promise<void>(resolve => queueMicrotask(resolve));
    expect(takeHeightfieldLayerRenderData(layer).geometryError).toBe(true);
    expect(events).toContain(LAYER_CHILD);
  });
});
