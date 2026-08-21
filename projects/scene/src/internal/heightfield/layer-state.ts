// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { HEIGHTFIELD_GRID, LAYER_CHILD } from '../../errors.js';
import { compileHeightfield, recomputeHeightfield } from './compile.js';
import type { HeightfieldGrid } from './types.js';
import { DiagnosticEpisodes } from '../diagnostic-episodes.js';
import { createConstructedMeshRenderData, type MeshRenderData } from '../mesh/layer-state.js';
import type { RGBA } from '../types.js';

interface HeightfieldState {
  childError: boolean;
  color: RGBA;
  compiled: ReturnType<typeof compileHeightfield> | null;
  episodes: DiagnosticEpisodes;
  grid: HeightfieldGrid | null;
  gridError: boolean;
  observer?: MutationObserver;
  topology: HeightfieldTopology | null;
  topologyVersion: number;
  version: number;
}

interface HeightfieldTopology {
  readonly columns: number;
  readonly rows: number;
  readonly spacing: number;
}

const states = new WeakMap<HTMLElement, HeightfieldState>();

export function registerHeightfieldLayer(layer: HTMLElement, color: RGBA): void {
  states.set(layer, {
    childError: false,
    color,
    compiled: null,
    episodes: new DiagnosticEpisodes(),
    grid: null,
    gridError: false,
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
  state.version += 1;
  if (value === null) {
    clearGrid(state);
    updateGridEpisode(layer, state);
    return;
  }
  compileGrid(state, value);
  updateGridEpisode(layer, state);
}

function clearGrid(state: HeightfieldState): void {
  state.grid = null;
  state.compiled = null;
  state.gridError = false;
  state.topology = null;
}

function compileGrid(state: HeightfieldState, value: unknown): void {
  try {
    const grid = snapshotGrid(value);
    const topology = topologyOf(grid);
    state.compiled =
      state.compiled !== null && sameTopology(state.topology, topology)
        ? recomputeHeightfield(grid, state.compiled)
        : compileHeightfield(grid);
    if (!sameTopology(state.topology, topology)) state.topologyVersion += 1;
    state.topology = topology;
    state.grid = grid;
    state.gridError = false;
  } catch {
    state.compiled = null;
    state.grid = null;
    state.gridError = true;
    state.topology = null;
  }
}

function updateGridEpisode(layer: HTMLElement, state: HeightfieldState): void {
  state.episodes.update({
    element: layer,
    code: HEIGHTFIELD_GRID,
    active: state.gridError,
    message: 'Heightfield grid is invalid.',
    severity: 'error'
  });
}

export function setHeightfieldLayerColor(layer: HTMLElement, color: RGBA): void {
  const state = getState(layer);
  if (sameColor(state.color, color)) return;
  state.color = color;
  state.version += 1;
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

export function isHeightfieldLayerRegistered(layer: HTMLElement): boolean {
  return states.has(layer);
}

export function takeHeightfieldLayerRenderData(layer: HTMLElement): MeshRenderData {
  const state = getState(layer);
  const compiled = state.compiled;
  return createConstructedMeshRenderData({
    color: state.color,
    colors: compiled?.colors ?? null,
    geometryError: state.gridError || state.childError,
    identityInstance: true,
    indices: compiled?.indices ?? null,
    normals: compiled?.normals ?? null,
    positions: compiled?.positions ?? null,
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
  if (state.childError !== childError) state.version += 1;
  state.childError = childError;
  state.episodes.update({
    element: layer,
    code: LAYER_CHILD,
    active: childError,
    message: 'Heightfield layers do not allow element children.',
    severity: 'error'
  });
}

function snapshotGrid(value: unknown): HeightfieldGrid {
  if (value === null || typeof value !== 'object') throw new RangeError('Grid must be an object.');
  const candidate = value as Record<string, unknown>;
  const heights = candidate.heights instanceof Float32Array ? new Float32Array(candidate.heights) : candidate.heights;
  const colors = candidate.colors instanceof Uint8Array ? new Uint8Array(candidate.colors) : candidate.colors;
  const origin = Array.isArray(candidate.origin) ? [...candidate.origin] : candidate.origin;
  return {
    columns: candidate.columns as number,
    rows: candidate.rows as number,
    spacing: candidate.spacing as number,
    heights: heights as Float32Array,
    ...(colors === undefined ? {} : { colors: colors as Uint8Array }),
    ...(origin === undefined ? {} : { origin: origin as readonly [number, number] })
  };
}

function topologyOf(grid: HeightfieldGrid): HeightfieldTopology {
  return { columns: grid.columns, rows: grid.rows, spacing: grid.spacing };
}

function sameTopology(left: HeightfieldTopology | null, right: HeightfieldTopology): boolean {
  return left?.columns === right.columns && left.rows === right.rows && left.spacing === right.spacing;
}

function sameColor(left: RGBA, right: RGBA): boolean {
  return left[0] === right[0] && left[1] === right[1] && left[2] === right[2] && left[3] === right[3];
}
