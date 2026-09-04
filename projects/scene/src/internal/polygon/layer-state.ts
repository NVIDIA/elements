// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { POLYGON_GEOMETRY } from '../../errors.js';
import { parseCSSColor } from '../color.js';
import { DiagnosticEpisodes } from '../diagnostic-episodes.js';
import { notifyOwningScene } from '../label/notifications.js';
import { getLayerCount, getLayerInstances } from '../markers/layer-state.js';
import { createConstructedMeshRenderData, type MeshRenderData } from '../mesh/layer-state.js';
import type { RGBA } from '../types.js';
import { compilePolygon, type CompiledPolygon } from './compile.js';
import type { PolygonGeometry } from './types.js';

interface PolygonState {
  color: RGBA;
  compiled: CompiledPolygon | null;
  geometryError: boolean;
  episodes: DiagnosticEpisodes;
  topologyVersion: number;
  version: number;
}

const states = new WeakMap<HTMLElement, PolygonState>();

export function registerPolygonLayer(layer: HTMLElement, color: RGBA): void {
  states.set(layer, {
    color,
    compiled: null,
    geometryError: false,
    episodes: new DiagnosticEpisodes(),
    topologyVersion: 0,
    version: 0
  });
}

/** Snapshot and compile one geometry assignment before returning to author code. */
export function setPolygonLayerGeometry(layer: HTMLElement, value: unknown): void {
  const state = getState(layer);
  const previous = state.compiled;
  state.version += 1;
  if (value === null || value === undefined) {
    state.compiled = null;
    state.geometryError = false;
  } else {
    try {
      state.compiled = compilePolygon(value);
      state.geometryError = false;
    } catch {
      state.compiled = null;
      state.geometryError = true;
    }
  }
  if (!sameTopology(previous, state.compiled)) state.topologyVersion += 1;
  state.episodes.update({
    active: state.geometryError,
    code: POLYGON_GEOMETRY,
    element: layer,
    message: 'Polygon geometry is invalid.',
    severity: 'error'
  });
  notifyOwningScene(layer);
}

export function setPolygonLayerColor(layer: HTMLElement, source: string): RGBA {
  const color = parseCSSColor(source) ?? [1, 1, 1, 1];
  const state = getState(layer);
  if (!sameColor(state.color, color)) {
    state.color = color;
    state.version += 1;
    notifyOwningScene(layer);
  }
  return [...color] as RGBA;
}

export function getPolygonLayerVersion(layer: HTMLElement): number {
  return getState(layer).version;
}

export function getPolygonLayerTopologyVersion(layer: HTMLElement): number {
  return getState(layer).topologyVersion;
}

export function getPolygonLayerGeometry(layer: HTMLElement): PolygonGeometry | null {
  const compiled = getState(layer).compiled;
  return compiled ? { outer: compiled.outer, holes: compiled.holes } : null;
}

export function isPolygonLayerRegistered(layer: HTMLElement): boolean {
  return states.has(layer);
}

export function takePolygonLayerRenderData(layer: HTMLElement): MeshRenderData {
  const state = getState(layer);
  const compiled = state.compiled;
  const markerSource = getLayerInstances(layer);
  const markerCount = getLayerCount(layer);
  const hasMarkers = layer.children.length > 0;
  return createConstructedMeshRenderData({
    color: state.color,
    colors: null,
    geometryError: state.geometryError,
    identityInstance: markerSource === null && !hasMarkers && markerCount === undefined,
    indices: compiled?.indices ?? null,
    normals: compiled?.normals ?? null,
    positions: compiled?.positions ?? null,
    shading: 'unlit',
    texture: null,
    topologyVersion: state.topologyVersion,
    uvs: null,
    version: state.version
  });
}

function sameTopology(previous: CompiledPolygon | null, next: CompiledPolygon | null): boolean {
  if (previous === next) return true;
  if (previous === null || next === null || previous.positions.length !== next.positions.length) return false;
  if (previous.indices.length !== next.indices.length) return false;
  return previous.indices.every((index, offset) => index === next.indices[offset]);
}

function sameColor(left: RGBA, right: RGBA): boolean {
  return left.every((channel, index) => channel === right[index]);
}

function getState(layer: HTMLElement): PolygonState {
  const state = states.get(layer);
  if (!state) throw new TypeError('Element is not a registered scene polygon.');
  return state;
}
