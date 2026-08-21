// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { HEIGHTFIELD_GRID, LAYER_CHILD } from '../../errors.js';
import {
  connectHeightfieldLayer,
  getHeightfieldLayerGrid,
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
  it('snapshots grids, retains topology for stable updates, and tracks color', () => {
    const layer = document.createElement('div');
    registerHeightfieldLayer(layer, [0.5, 0.5, 0.5, 1]);
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
