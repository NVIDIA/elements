// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { MODEL_DUAL_SOURCE, PART_SHAPE } from '../../errors.js';
import { compileParts, type ModelPart, validateModelPart } from './compile.js';
import { parseCSSColor } from '../color.js';
import { DiagnosticEpisodes } from '../diagnostic-episodes.js';
import { createConstructedMeshRenderData, type MeshRenderData } from '../mesh/layer-state.js';
import { getLayerInstances } from '../markers/layer-state.js';
import type { Quaternion, RGBA, Vec3 } from '../types.js';
import { notifyOwningScene } from '../label/notifications.js';

interface ModelLayerState {
  compiled: ReturnType<typeof compileParts>;
  episodes: DiagnosticEpisodes;
  geometryError: boolean;
  observer?: MutationObserver;
  parts: ModelPart[] | null;
  aggregateErrorPart?: HTMLElement;
  topologyVersion: number;
  version: number;
}

const states = new WeakMap<HTMLElement, ModelLayerState>();

export function registerModelLayer(layer: HTMLElement): void {
  states.set(layer, {
    compiled: compileParts([]),
    episodes: new DiagnosticEpisodes(),
    geometryError: false,
    parts: null,
    topologyVersion: 0,
    version: 0
  });
}

export function connectModelLayer(layer: HTMLElement): void {
  const state = getState(layer);
  state.observer = new MutationObserver(records => {
    if (records.some(record => record.type === 'childList')) recompileDeclarative(layer, state);
  });
  state.observer.observe(layer, { childList: true });
  recompileDeclarative(layer, state);
}

export function disconnectModelLayer(layer: HTMLElement): void {
  const state = getState(layer);
  state.observer?.disconnect();
  state.observer = undefined;
}

/** Recompiles a model when one of its declarative part properties changes. */
export function notifyOwningModelPart(part: HTMLElement): void {
  const layer = part.parentElement;
  if (layer && isModelLayerRegistered(layer)) recompileDeclarative(layer, getState(layer));
}

/** Validates and stores a bulk source before replacing the rendered geometry. */
export function setModelLayerParts(layer: HTMLElement, parts: ModelPart[] | null): void {
  const state = getState(layer);
  const next = parts === null ? null : cloneParts(parts);
  const compiled = next === null ? null : compileParts(next);
  state.parts = next;
  if (compiled !== null) {
    clearAggregateError(state);
    state.geometryError = false;
    replaceCompiled(state, compiled);
  } else recompileDeclarative(layer, state);
  updateDualSource(layer, state);
  notifyOwningScene(layer);
}

export function getModelLayerVersion(layer: HTMLElement): number {
  return getState(layer).version;
}

export function getModelLayerTopologyVersion(layer: HTMLElement): number {
  return getState(layer).topologyVersion;
}

export function isModelLayerRegistered(layer: HTMLElement): boolean {
  return states.has(layer);
}

export function takeModelLayerRenderData(layer: HTMLElement): MeshRenderData {
  const state = getState(layer);
  const noMarkers =
    getLayerInstances(layer) === null && ![...layer.children].some(child => child.localName === 'nve-scene-marker');
  return createConstructedMeshRenderData({
    color: [1, 1, 1, 1],
    colors: state.compiled.colors,
    geometryError:
      state.geometryError ||
      [...layer.children].some(child => child.localName !== 'nve-scene-marker' && child.localName !== 'nve-scene-part'),
    identityInstance: noMarkers,
    indices: state.compiled.indices,
    normals: state.compiled.normals,
    positions: state.compiled.positions,
    texture: null,
    topologyVersion: state.topologyVersion,
    uvs: null,
    version: state.version
  });
}

function recompileDeclarative(layer: HTMLElement, state: ModelLayerState): void {
  if (state.parts !== null) {
    updateDualSource(layer, state);
    notifyOwningScene(layer);
    return;
  }
  const candidates = [...layer.children].filter(isPartElement).map(part => ({ part, value: readPart(part) }));
  try {
    const compiled = compileParts(candidates.flatMap(candidate => candidate.value ?? []));
    clearAggregateError(state);
    state.geometryError = false;
    replaceCompiled(state, compiled);
  } catch {
    setAggregateError(state, getLatestValidPart(candidates));
    state.geometryError = true;
    replaceCompiled(state, compileParts([]));
  }
  updateDualSource(layer, state);
  notifyOwningScene(layer);
}

function getLatestValidPart(
  candidates: readonly { readonly part: HTMLElement; readonly value: ModelPart | null }[]
): HTMLElement | undefined {
  let latest: HTMLElement | undefined;
  for (const candidate of candidates) {
    if (candidate.value !== null) latest = candidate.part;
  }
  return latest;
}

function clearAggregateError(state: ModelLayerState): void {
  if (state.aggregateErrorPart) updatePartAggregateError(state.aggregateErrorPart, false);
  state.aggregateErrorPart = undefined;
}

function setAggregateError(state: ModelLayerState, part: HTMLElement | undefined): void {
  if (state.aggregateErrorPart && state.aggregateErrorPart !== part)
    updatePartAggregateError(state.aggregateErrorPart, false);
  if (part) updatePartAggregateError(part, true);
  state.aggregateErrorPart = part;
}

function replaceCompiled(state: ModelLayerState, compiled: ReturnType<typeof compileParts>): void {
  state.compiled = compiled;
  state.topologyVersion += 1;
  state.version += 1;
}

function updateDualSource(layer: HTMLElement, state: ModelLayerState): void {
  state.episodes.update({
    active: state.parts !== null && [...layer.children].some(isPartElement),
    code: MODEL_DUAL_SOURCE,
    element: layer,
    message: 'Bulk model parts take precedence over declarative scene parts.',
    severity: 'warning'
  });
}

function readPart(part: HTMLElement): ModelPart | null {
  try {
    const color = parseCSSColor(readString(part, 'color', '#ffffff'));
    if (!color) throw new RangeError('color must be a supported CSS color.');
    const candidate: ModelPart = {
      color: [...color],
      position: readVector3(part, 'position'),
      orientation: readVector4(part, 'orientation'),
      scale: readVector3(part, 'scale'),
      shape: readString(part, 'shape', 'cube') as ModelPart['shape']
    };
    validateModelPart(candidate);
    updatePartInvalidError(part, false);
    return candidate;
  } catch {
    updatePartInvalidError(part, true);
    return null;
  }
}

function readVector3(part: HTMLElement, name: string): Vec3 {
  const values = readVector(part, name, [0, 0, 0]);
  const [x, y, z] = values;
  if (x === undefined || y === undefined || z === undefined) throw new RangeError(`${name} is invalid.`);
  return [x, y, z];
}

function readVector4(part: HTMLElement, name: string): Quaternion {
  const values = readVector(part, name, [0, 0, 0, 1]);
  const [x, y, z, w] = values;
  if (x === undefined || y === undefined || z === undefined || w === undefined)
    throw new RangeError(`${name} is invalid.`);
  return [x, y, z, w];
}

function readVector(part: HTMLElement, name: string, fallback: readonly number[]): readonly number[] {
  const values = Reflect.get(part, name) ?? fallback;
  if (
    !Array.isArray(values) ||
    values.length !== fallback.length ||
    values.some(value => typeof value !== 'number' || !Number.isFinite(value))
  )
    throw new RangeError(`${name} is invalid.`);
  return [...values];
}

function updatePartInvalidError(part: HTMLElement, active: boolean): void {
  const state = getPartErrorState(part);
  state.invalid = active;
  updatePartError(part, state);
}

function updatePartAggregateError(part: HTMLElement, active: boolean): void {
  const state = getPartErrorState(part);
  state.aggregate = active;
  updatePartError(part, state);
}

function updatePartError(part: HTMLElement, state: PartErrorState): void {
  state.episodes.update({
    active: state.invalid || state.aggregate,
    code: PART_SHAPE,
    element: part,
    message: 'Scene part shape or transform is invalid.',
    severity: 'error'
  });
}

interface PartErrorState {
  aggregate: boolean;
  episodes: DiagnosticEpisodes;
  invalid: boolean;
}

const partErrorStates = new WeakMap<HTMLElement, PartErrorState>();
function getPartErrorState(part: HTMLElement): PartErrorState {
  let state = partErrorStates.get(part);
  if (!state) {
    state = { aggregate: false, episodes: new DiagnosticEpisodes(), invalid: false };
    partErrorStates.set(part, state);
  }
  return state;
}

function isPartElement(element: Element): element is HTMLElement {
  return element.localName === 'nve-scene-part';
}

function readString(element: HTMLElement, name: string, fallback: string): string {
  const value = Reflect.get(element, name);
  return typeof value === 'string' ? value : fallback;
}

function getState(layer: HTMLElement): ModelLayerState {
  const state = states.get(layer);
  if (!state) throw new TypeError('Element is not a registered scene model.');
  return state;
}

function cloneParts(parts: ModelPart[]): ModelPart[] {
  return parts.map(part => ({
    ...part,
    ...(part.color ? { color: [...part.color] as RGBA } : {}),
    ...(part.position ? { position: [...part.position] as Vec3 } : {}),
    ...(part.orientation ? { orientation: [...part.orientation] as Quaternion } : {}),
    ...(part.scale ? { scale: [...part.scale] as Vec3 } : {})
  }));
}
