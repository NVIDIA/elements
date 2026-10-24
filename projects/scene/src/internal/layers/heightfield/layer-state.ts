// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { HEIGHTFIELD_GRID, LAYER_CHILD } from '../../diagnostics/errors.js';
import { sameRGBA } from '../../color/rgba.js';
import { EMPTY_ALPHA_SUMMARY, summarizeRGBAAlpha, type AlphaSummary } from '../../color/alpha.js';
import { validateHeightfieldHeights } from './compile.js';
import { readHeightfieldGrid, type CapturedHeightfieldGrid } from './capture.js';
import { assertSynchronousCapture, SynchronousCaptureLimitError } from '../../rendering/capture.js';
import { getHeightfieldTopology, hasSameHeightfieldTopology, type HeightfieldTopology } from './topology.js';
import type { HeightfieldGrid } from './types.js';
import { diagnosticReporterService } from '../../diagnostics/reporter.service.js';
import { createConstructedMeshRenderData, type MeshRenderData } from '../mesh/render-data.js';
import type { RGBA } from '../../color/types.js';
import { notifyOwningScene } from '../../composition/scene/notifications.js';
import { prepareHeightfieldSampler } from './query.js';
import type { PreparedGridSampler } from '../../math/grid-sampling.js';

interface HeightfieldState {
  alphaSummary: AlphaSummary;
  childError: boolean;
  color: RGBA;
  grid: HeightfieldGrid | null;
  gridError: boolean;
  observer?: MutationObserver;
  sampler: PreparedGridSampler | null;
  topology: HeightfieldTopology | null;
  topologyVersion: number;
  version: number;
}

const states = new WeakMap<HTMLElement, HeightfieldState>();

export function registerHeightfieldLayer(layer: HTMLElement, color: RGBA): void {
  states.set(layer, {
    alphaSummary: EMPTY_ALPHA_SUMMARY,
    childError: false,
    color,
    grid: null,
    gridError: false,
    sampler: null,
    topology: null,
    topologyVersion: 0,
    version: 0
  });
}

export function connectHeightfieldLayer(layer: HTMLElement): void {
  const state = getState(layer);
  state.observer = new MutationObserver(() => validateChildren(layer, state));
  state.observer.observe(layer, { childList: true });
  validateChildren(layer, state);
}

export function disconnectHeightfieldLayer(layer: HTMLElement): void {
  const state = getState(layer);
  state.observer?.disconnect();
  state.observer = undefined;
}

/** Store a private grid snapshot, compiling it into renderer-owned geometry. */
export function setHeightfieldLayerGrid(layer: HTMLElement, value: unknown): void {
  const state = getState(layer);
  if (value === null) {
    state.version += 1;
    clearGrid(state);
    updateGridEpisode(layer, state);
    notifyOwningScene(layer);
    return;
  }
  compileGrid(state, value);
  state.version += 1;
  updateGridEpisode(layer, state);
  notifyOwningScene(layer);
}

function clearGrid(state: HeightfieldState): void {
  state.alphaSummary = EMPTY_ALPHA_SUMMARY;
  state.grid = null;
  state.sampler = null;
  state.gridError = false;
  state.topology = null;
}

function compileGrid(state: HeightfieldState, value: unknown): void {
  try {
    const grid = snapshotGrid(value);
    validateHeightfieldHeights(grid.heights);
    installGrid(state, { grid, alphaSummary: summarizeRGBAAlpha(grid.colors ?? null) });
  } catch (error) {
    if (error instanceof SynchronousCaptureLimitError) throw error;
    state.alphaSummary = EMPTY_ALPHA_SUMMARY;
    state.grid = null;
    state.sampler = null;
    state.gridError = true;
    state.topology = null;
  }
}

/** Publishes a complete validated snapshot without scanning the samples again. */
export function applyCapturedHeightfieldGrid(layer: HTMLElement, capture: CapturedHeightfieldGrid): void {
  const state = getState(layer);
  installGrid(state, capture);
  state.version += 1;
  updateGridEpisode(layer, state);
  notifyOwningScene(layer);
}

function installGrid(state: HeightfieldState, { grid, alphaSummary }: CapturedHeightfieldGrid): void {
  const topology = getHeightfieldTopology(grid);
  state.sampler = prepareHeightfieldSampler(grid);
  state.alphaSummary = alphaSummary;
  if (!hasSameHeightfieldTopology(state.topology, topology)) state.topologyVersion += 1;
  state.topology = topology;
  state.grid = grid;
  state.gridError = false;
}

function updateGridEpisode(layer: HTMLElement, state: HeightfieldState): void {
  diagnosticReporterService.update({
    element: layer,
    code: HEIGHTFIELD_GRID,
    active: state.gridError,
    message: 'Heightfield grid is invalid.',
    severity: 'error'
  });
}

export function setHeightfieldLayerColor(layer: HTMLElement, color: RGBA): void {
  const state = getState(layer);
  if (sameRGBA(state.color, color)) return;
  state.color = color;
  state.version += 1;
  notifyOwningScene(layer);
}

export function getHeightfieldLayerVersion(layer: HTMLElement): number {
  return getState(layer).version;
}

export function getHeightfieldLayerTopologyVersion(layer: HTMLElement): number {
  return getState(layer).topologyVersion;
}

export function getHeightfieldLayerGrid(layer: HTMLElement): HeightfieldGrid | null {
  return getState(layer).grid;
}

export function getHeightfieldLayerSampler(layer: HTMLElement): PreparedGridSampler | null {
  return getState(layer).sampler;
}

export function isHeightfieldLayerRegistered(layer: HTMLElement): boolean {
  return states.has(layer);
}

export function takeHeightfieldLayerRenderData(layer: HTMLElement): MeshRenderData {
  const state = getState(layer);
  const grid = state.grid;
  return createConstructedMeshRenderData({
    alphaSummary: state.alphaSummary,
    color: state.color,
    colors: null,
    geometryError: state.gridError || state.childError,
    ...(grid
      ? {
          heightfield: {
            colors: grid.colors ?? null,
            columns: grid.columns,
            heights: grid.heights,
            origin: grid.origin ?? [0, 0],
            rows: grid.rows,
            spacing: grid.spacing
          }
        }
      : {}),
    identityInstance: true,
    indices: null,
    normals: null,
    positions: null,
    texture: null,
    topologyVersion: state.topologyVersion,
    uvs: null,
    version: state.version
  });
}

function getState(layer: HTMLElement): HeightfieldState {
  const state = states.get(layer);
  if (!state) throw new TypeError('Element is not a registered scene heightfield.');
  return state;
}

function validateChildren(layer: HTMLElement, state: HeightfieldState): void {
  const childError = layer.children.length > 0;
  if (state.childError !== childError) {
    state.version += 1;
    notifyOwningScene(layer);
  }
  state.childError = childError;
  diagnosticReporterService.update({
    element: layer,
    code: LAYER_CHILD,
    active: childError,
    message: 'Heightfield layers do not allow element children.',
    severity: 'error'
  });
}

function snapshotGrid(value: unknown): HeightfieldGrid {
  const grid = readHeightfieldGrid(value);
  assertSynchronousCapture(grid.heights.length + (grid.colors?.length ?? 0), 'grid');
  return {
    ...grid,
    heights: new Float32Array(grid.heights),
    ...(grid.colors ? { colors: new Uint8Array(grid.colors) } : {})
  };
}
