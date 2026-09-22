// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PART_SHAPE } from '../../diagnostics/errors.js';
import {
  compileNormalizedParts,
  compileParts,
  normalizeModelPart,
  type ModelPart,
  type NormalizedModelPart
} from './compile.js';
import { diagnosticReporterService } from '../../diagnostics/reporter.service.js';
import { createConstructedMeshRenderData, type MeshRenderData } from '../mesh/render-data.js';
import { getLayerInstances } from '../markers/layer-state.js';
import type { Quaternion, Vec3 } from '../../math/types.js';
import { notifyOwningScene } from '../../composition/scene/notifications.js';
import { SCENE_PART_TAG } from '../registry.js';
import type { SceneModelGeometry } from './types.js';
import { compileModelGeometry, type CompiledModelGeometry } from './geometry.js';
import { resolveSceneColor } from '../../records/packed-record-buffer.js';
import type { SceneColor, RGBA } from '../../color/types.js';

interface ModelLayerState {
  compiled: CompiledModelGeometry;
  geometry: SceneModelGeometry | null;
  input: 'children' | 'geometry' | 'asset';
  tint: RGBA;
  geometryError: boolean;
  observer?: MutationObserver;
  aggregateErrorPart?: HTMLElement;
  topologyVersion: number;
  version: number;
}

const states = new WeakMap<HTMLElement, ModelLayerState>();

export function registerModelLayer(layer: HTMLElement): void {
  states.set(layer, {
    compiled: compileParts([]),
    geometryError: false,
    geometry: [],
    input: 'children',
    tint: [1, 1, 1, 1],
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

/** Captures geometry before replacing its input authority. */
export function setModelLayerGeometry(
  layer: HTMLElement,
  geometry: SceneModelGeometry | null,
  input: 'geometry' | 'asset' = 'geometry'
): void {
  const state = getState(layer);
  const compiled = geometry === null ? null : compileModelGeometry(geometry);
  state.input = geometry === null ? 'children' : input;
  state.geometry = geometry;
  if (compiled !== null) {
    clearAggregateError(state);
    state.geometryError = false;
    replaceCompiled(state, compiled);
  } else recompileDeclarative(layer, state);
  notifyOwningScene(layer);
}

/** Current resolved data; renderer captures have separate ownership. */
export function getModelLayerGeometry(layer: HTMLElement): SceneModelGeometry | null {
  return getState(layer).geometry;
}

/** Selects an unresolved file input and clears the previous rendered contribution. */
export function beginModelLayerAsset(layer: HTMLElement): void {
  const state = getState(layer);
  clearAggregateError(state);
  state.input = 'asset';
  state.geometry = null;
  state.geometryError = false;
  replaceCompiled(state, compileParts([]));
  notifyOwningScene(layer);
}

export function failModelLayerAsset(layer: HTMLElement): void {
  getState(layer).geometryError = true;
  notifyOwningScene(layer);
}

/** Updates the shader color factor without recompiling captured geometry. */
export function setModelLayerTint(layer: HTMLElement, tint: SceneColor): void {
  const color = resolveSceneColor(tint);
  const state = getState(layer);
  state.tint = color;
  state.version += 1;
  notifyOwningScene(layer);
}

export function getModelLayerTopologyVersion(layer: HTMLElement): number {
  return getState(layer).topologyVersion;
}

export function isModelLayerRegistered(layer: HTMLElement): boolean {
  return states.has(layer);
}

export function takeModelLayerRenderData(layer: HTMLElement): MeshRenderData {
  const state = getState(layer);
  const identityInstance = getLayerInstances(layer) === null;
  return createConstructedMeshRenderData({
    color: state.tint,
    colors: state.compiled.colors,
    geometryError:
      state.geometryError ||
      (state.input === 'children' && [...layer.children].some(child => child.localName !== SCENE_PART_TAG)),
    identityInstance,
    indices: state.compiled.indices,
    normals: state.compiled.normals,
    positions: state.compiled.positions,
    texture: null,
    topologyVersion: state.topologyVersion,
    uvs: state.compiled.uvs ?? null,
    version: state.version
  });
}

function recompileDeclarative(layer: HTMLElement, state: ModelLayerState): void {
  if (state.input !== 'children') return;
  const candidates = [...layer.children].filter(isPartElement).map(part => ({ part, value: readPart(part) }));
  try {
    const geometry = candidates.flatMap(candidate => candidate.value ?? []);
    const compiled = compileNormalizedParts(geometry);
    state.geometry = geometry;
    clearAggregateError(state);
    state.geometryError = false;
    replaceCompiled(state, compiled);
  } catch {
    setAggregateError(state, getLatestValidPart(candidates));
    state.geometryError = true;
    state.geometry = null;
    replaceCompiled(state, compileParts([]));
  }
  notifyOwningScene(layer);
}

function getLatestValidPart(
  candidates: readonly { readonly part: HTMLElement; readonly value: NormalizedModelPart | null }[]
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

function replaceCompiled(state: ModelLayerState, compiled: CompiledModelGeometry): void {
  state.compiled = compiled;
  state.topologyVersion += 1;
  state.version += 1;
}

function readPart(part: HTMLElement): NormalizedModelPart | null {
  try {
    const candidate: ModelPart = {
      color: readString(part, 'color', '#ffffff'),
      position: readVector3(part, 'position', [0, 0, 0]),
      orientation: readVector4(part, 'orientation'),
      scale: readVector3(part, 'scale', [1, 1, 1]),
      shape: readString(part, 'shape', 'cube') as ModelPart['shape']
    };
    const normalized = normalizeModelPart(candidate, 'part');
    updatePartInvalidError(part, false);
    return normalized;
  } catch {
    updatePartInvalidError(part, true);
    return null;
  }
}

function readVector3(part: HTMLElement, name: string, fallback: Readonly<Vec3>): Vec3 {
  const values = readVector(part, name, fallback);
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
  const property = Reflect.get(part, name);
  const attribute = part.getAttribute(name);
  const values = property ?? (attribute === null ? fallback : (JSON.parse(attribute) ?? fallback));
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
  diagnosticReporterService.update({
    active: state.invalid || state.aggregate,
    code: PART_SHAPE,
    element: part,
    message: 'Scene part shape or transform is invalid.',
    severity: 'error'
  });
}

interface PartErrorState {
  aggregate: boolean;
  invalid: boolean;
}

const partErrorStates = new WeakMap<HTMLElement, PartErrorState>();
function getPartErrorState(part: HTMLElement): PartErrorState {
  let state = partErrorStates.get(part);
  if (!state) {
    state = { aggregate: false, invalid: false };
    partErrorStates.set(part, state);
  }
  return state;
}

function isPartElement(element: Element): element is HTMLElement {
  return element.localName === SCENE_PART_TAG;
}

function readString(element: HTMLElement, name: string, fallback: string): string {
  const value = Reflect.get(element, name);
  return typeof value === 'string' ? value : (element.getAttribute(name) ?? fallback);
}

function getState(layer: HTMLElement): ModelLayerState {
  const state = states.get(layer);
  if (!state) throw new TypeError('Element is not a registered scene model.');
  return state;
}
